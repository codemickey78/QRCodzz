import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Pressable, Share, StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  BrushIcon,
  CheckmarkCircle02Icon,
  Download01Icon,
  PaintBoardIcon,
  Settings03Icon,
  SquareIcon,
  TextSquareIcon,
} from '@hugeicons/core-free-icons';

import {CreateStackParamList} from '../../../app/navigation/navigationTypes';
import {EmptyState} from '../../../components/feedback/EmptyState';
import {LoadingState} from '../../../components/feedback/LoadingState';
import {useAppToast} from '../../../components/feedback/AppToast';
import {FormField} from '../../../components/forms/FormField';
import {AppScreen} from '../../../components/layout/AppScreen';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {FilterChip} from '../../../components/ui/FilterChip';
import {databaseClient} from '../../../database/databaseClient';
import {CodeItem} from '../../../database/entities/CodeItem';
import {useTheme} from '../../../theme/useTheme';
import {QRDesignPreview} from '../components/QRDesignPreview';
import {
  colorPresets,
  defaultQRDesignConfig,
  frameTemplateLabels,
  QRDesignConfig,
  QRFrameTemplate,
} from '../qrDesignTypes';
import {
  fixQRDesign,
  isFrameContentAligned,
  parseQRDesignConfig,
  validateQRDesign,
} from '../qrDesignValidation';
import {usePremium} from '../../premium';
import {createCodePngDataUri, exportCodePngAfterReward} from '../../export';
import {SharingService} from '../../../services/sharing/SharingService';

type QRStudioRoute = RouteProp<CreateStackParamList, 'QRStudio'>;
type QRStudioNavigation = NativeStackNavigationProp<CreateStackParamList, 'QRStudio'>;
type StudioPanel =
  | 'data'
  | 'colors'
  | 'frame'
  | 'export';

const frameTemplates = Object.entries(frameTemplateLabels).map(
  ([value, label]) => ({label, value: value as QRFrameTemplate}),
);

const frameDataTemplates: Partial<Record<QRFrameTemplate, string>> = {
  contactMe: 'BEGIN:VCARD\nVERSION:3.0\nFN:Your Name\nTEL:+1234567890\nEMAIL:hello@example.com\nEND:VCARD',
  downloadApp: 'https://example.com/app',
  followUs: 'https://instagram.com/yourprofile',
  joinWifi: 'WIFI:T:WPA;S:Network Name;P:Password;;',
  leaveReview: 'https://example.com/review',
  openWebsite: 'https://example.com',
  payNow: 'https://example.com/pay',
  viewMenu: 'https://example.com/menu',
};

const frameDataHelp: Partial<Record<QRFrameTemplate, string>> = {
  contactMe: 'Contact frames work best with vCard, mailto:, or tel: QR data.',
  downloadApp: 'Download app frames should point to an app or download URL.',
  followUs: 'Follow frames should point to a social profile URL or @handle.',
  joinWifi: 'Wi-Fi frames use WIFI:T:WPA;S:Network Name;P:Password;; format.',
  leaveReview: 'Review frames should point to a review URL.',
  openWebsite: 'Website frames should use an http or https URL.',
  payNow: 'Payment frames should use a payment link or payment URI.',
  viewMenu: 'Menu frames should point to a menu URL.',
};

function sanitizeSupportedConfig(
  input: Partial<QRDesignConfig>,
): QRDesignConfig {
  return {
    ...defaultQRDesignConfig,
    ...input,
    backgroundTransparent: false,
    colorMode: 'solid',
    eyeCenterStyle: 'square',
    eyeFrameStyle: 'square',
    logoEnabled: false,
    logoUri: undefined,
    moduleStyle: 'classic',
  };
}

export function QRStudioScreen() {
  const route = useRoute<QRStudioRoute>();
  const navigation = useNavigation<QRStudioNavigation>();
  const {theme} = useTheme();
  const showToast = useAppToast();
  const {requestRewardedAccess} = usePremium();
  const [activePanel, setActivePanel] = useState<StudioPanel | undefined>();
  const [code, setCode] = useState<CodeItem | undefined>();
  const [content, setContent] = useState('https://example.com');
  const [config, setConfig] = useState<QRDesignConfig>(defaultQRDesignConfig);
  const [isLoading, setIsLoading] = useState(Boolean(route.params?.codeId));
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!route.params?.codeId) {
      return () => {
        isMounted = false;
      };
    }

    databaseClient.repositories.codes
      .getById(route.params.codeId)
      .then(nextCode => {
        if (isMounted) {
          setCode(nextCode);
          setContent(nextCode?.content ?? 'https://example.com');
          setConfig(
            sanitizeSupportedConfig(parseQRDesignConfig(nextCode?.designConfig)),
          );
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
  }, [route.params?.codeId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        editor: {
          flex: 1,
          gap: theme.spacing[12],
          justifyContent: 'space-between',
        },
        editorHeader: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        editorBadge: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 16,
          height: 36,
          justifyContent: 'center',
          width: 36,
        },
        editorCopy: {
          flex: 1,
        },
        editorTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 18,
          lineHeight: 23,
        },
        editorMeta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 12,
          lineHeight: 17,
        },
        previewPanel: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          flex: 1,
          gap: theme.spacing[8],
          justifyContent: 'center',
          minHeight: 286,
          padding: theme.spacing[12],
        },
        statusRow: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing[8],
        },
        statusText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 18,
          textAlign: 'center',
        },
        toolGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        tool: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexBasis: '23%',
          flexGrow: 1,
          gap: theme.spacing[8],
          minHeight: 72,
          padding: theme.spacing[8],
        },
        toolIcon: {
          alignItems: 'center',
          borderRadius: 15,
          height: 34,
          justifyContent: 'center',
          width: 34,
        },
        toolLabel: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 12,
          lineHeight: 16,
          textAlign: 'center',
        },
        sheetStack: {
          gap: theme.spacing[16],
        },
        sheetTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 20,
          lineHeight: 26,
        },
        sheetLabel: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
          lineHeight: 18,
        },
        helper: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        warning: {
          color: theme.colors.danger,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 19,
        },
        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        actionRow: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        actionButton: {
          flex: 1,
        },
        actionFull: {
          width: '100%',
        },
      }),
    [theme],
  );

  const warnings = validateQRDesign(config, content);

  const updateConfig = useCallback((input: Partial<QRDesignConfig>) => {
    setConfig(current => ({...current, ...sanitizeSupportedConfig(input)}));
    setIsSaved(false);
  }, []);

  const selectFrameTemplate = useCallback(
    (value: QRFrameTemplate) => {
      updateConfig({
        frameTemplate: value,
        frameText:
          value === 'custom' ? config.frameText : frameTemplateLabels[value],
      });

      const template = frameDataTemplates[value];

      if (template && !isFrameContentAligned(value, content)) {
        setContent(template);
        setIsSaved(false);
        showToast(
          'QR data updated',
          `${frameTemplateLabels[value]} uses matching QR data.`,
        );
      }
    },
    [config.frameText, content, showToast, updateConfig],
  );

  const openPanel = useCallback((panel: StudioPanel) => {
    setActivePanel(panel);
  }, []);

  const saveDesign = useCallback(async () => {
    const nextContent = content.trim();

    if (!nextContent) {
      showToast('Data required', 'Add text or a URL before saving this QR.');
      return undefined;
    }

    const supportedConfig = sanitizeSupportedConfig(config);
    const updated = code
      ? await databaseClient.repositories.codes.update(code.id, {
          content: nextContent,
          designConfig: supportedConfig,
        })
      : await databaseClient.repositories.codes.create({
          content: nextContent,
          designConfig: supportedConfig,
          format: 'qr-code',
          isFavorite: false,
          metadata: {createdFrom: 'qrStudio'},
          source: 'generated',
          title: nextContent.slice(0, 48),
          type: 'qr',
        });

    setCode(updated);
    setContent(updated.content);
    setIsSaved(true);
    if (!route.params?.codeId) {
      navigation.setParams({codeId: updated.id});
    }
    showToast('Saved', 'QR Studio design saved to your Library.');
    return updated;
  }, [code, config, content, navigation, route.params?.codeId, showToast]);

  const exportImage = useCallback(async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportCodePngAfterReward(requestRewardedAccess, async () => {
        const savedCode = code ?? (await saveDesign());
        if (!savedCode) {
          throw new Error('Add data to your QR code before exporting.');
        }

        return createCodePngDataUri(
          {...savedCode, content, designConfig: sanitizeSupportedConfig(config)},
          {
            backgroundTransparent: false,
            format: 'png',
            resolution: 1024,
          },
        );
      });
      if (result.reward.status !== 'earned') {
        showToast(
          'Reward unavailable',
          result.reward.message ?? 'Try again when the rewarded ad is ready.',
        );
        return;
      }

      const {image, exportFile} = result;
      await SharingService.shareFile(exportFile.filePath, image.filename);
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
          : 'The QR image could not be exported. Try again.',
      );
    } finally {
      setIsExporting(false);
    }
  }, [
    code,
    config,
    content,
    isExporting,
    requestRewardedAccess,
    saveDesign,
    showToast,
  ]);

  const sharePayload = useCallback(async () => {
    const nextContent = content.trim();
    if (!nextContent) {
      showToast('Data required', 'Add text or a URL before sharing.');
      return;
    }

    await Share.share({message: nextContent});
  }, [content, showToast]);

  if (isLoading) {
    return (
      <AppScreen>
        <LoadingState />
      </AppScreen>
    );
  }

  if (route.params?.codeId && (!code || code.type !== 'qr')) {
    return (
      <AppScreen>
        <EmptyState
          message="QR Studio can only customize saved QR codes."
          title="QR not found"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      contentContainerStyle={{flexGrow: 1}}
      scrollEnabled={false}>
      <View style={styles.editor}>
        <View style={styles.editorHeader}>
          <View style={styles.editorBadge}>
            <HugeiconsIcon
              color={theme.colors.primary}
              icon={BrushIcon}
              size={21}
              strokeWidth={2.3}
            />
          </View>
          <View style={styles.editorCopy}>
            <Text style={styles.editorTitle}>QR Studio</Text>
            <Text style={styles.editorMeta}>
              {content}
            </Text>
          </View>
        </View>
        <View style={styles.previewPanel}>
          <QRDesignPreview config={config} content={content} />
          <View style={styles.statusRow}>
            <HugeiconsIcon
              color={warnings.length ? theme.colors.danger : theme.colors.success}
              icon={warnings.length ? Settings03Icon : CheckmarkCircle02Icon}
              size={18}
              strokeWidth={2.4}
            />
            <Text style={styles.statusText}>
              {warnings.length
                ? `${warnings.length} scan safety note${warnings.length > 1 ? 's' : ''}`
                : `Scan-safe${isSaved ? ' / saved' : ''}`}
            </Text>
          </View>
        </View>

        <View style={styles.toolGrid}>
          <EditorTool color="#2563EB" icon={TextSquareIcon} label="Data" onPress={() => openPanel('data')} styles={styles} />
          <EditorTool color="#F59E0B" icon={PaintBoardIcon} label="Colors" onPress={() => openPanel('colors')} styles={styles} />
          <EditorTool color="#E11D48" icon={SquareIcon} label="Frame" onPress={() => openPanel('frame')} styles={styles} />
          <EditorTool color="#111827" icon={Download01Icon} label="Export" onPress={() => openPanel('export')} styles={styles} />
        </View>
      </View>

      <BottomSheet visible={Boolean(activePanel)} onDismiss={() => setActivePanel(undefined)}>
        <View style={styles.sheetStack}>
          {activePanel === 'data' ? (
            <>
              <Text style={styles.sheetTitle}>QR data</Text>
              <Text style={styles.helper}>
                {frameDataHelp[config.frameTemplate] ??
                  'This text is what the QR code stores. Changes update the preview immediately.'}
              </Text>
              <FormField
                accessibilityLabel="QR Studio data"
                label={
                  config.frameTemplate === 'joinWifi'
                    ? 'Wi-Fi QR payload'
                    : 'Text or URL'
                }
                multiline
                onChangeText={value => {
                  setContent(value);
                  setIsSaved(false);
                }}
                textAlignVertical="top"
                value={content}
              />
            </>
          ) : null}

          {activePanel === 'colors' ? (
            <>
              <Text style={styles.sheetTitle}>Colors</Text>
              <Text style={styles.sheetLabel}>Foreground</Text>
              <View style={styles.row}>
                {colorPresets.map(preset => (
                  <ColorPresetButton
                    color={preset.value}
                    key={preset.value}
                    label={preset.label}
                    onPress={() => updateConfig({foregroundColor: preset.value})}
                    selected={config.foregroundColor === preset.value}
                  />
                ))}
              </View>
              <Text style={styles.sheetLabel}>Background</Text>
              <View style={styles.row}>
                {[
                  {label: 'White', value: '#FFFFFF'},
                  {label: 'Pearl', value: '#F8FAFC'},
                  {label: 'Cream', value: '#FFF7ED'},
                  {label: 'Blue mist', value: '#EFF6FF'},
                  {label: 'Green mist', value: '#ECFDF5'},
                  {label: 'Rose mist', value: '#FFF1F2'},
                  {label: 'Lilac mist', value: '#F5F3FF'},
                  {label: 'Amber mist', value: '#FFFBEB'},
                ].map(preset => (
                  <ColorPresetButton
                    color={preset.value}
                    key={`background-${preset.value}`}
                    label={preset.label}
                    onPress={() => updateConfig({backgroundColor: preset.value})}
                    selected={config.backgroundColor === preset.value}
                  />
                ))}
              </View>
              <Text style={styles.helper}>
                The installed renderer supports solid foreground and background
                colors for exported QR images.
              </Text>
            </>
          ) : null}

          {activePanel === 'frame' ? (
            <>
              <Text style={styles.sheetTitle}>Frame</Text>
              <ChipGroup
                items={frameTemplates}
                onSelect={selectFrameTemplate}
                selected={config.frameTemplate}
              />
              {config.frameTemplate === 'custom' ? (
                <FormField
                  accessibilityLabel="Custom frame text"
                  label="Custom CTA"
                  onChangeText={value => updateConfig({frameText: value})}
                  value={config.frameText}
                />
              ) : null}
              <Text style={styles.helper}>
                Frames are shown around the QR preview and saved with the design.
              </Text>
            </>
          ) : null}

          {activePanel === 'export' ? (
            <>
              <Text style={styles.sheetTitle}>Export</Text>
              <Text style={styles.helper}>
                Export prepares a PNG image job for this QR design. Share sends
                only the QR data text to another app.
              </Text>
              {warnings.length ? (
                warnings.map(warning => (
                  <Text key={warning.key} style={warning.severity === 'warning' ? styles.warning : styles.helper}>
                    {warning.message}
                  </Text>
                ))
              ) : (
                <Text style={styles.helper}>This design stays within scan-safe limits.</Text>
              )}
              {warnings.some(warning => warning.severity === 'warning') ? (
                <SecondaryButton accessibilityLabel="Fix risky QR design automatically" onPress={() => updateConfig(fixQRDesign(config))}>
                  Fix automatically
                </SecondaryButton>
              ) : null}
              <PrimaryButton accessibilityLabel="Export QR design as image" disabled={isExporting} onPress={exportImage} style={styles.actionFull}>
                Export PNG
              </PrimaryButton>
              <View style={styles.actionRow}>
                <SecondaryButton accessibilityLabel="Save QR design" onPress={saveDesign} style={styles.actionButton}>
                  Save
                </SecondaryButton>
                <SecondaryButton accessibilityLabel="Share QR payload" onPress={sharePayload} style={styles.actionButton}>
                  Share
                </SecondaryButton>
              </View>
              <View style={styles.actionRow}>
                <SecondaryButton accessibilityLabel="Close QR Studio export" onPress={() => setActivePanel(undefined)} style={styles.actionButton}>
                  Done
                </SecondaryButton>
              </View>
            </>
          ) : null}
        </View>
      </BottomSheet>
    </AppScreen>
  );
}

function EditorTool({
  color: _color,
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
  const tint = theme.colors.primary;

  return (
    <Pressable
      accessibilityLabel={`Open ${label} editor`}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.tool,
        disabled
          ? {opacity: 0.58}
          : pressed
          ? {opacity: 0.78, transform: [{scale: 0.98}]}
          : null,
      ]}>
      <View style={[styles.toolIcon, {backgroundColor: theme.colors.primarySoft}]}>
        <HugeiconsIcon color={tint} icon={icon} size={21} strokeWidth={2.3} />
      </View>
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}

function ColorPresetButton({
  color,
  label,
  onPress,
  selected = false,
}: {
  color: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          backgroundColor: color,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radii.md,
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          justifyContent: 'center',
          minHeight: 44,
          paddingHorizontal: theme.spacing[12],
        },
        label: {
          color: readableTextColor(color),
          fontFamily: theme.fonts.gb,
          fontSize: 13,
        },
      }),
    [color, selected, theme],
  );

  return (
    <Pressable
      accessibilityLabel={`Use ${label} foreground`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function readableTextColor(backgroundColor: string) {
  const {blue, green, red} = hexToRgb(backgroundColor);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? '#101214' : '#FFFFFF';
}

function hexToRgb(value: string) {
  const normalized = value.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map(character => `${character}${character}`)
          .join('')
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    return {blue: 255, green: 255, red: 255};
  }

  return {
    blue: parseInt(expanded.slice(4, 6), 16),
    green: parseInt(expanded.slice(2, 4), 16),
    red: parseInt(expanded.slice(0, 2), 16),
  };
}

type ChipItem<TValue extends string> = {
  label: string;
  value: TValue;
};

function ChipGroup<TValue extends string>({
  items,
  onSelect,
  selected,
}: {
  items: Array<ChipItem<TValue>>;
  onSelect: (value: TValue) => void;
  selected: TValue;
}) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
      }),
    [theme],
  );

  return (
    <View style={styles.row}>
      {items.map(item => (
        <FilterChip
          key={item.value}
          label={item.label}
          onPress={() => onSelect(item.value)}
          selected={selected === item.value}
        />
      ))}
    </View>
  );
}
