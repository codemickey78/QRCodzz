import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  FavouriteIcon,
  FolderTransferIcon,
  Globe02Icon,
  LockKeyIcon,
  QrCode01Icon,
  Share08Icon,
} from '@hugeicons/core-free-icons';

import { LibraryStackParamList } from '../../../app/navigation/navigationTypes';
import {AdBanner} from '../../../components/ads/AdBanner';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { useAppToast } from '../../../components/feedback/AppToast';
import { FormField } from '../../../components/forms/FormField';
import { AppScreen } from '../../../components/layout/AppScreen';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { databaseClient } from '../../../database/databaseClient';
import { CodeItem } from '../../../database/entities/CodeItem';
import { Folder } from '../../../database/entities/Folder';
import {
  authenticateForVault,
  getCodePreviewText,
  isSensitiveCode,
} from '../../security';
import {createCodePngDataUri, exportCodePngAfterReward} from '../../export';
import { SharingService } from '../../../services/sharing/SharingService';
import {analyticsService} from '../../../services/analytics/PrivacySafeAnalyticsService';
import { useTheme } from '../../../theme/useTheme';
import {usePremium} from '../../premium';

type CodeDetailsNavigation = NativeStackNavigationProp<
  LibraryStackParamList,
  'CodeDetails'
>;
type CodeDetailsRoute = RouteProp<LibraryStackParamList, 'CodeDetails'>;

export function CodeDetailsScreen() {
  const navigation = useNavigation<CodeDetailsNavigation>();
  const route = useRoute<CodeDetailsRoute>();
  const { theme } = useTheme();
  const {requestRewardedAccess} = usePremium();
  const showToast = useAppToast();
  const [code, setCode] = useState<CodeItem | undefined>();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);
  const [renameSheetVisible, setRenameSheetVisible] = useState(false);
  const [isVaultBusy, setIsVaultBusy] = useState(false);

  const loadDetails = useCallback(async () => {
    const [nextCode, nextFolders] = await Promise.all([
      databaseClient.repositories.codes.getById(route.params.codeId),
      databaseClient.repositories.folders.getAll(),
    ]);
    setCode(nextCode);
    setIsUnlocked(false);
    setTitle(nextCode?.title ?? '');
    setFolders(nextFolders);
  }, [route.params.codeId]);

  useEffect(() => {
    let isMounted = true;

    loadDetails().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadDetails]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        heroCard: {
          backgroundColor: theme.colors.black,
          borderRadius: theme.radii.xl,
          gap: theme.spacing[12],
          padding: theme.spacing[16],
        },
        heroTop: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        heroIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          borderRadius: 18,
          height: 42,
          justifyContent: 'center',
          width: 42,
        },
        heroCopy: {
          flex: 1,
          gap: theme.spacing[4],
        },
        heroTitle: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 19,
          lineHeight: 25,
        },
        heroMeta: {
          color: '#ffffffb8',
          fontFamily: theme.fonts.gr,
          fontSize: 12,
          lineHeight: 17,
        },
        payload: {
          color: '#ffffffe6',
          fontFamily: theme.fonts.gr,
          fontSize: 15,
          lineHeight: 22,
        },
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        chip: {
          backgroundColor: '#ffffff1f',
          borderRadius: theme.radii.full,
          paddingHorizontal: theme.spacing[8],
          paddingVertical: theme.spacing[4],
        },
        chipText: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gs,
          fontSize: 11,
          lineHeight: 14,
        },
        detailsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        detailTile: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing[4],
          minHeight: 74,
          padding: theme.spacing[12],
          width: '47%',
        },
        detailKey: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 11,
          lineHeight: 15,
          textTransform: 'uppercase',
        },
        detailValue: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
          lineHeight: 19,
        },
        actionGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[12],
        },
        actionCard: {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          minHeight: 68,
          padding: theme.spacing.md,
          width: '47%',
        },
        actionIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 16,
          height: 36,
          justifyContent: 'center',
          width: 36,
        },
        dangerIcon: {
          backgroundColor: theme.colors.dangerSoft,
        },
        actionTitle: {
          color: theme.colors.textPrimary,
          flexShrink: 1,
          fontFamily: theme.fonts.gb,
          fontSize: 13,
          lineHeight: 17,
        },
        dangerTitle: {
          color: theme.colors.danger,
        },
        sheetTitle: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
        },
        sheetStack: {
          gap: theme.spacing[12],
        },
        sheetActions: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        sheetButton: {
          flex: 1,
        },
        folderOption: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: 58,
          paddingHorizontal: theme.spacing[12],
        },
        folderOptionActive: {
          backgroundColor: theme.colors.primarySoft,
          borderColor: theme.colors.primary,
        },
        folderOptionText: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
        folderOptionMeta: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
      }),
    [theme],
  );

  const updateCode = useCallback(
    async (input: Partial<Omit<CodeItem, 'createdAt' | 'id'>>) => {
      if (!code) {
        return;
      }

      const updated = await databaseClient.repositories.codes.update(
        code.id,
        input,
      );
      setCode(updated);
      setTitle(updated.title ?? '');
    },
    [code],
  );

  const renameCode = useCallback(async () => {
    if (!title.trim()) {
      showToast('Name required', 'Enter a name before renaming this item.');
      return;
    }

    await updateCode({ title: title.trim() });
    setRenameSheetVisible(false);
    showToast('Name updated', 'The saved code name was updated.');
  }, [showToast, title, updateCode]);

  const duplicateCode = useCallback(async () => {
    if (!code) {
      return;
    }

    const duplicated = await databaseClient.repositories.codes.create({
      content: code.content,
      description: code.description,
      designConfig: code.designConfig,
      folderId: code.folderId,
      format: code.format,
      isFavorite: false,
      metadata: code.metadata,
      source: code.source,
      title: code.title ? `${code.title} copy` : 'Code copy',
      type: code.type,
    });
    navigation.replace('CodeDetails', { codeId: duplicated.id });
  }, [code, navigation]);

  const createQrFromScanned = useCallback(async () => {
    if (!code) {
      return;
    }

    const created = await databaseClient.repositories.codes.create({
      content: code.content,
      format: 'qr-code',
      isFavorite: false,
      metadata: {
        createdFromCodeId: code.id,
      },
      source: 'generated',
      title: code.title ? `${code.title} QR` : 'Created QR',
      type: 'qr',
    });
    navigation.replace('CodeDetails', { codeId: created.id });
  }, [code, navigation]);

  const moveCodeToFolder = useCallback(async (folderId?: string) => {
    if (!code) {
      return;
    }

    await updateCode({ folderId });
    setFolderSheetVisible(false);
    showToast(
      'Folder updated',
      folderId
        ? `Moved to ${folders.find(folder => folder.id === folderId)?.name ?? 'folder'}.`
        : 'Moved to Uncategorized.',
    );
  }, [code, folders, showToast, updateCode]);

  const deleteCode = useCallback(async () => {
    if (!code) {
      return;
    }

    if (!deleteArmed) {
      setDeleteArmed(true);
      showToast('Delete item?', 'Tap Delete again to remove this saved code.');
      return;
    }

    await databaseClient.repositories.codes.delete(code.id);
    navigation.goBack();
  }, [code, deleteArmed, navigation, showToast]);

  const toggleVaultProtection = useCallback(async () => {
    if (!code || isVaultBusy) {
      return;
    }

    if (!code.isProtected) {
      setIsVaultBusy(true);
      try {
        const reward = await requestRewardedAccess('secureVault');
        if (reward.status !== 'earned') {
          showToast(
            'Reward unavailable',
            reward.message ?? 'Try again when the rewarded ad is ready.',
          );
          return;
        }

        await updateCode({ isProtected: true });
        setIsUnlocked(false);
        showToast('Protected', 'This item is now hidden behind Secure Vault.');
      } finally {
        setIsVaultBusy(false);
      }
      return;
    }

    const auth = await authenticateForVault('Remove secure vault protection');

    if (!auth.success) {
      showToast('Authentication unavailable', auth.message);
      return;
    }

    await updateCode({ isProtected: false });
    setIsUnlocked(true);
  }, [code, isVaultBusy, requestRewardedAccess, showToast, updateCode]);

  const unlockCode = useCallback(async () => {
    if (!code) {
      return;
    }

    const auth = await authenticateForVault('Unlock protected saved code');

    if (!auth.success) {
      showToast('Authentication unavailable', auth.message);
      return;
    }

    setIsUnlocked(true);
  }, [code, showToast]);

  const exportPng = useCallback(async () => {
    if (!code || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportCodePngAfterReward(requestRewardedAccess, () =>
        createCodePngDataUri(code, {
          backgroundTransparent:
            code.type === 'qr' && Boolean(code.designConfig?.backgroundTransparent),
          format: 'png',
          resolution: code.type === 'qr' ? 1024 : 512,
        }),
      );
      if (result.reward.status !== 'earned') {
        showToast(
          'Reward required',
          result.reward.message ?? 'Watch a rewarded ad to export this image.',
        );
        return;
      }

      const {image, exportFile} = result;
      await SharingService.shareFile(exportFile.filePath, image.filename);
      void analyticsService.track('code_exported', {
        format: code.format,
        type: code.type,
      });
      showToast(
        'PNG ready',
        exportFile.savedToGallery
          ? `${image.filename} was saved to Photos and opened for sharing.`
          : `${image.filename} was generated for sharing.`,
      );
    } catch (error) {
      showToast(
        'Export failed',
        error instanceof Error
          ? error.message
          : 'The image could not be exported. Try again.',
      );
    } finally {
      setIsExporting(false);
    }
  }, [code, isExporting, requestRewardedAccess, showToast]);

  if (isLoading) {
    return (
      <AppScreen>
        <LoadingState />
      </AppScreen>
    );
  }

  if (!code) {
    return (
      <AppScreen>
        <EmptyState
          message="This item may have been deleted or moved from local storage."
          title="Code not found"
        />
      </AppScreen>
    );
  }

  const folder = folders.find(nextFolder => nextFolder.id === code.folderId);
  const privacyLabel = code.isProtected
    ? 'Secure vault'
    : isSensitiveCode(code)
    ? 'Sensitive'
    : 'Standard';

  return (
    <AppScreen>
      <View style={styles.stack}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <HugeiconsIcon
                color={theme.colors.white}
                icon={code.type === 'qr' ? QrCode01Icon : Globe02Icon}
                size={24}
                strokeWidth={2.4}
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                {code.title || formatTypeTitle(code.type)}
              </Text>
              <Text style={styles.heroMeta}>
                {code.format} / {folder?.name ?? 'Uncategorized'}
              </Text>
            </View>
          </View>
          <Text selectable style={styles.payload}>
            {getCodePreviewText(code, isUnlocked)}
          </Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{code.source}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{privacyLabel}</Text>
            </View>
            {code.isFavorite ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Favorite</Text>
              </View>
            ) : null}
          </View>
        </View>

        <AdBanner />

        <SectionHeader title="Details" />
        <View style={styles.detailsGrid}>
          <MetadataTile label="Format" value={code.format} styles={styles} />
          <MetadataTile
            label="Folder"
            value={folder?.name ?? 'Uncategorized'}
            styles={styles}
          />
          <MetadataTile label="Privacy" value={privacyLabel} styles={styles} />
          <MetadataTile
            label="Created"
            value={formatDateTime(code.createdAt)}
            styles={styles}
          />
          <MetadataTile
            label="Updated"
            value={formatDateTime(code.updatedAt)}
            styles={styles}
          />
        </View>

        <SectionHeader title="Actions" />
        <View style={styles.actionGrid}>
          <ActionCard
            color="#6E53F9"
            icon={Edit02Icon}
            label="Rename"
            onPress={() => setRenameSheetVisible(true)}
            styles={styles}
          />
          {code.isProtected && !isUnlocked ? (
            <ActionCard
              color="#6E53F9"
              icon={LockKeyIcon}
              label="Unlock"
              onPress={unlockCode}
              styles={styles}
            />
          ) : (
            <ActionCard
              color="#0EA5E9"
              icon={Globe02Icon}
              label="Open"
              onPress={() => openCode(code, showToast)}
              styles={styles}
            />
          )}
          <ActionCard
            color="#F59E0B"
            icon={FavouriteIcon}
            label={code.isFavorite ? 'Favorited' : 'Favorite'}
            onPress={() => updateCode({ isFavorite: !code.isFavorite })}
            styles={styles}
          />
          <ActionCard
            color="#10B981"
            icon={Copy01Icon}
            label="Duplicate"
            onPress={() =>
              code.isProtected && !isUnlocked ? unlockCode() : duplicateCode()
            }
            styles={styles}
          />
          <ActionCard
            color="#2563EB"
            icon={Share08Icon}
            label="Share"
            onPress={() =>
              code.isProtected && !isUnlocked
                ? unlockCode()
                : Share.share({ message: code.content })
            }
            styles={styles}
          />
          <ActionCard
            color="#7C3AED"
            disabled={isExporting}
            icon={Download01Icon}
            label="Export PNG"
            onPress={() =>
              code.isProtected && !isUnlocked ? unlockCode() : exportPng()
            }
            styles={styles}
          />
          <ActionCard
            color="#0F766E"
            icon={FolderTransferIcon}
            label="Move folder"
            onPress={() => setFolderSheetVisible(true)}
            styles={styles}
          />
          <ActionCard
            color="#E11D48"
            icon={Delete02Icon}
            label={deleteArmed ? 'Confirm delete' : 'Delete'}
            onPress={deleteCode}
            styles={styles}
          />
          <ActionCard
            color="#6E53F9"
            icon={LockKeyIcon}
            label={code.isProtected ? 'Remove vault' : 'Protect'}
            disabled={isVaultBusy}
            onPress={toggleVaultProtection}
            styles={styles}
          />
          {code.source === 'scanned' ? (
            <ActionCard
              color="#6E53F9"
              icon={QrCode01Icon}
              label="Create QR"
              onPress={createQrFromScanned}
              styles={styles}
            />
          ) : null}
          {code.source === 'generated' && code.type === 'qr' ? (
            <ActionCard
              color="#0EA5E9"
              icon={QrCode01Icon}
              label="Edit design"
              onPress={() => {
                const parentNavigation = navigation.getParent() as
                  | { navigate: (name: string, params?: object) => void }
                  | undefined;
                parentNavigation?.navigate('Create', {
                  params: {codeId: code.id},
                  screen: 'QRStudio',
                });
              }}
              styles={styles}
            />
          ) : null}
        </View>
      </View>
      <BottomSheet
        onDismiss={() => {
          setRenameSheetVisible(false);
          setTitle(code.title ?? '');
        }}
        snapPoints={['42%']}
        visible={renameSheetVisible}>
        <View style={styles.sheetStack}>
          <Text style={styles.sheetTitle}>Rename code</Text>
          <FormField
            accessibilityLabel="Code name"
            label="Name"
            onChangeText={setTitle}
            value={title}
          />
          <View style={styles.sheetActions}>
            <SecondaryButton
              accessibilityLabel="Cancel code rename"
              onPress={() => {
                setTitle(code.title ?? '');
                setRenameSheetVisible(false);
              }}
              style={styles.sheetButton}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              accessibilityLabel="Save code name"
              onPress={renameCode}
              style={styles.sheetButton}>
              Save
            </PrimaryButton>
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        onDismiss={() => setFolderSheetVisible(false)}
        snapPoints={['48%', '78%']}
        visible={folderSheetVisible}>
        <View style={styles.sheetStack}>
          <Text style={styles.sheetTitle}>Move folder</Text>
          <FolderOption
            active={!code.folderId}
            meta="No folder"
            onPress={() => moveCodeToFolder(undefined)}
            styles={styles}
            title="Uncategorized"
          />
          {[...folders]
            .sort((first, second) => first.name.localeCompare(second.name))
            .map(nextFolder => (
              <FolderOption
                active={code.folderId === nextFolder.id}
                key={nextFolder.id}
                meta="Folder"
                onPress={() => moveCodeToFolder(nextFolder.id)}
                styles={styles}
                title={nextFolder.name}
              />
            ))}
        </View>
      </BottomSheet>
    </AppScreen>
  );
}

function FolderOption({
  active,
  meta,
  onPress,
  styles,
  title,
}: {
  active: boolean;
  meta: string;
  onPress: () => void;
  styles: Record<string, object>;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`Move to ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.folderOption,
        active ? styles.folderOptionActive : null,
        pressed ? {opacity: 0.78, transform: [{scale: 0.99}]} : null,
      ]}>
      <Text numberOfLines={1} style={styles.folderOptionText}>
        {title}
      </Text>
      <Text style={styles.folderOptionMeta}>{active ? 'Current' : meta}</Text>
    </Pressable>
  );
}

function ActionCard({
  color,
  disabled,
  icon,
  label,
  onPress,
  styles,
}: {
  color: string;
  disabled?: boolean;
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  styles: Record<string, object>;
}) {
  const {theme} = useTheme();
  const isDanger = label.toLowerCase().includes('delete');

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionCard,
        disabled
          ? {opacity: 0.58}
          : pressed
          ? {opacity: 0.78, transform: [{scale: 0.98}]}
          : null,
      ]}>
      <View
        style={[
          styles.actionIcon,
          isDanger ? styles.dangerIcon : null,
        ]}>
        <HugeiconsIcon
          color={isDanger ? color : theme.colors.primary}
          icon={icon}
          size={20}
          strokeWidth={2.2}
        />
      </View>
      <Text
        style={[
          styles.actionTitle,
          isDanger ? styles.dangerTitle : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MetadataTile({
  label,
  styles,
  value,
}: {
  label: string;
  styles: Record<string, object>;
  value: string;
}) {
  return (
    <View style={styles.detailTile}>
      <Text style={styles.detailKey}>{label}</Text>
      <Text numberOfLines={2} style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function formatTypeTitle(type: CodeItem['type']) {
  return type === 'qr' ? 'QR code' : 'Barcode';
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

async function openCode(
  code: CodeItem,
  showToast: (title: string, message?: string) => void,
) {
  if (
    /^https?:\/\//i.test(code.content) ||
    /^(mailto|tel|sms|geo):/i.test(code.content)
  ) {
    const canOpen = await Linking.canOpenURL(code.content);

    if (canOpen) {
      await Linking.openURL(code.content);
      return;
    }
  }

  showToast(code.title || 'Saved value', code.content);
}
