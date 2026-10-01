import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  ArrowLeft02Icon,
  Download01Icon,
  Edit02Icon,
  FavouriteIcon,
  Share08Icon,
} from '@hugeicons/core-free-icons';

import { CreateStackParamList } from '../../../app/navigation/navigationTypes';
import { databaseClient } from '../../../database/databaseClient';
import { CodeItem } from '../../../database/entities/CodeItem';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FormField } from '../../../components/forms/FormField';
import { AppScreen } from '../../../components/layout/AppScreen';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { useTheme } from '../../../theme/useTheme';
import {
  BarcodeDataUrl,
  BarcodeRenderService,
} from '../../../services/barcode/BarcodeRenderService';
import {getBwipBarcodeDefinition} from '../../../services/barcode/bwipBarcodeCatalog';
import {useAppToast} from '../../../components/feedback/AppToast';
import {usePremium} from '../../premium';
import {createCodePngDataUri, saveCodePngForExport} from '../../export';
import {SharingService} from '../../../services/sharing/SharingService';
import {analyticsService} from '../../../services/analytics/PrivacySafeAnalyticsService';

type PreviewNavigation = NativeStackNavigationProp<
  CreateStackParamList,
  'BarcodePreview'
>;
type PreviewRoute = RouteProp<CreateStackParamList, 'BarcodePreview'>;

export function BarcodePreviewScreen() {
  const navigation = useNavigation<PreviewNavigation>();
  const route = useRoute<PreviewRoute>();
  const { theme } = useTheme();
  const showToast = useAppToast();
  const {requestRewardedAccess} = usePremium();
  const [code, setCode] = useState<CodeItem | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [renameSheetVisible, setRenameSheetVisible] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let isMounted = true;

    databaseClient.repositories.codes
      .getById(route.params.codeId)
      .then(nextCode => {
        if (isMounted) {
          setCode(nextCode);
          setTitle(nextCode?.title ?? '');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [route.params.codeId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        previewFrame: {
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radii.md,
          gap: theme.spacing[12],
          padding: theme.spacing[20],
        },
        payload: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        format: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gb,
          fontSize: 13,
          letterSpacing: 0,
        },
        actionGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[12],
        },
        actionCard: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing[8],
          minHeight: 62,
          paddingHorizontal: 16,
          shadowColor: theme.colors.black,
          shadowOffset: {height: 6, width: 0},
          shadowOpacity: 0.04,
          shadowRadius: 12,
          width: '47%',
        },
        actionCardPrimary: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        actionIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: 18,
          height: 36,
          justifyContent: 'center',
          width: 36,
        },
        actionIconPrimary: {
          backgroundColor: 'rgba(255,255,255,0.18)',
        },
        actionText: {
          color: theme.colors.textPrimary,
          flexShrink: 1,
          ...theme.typography.bodyStrong,
        },
        actionTextPrimary: {
          color: theme.colors.white,
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
      }),
    [theme],
  );

  const renameCode = useCallback(async () => {
    if (!code || !title.trim()) {
      return;
    }

    const updatedCode = await databaseClient.repositories.codes.update(
      code.id,
      {
        title: title.trim(),
      },
    );
    setCode(updatedCode);
    setTitle(updatedCode.title ?? '');
    setRenameSheetVisible(false);
    showToast('Name updated', 'The barcode name was updated.');
  }, [code, showToast, title]);

  const toggleFavorite = useCallback(async () => {
    if (!code) {
      return;
    }

    const updatedCode = await databaseClient.repositories.codes.update(
      code.id,
      {
        isFavorite: !code.isFavorite,
      },
    );
    setCode(updatedCode);
  }, [code]);

  const exportPng = useCallback(async () => {
    if (!code || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const access = await requestRewardedAccess('export');
      if (access.status !== 'earned') {
        showToast(
          'Reward required',
          access.message ?? 'Watch a rewarded ad to export this barcode.',
        );
        return;
      }

      const image = await createCodePngDataUri(code, {
        backgroundTransparent: false,
        format: 'png',
        resolution: 512,
      });
      const exportFile = await saveCodePngForExport(image);
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
          : 'The barcode image could not be exported. Try again.',
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
          message="The generated barcode could not be found in the local library."
          title="Barcode not found"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.stack}>
        <Card>
          <View style={styles.previewFrame}>
            <Text style={styles.format}>{code.format}</Text>
            <PseudoBarcode
              content={code.content}
              format={code.format}
              metadata={code.metadata}
            />
            <Text selectable style={styles.payload}>
              {code.content}
            </Text>
          </View>
        </Card>

        <SectionHeader title="Actions" />

        <View style={styles.actionGrid}>
          <PreviewAction
            icon={Edit02Icon}
            label="Rename"
            onPress={() => setRenameSheetVisible(true)}
            primary
            styles={styles}
          />
          <PreviewAction
            icon={FavouriteIcon}
            label={code.isFavorite ? 'Favorited' : 'Favorite'}
            onPress={toggleFavorite}
            styles={styles}
          />
          <PreviewAction
            icon={Share08Icon}
            label="Share"
            onPress={() => Share.share({message: code.content})}
            styles={styles}
          />
          <PreviewAction
            disabled={isExporting}
            icon={Download01Icon}
            label="PNG"
            onPress={exportPng}
            styles={styles}
          />
          <PreviewAction
            icon={ArrowLeft02Icon}
            label="Edit"
            onPress={() => navigation.goBack()}
            styles={styles}
          />
        </View>
      </View>
      <BottomSheet
        onDismiss={() => {
          setTitle(code.title ?? '');
          setRenameSheetVisible(false);
        }}
        snapPoints={['42%']}
        visible={renameSheetVisible}>
        <View style={styles.sheetStack}>
          <Text style={styles.sheetTitle}>Rename barcode</Text>
          <FormField
            accessibilityLabel="Barcode name"
            label="Name"
            onChangeText={setTitle}
            value={title}
          />
          <View style={styles.sheetActions}>
            <SecondaryButton
              accessibilityLabel="Cancel barcode rename"
              onPress={() => {
                setTitle(code.title ?? '');
                setRenameSheetVisible(false);
              }}
              style={styles.sheetButton}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              accessibilityLabel="Save barcode name"
              onPress={renameCode}
              style={styles.sheetButton}>
              Save
            </PrimaryButton>
          </View>
        </View>
      </BottomSheet>
    </AppScreen>
  );
}

function PreviewAction({
  disabled,
  icon,
  label,
  onPress,
  primary = false,
  styles,
}: {
  disabled?: boolean;
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  primary?: boolean;
  styles: Record<string, object>;
}) {
  const {theme} = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionCard,
        primary ? styles.actionCardPrimary : null,
        disabled
          ? {opacity: 0.58}
          : pressed
            ? {opacity: 0.78, transform: [{scale: 0.98}]}
            : null,
      ]}>
      <View style={[styles.actionIcon, primary ? styles.actionIconPrimary : null]}>
        <HugeiconsIcon
          color={primary ? theme.colors.white : theme.colors.primary}
          icon={icon}
          size={20}
          strokeWidth={2.25}
        />
      </View>
      <Text style={[styles.actionText, primary ? styles.actionTextPrimary : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PseudoBarcode({
  content,
  format,
  metadata,
}: {
  content: string;
  format: string;
  metadata?: Record<string, unknown>;
}) {
  const { theme } = useTheme();
  const [preview, setPreview] = useState<BarcodeDataUrl | undefined>();
  const [previewError, setPreviewError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    setPreview(undefined);
    setPreviewError(undefined);
    BarcodeRenderService.createDataUrl({
        backgroundColor: '#FFFFFF',
        content,
        foregroundColor: '#101214',
        format,
        includeText: true,
        ...barcodeRenderMetadata(metadata),
        padding: 8,
        type: 'barcode',
      })
      .then(result => {
        if (isMounted) {
          setPreview(result);
        }
      })
      .catch(error => {
        if (isMounted) {
          setPreview(undefined);
          setPreviewError(formatPreviewError(error));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [content, format, metadata]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          height: isTwoDimensionalBarcode(format) ? 172 : 116,
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
        },
        fallback: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 18,
          textAlign: 'center',
        },
        barcodeImage: {
          maxHeight: isTwoDimensionalBarcode(format) ? 172 : 116,
          maxWidth: '100%',
        },
      }),
    [format, theme],
  );

  return (
    <View accessibilityLabel="Generated barcode preview" style={styles.root}>
      {preview ? (
        <Image
          resizeMode="contain"
          source={{uri: preview.uri}}
          style={[
            styles.barcodeImage,
            fitBarcode(preview.width, preview.height, isTwoDimensionalBarcode(format)),
          ]}
        />
      ) : (
        <Text style={styles.fallback}>
          {previewError ?? 'Barcode preview unavailable'}
        </Text>
      )}
    </View>
  );
}

function formatPreviewError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.replace(/^bwipp\.[^:]+:\s*/, '');
  }

  return 'Barcode preview unavailable';
}

function fitBarcode(width: number, height: number, isTwoDimensional: boolean) {
  const maxHeight = isTwoDimensional ? 172 : 116;
  const maxWidth = 320;

  if (!width || !height) {
    return {height: maxHeight, width: maxWidth};
  }

  const scale = Math.min(maxWidth / width, maxHeight / height);
  return {
    height: Math.round(height * scale),
    width: Math.round(width * scale),
  };
}

function isTwoDimensionalBarcode(format: string) {
  return Boolean(getBwipBarcodeDefinition(format)?.twoDimensional);
}

function barcodeRenderMetadata(metadata?: Record<string, unknown>) {
  const payload =
    metadata?.payload && typeof metadata.payload === 'object'
      ? (metadata.payload as Record<string, unknown>)
      : {};

  return {
    altText: typeof payload.altText === 'string' ? payload.altText : undefined,
    options: typeof payload.options === 'string' ? payload.options : undefined,
  };
}
