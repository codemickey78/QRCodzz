import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  Camera01Icon,
  CameraAutomatically01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  RepeatIcon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons';

import {ScannerSettings} from '../../../database/entities/AppSettings';
import {useAppSettings} from '../../../hooks/useAppSettings';
import {AppScreen} from '../../../components/layout/AppScreen';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {Card} from '../../../components/ui/Card';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {SettingsRow} from '../../../components/ui/SettingsRow';
import {SettingsToggle} from '../../../components/ui/SettingsToggle';
import {useTheme} from '../../../theme/useTheme';

type PickerKey = 'mode' | 'camera' | 'duplicates' | 'feedback';

const scanModeOptions: Array<{
  description: string;
  label: string;
  value: ScannerSettings['defaultScanMode'];
}> = [
  {
    description: 'Detect QR codes and supported barcodes automatically.',
    label: 'Automatic',
    value: 'automatic',
  },
  {
    description: 'Prioritize QR codes for faster QR-only sessions.',
    label: 'QR only',
    value: 'qrOnly',
  },
  {
    description: 'Prioritize barcode formats such as EAN, UPC, and Code 128.',
    label: 'Barcode only',
    value: 'barcodeOnly',
  },
  {
    description: 'Use product barcode handling by default.',
    label: 'Products',
    value: 'products',
  },
  {
    description: 'Prepare the scanner for repeated captures.',
    label: 'Batch',
    value: 'batch',
  },
];

const cameraOptions: Array<{
  description: string;
  label: string;
  value: ScannerSettings['preferredCamera'];
}> = [
  {
    description: 'Use the rear camera for normal scanning.',
    label: 'Back camera',
    value: 'back',
  },
  {
    description: 'Use the front camera for mirrored or kiosk setups.',
    label: 'Front camera',
    value: 'front',
  },
];

export function ScannerSettingsScreen() {
  const {settings, updateScannerSettings} = useAppSettings();
  const {theme} = useTheme();
  const [picker, setPicker] = useState<PickerKey | undefined>();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        card: {
          gap: theme.spacing[8],
        },
        hero: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing[12],
          padding: theme.spacing[16],
        },
        heroIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
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
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 18,
          lineHeight: 24,
        },
        heroText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        sheetStack: {
          gap: theme.spacing[12],
        },
        sheetTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 20,
          lineHeight: 26,
        },
        option: {
          alignItems: 'center',
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing[12],
          minHeight: 72,
          padding: theme.spacing[12],
        },
        optionActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        optionIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: 16,
          height: 36,
          justifyContent: 'center',
          width: 36,
        },
        optionCopy: {
          flex: 1,
          gap: theme.spacing.xs,
        },
        optionTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
          lineHeight: 19,
        },
        optionText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 12,
          lineHeight: 17,
        },
        optionTitleActive: {
          color: theme.colors.white,
        },
        optionTextActive: {
          color: '#ffffffcc',
        },
      }),
    [theme],
  );

  const scanner = settings.scanner;
  const feedbackValue = describeFeedback(scanner);

  return (
    <AppScreen>
      <View style={styles.stack}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <HugeiconsIcon
              color={theme.colors.primary}
              icon={CameraAutomatically01Icon}
              size={23}
              strokeWidth={2.3}
            />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Scanner preferences</Text>
            <Text style={styles.heroText}>
              Decide what happens after every scan and which scanner mode opens
              first.
            </Text>
          </View>
        </View>

        <SectionHeader icon={Camera01Icon} title="Capture" />
        <Card style={styles.card}>
          <SettingsRow
            label="Default scan mode"
            onPress={() => setPicker('mode')}
            value={formatScanMode(scanner.defaultScanMode)}
          />
          <SettingsRow
            label="Preferred camera"
            onPress={() => setPicker('camera')}
            value={scanner.preferredCamera === 'back' ? 'Back' : 'Front'}
          />
          <SettingsToggle
            label="Auto zoom"
            onValueChange={autoZoom => updateScannerSettings({autoZoom})}
            value={scanner.autoZoom}
          />
          <SettingsToggle
            label="Continuous scanning"
            onValueChange={continuousScanning =>
              updateScannerSettings({continuousScanning})
            }
            value={scanner.continuousScanning}
          />
        </Card>

        <SectionHeader icon={CheckmarkCircle02Icon} title="After scan" />
        <Card style={styles.card}>
          <SettingsToggle
            label="Manual confirmation"
            onValueChange={confirmScansManually =>
              updateScannerSettings({confirmScansManually})
            }
            value={scanner.confirmScansManually}
          />
          <SettingsRow
            label="Duplicate handling"
            onPress={() => setPicker('duplicates')}
            value={scanner.storeDuplicates ? 'Save duplicates' : 'Skip duplicates'}
          />
          <SettingsToggle
            label="Copy after scan"
            onValueChange={copyAfterScan =>
              updateScannerSettings({copyAfterScan})
            }
            value={scanner.copyAfterScan}
          />
          <SettingsToggle
            label="Open websites automatically"
            onValueChange={automaticallyOpenWebsites =>
              updateScannerSettings({automaticallyOpenWebsites})
            }
            value={scanner.automaticallyOpenWebsites}
          />
        </Card>

        <SectionHeader icon={VolumeHighIcon} title="Feedback" />
        <Card style={styles.card}>
          <SettingsRow
            label="Scan feedback"
            onPress={() => setPicker('feedback')}
            value={feedbackValue}
          />
        </Card>
      </View>

      <BottomSheet visible={Boolean(picker)} onDismiss={() => setPicker(undefined)}>
        <View style={styles.sheetStack}>
          <Text style={styles.sheetTitle}>{sheetTitle(picker)}</Text>
          {picker === 'mode'
            ? scanModeOptions.map(option => (
                <PickerOption
                  description={option.description}
                  icon={CameraAutomatically01Icon}
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    updateScannerSettings({defaultScanMode: option.value});
                    setPicker(undefined);
                  }}
                  selected={scanner.defaultScanMode === option.value}
                  styles={styles}
                />
              ))
            : null}
          {picker === 'camera'
            ? cameraOptions.map(option => (
                <PickerOption
                  description={option.description}
                  icon={Camera01Icon}
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    updateScannerSettings({preferredCamera: option.value});
                    setPicker(undefined);
                  }}
                  selected={scanner.preferredCamera === option.value}
                  styles={styles}
                />
              ))
            : null}
          {picker === 'duplicates' ? (
            <>
              <PickerOption
                description="Ignore repeat values so history stays tidy."
                icon={RepeatIcon}
                label="Skip duplicates"
                onPress={() => {
                  updateScannerSettings({storeDuplicates: false});
                  setPicker(undefined);
                }}
                selected={!scanner.storeDuplicates}
                styles={styles}
              />
              <PickerOption
                description="Save every scan, even when the value already exists."
                icon={Copy01Icon}
                label="Save duplicates"
                onPress={() => {
                  updateScannerSettings({storeDuplicates: true});
                  setPicker(undefined);
                }}
                selected={scanner.storeDuplicates}
                styles={styles}
              />
            </>
          ) : null}
          {picker === 'feedback' ? (
            <>
              <PickerOption
                description="Use vibration and sound after successful scans."
                icon={VolumeHighIcon}
                label="Sound and vibration"
                onPress={() => {
                  updateScannerSettings({playSound: true, vibrate: true});
                  setPicker(undefined);
                }}
                selected={scanner.playSound && scanner.vibrate}
                styles={styles}
              />
              <PickerOption
                description="Use vibration only for quiet scan sessions."
                icon={VolumeHighIcon}
                label="Vibration only"
                onPress={() => {
                  updateScannerSettings({playSound: false, vibrate: true});
                  setPicker(undefined);
                }}
                selected={!scanner.playSound && scanner.vibrate}
                styles={styles}
              />
              <PickerOption
                description="Keep scans silent with no haptic feedback."
                icon={VolumeHighIcon}
                label="Silent"
                onPress={() => {
                  updateScannerSettings({playSound: false, vibrate: false});
                  setPicker(undefined);
                }}
                selected={!scanner.playSound && !scanner.vibrate}
                styles={styles}
              />
            </>
          ) : null}
        </View>
      </BottomSheet>
    </AppScreen>
  );
}

function PickerOption({
  description,
  icon,
  label,
  onPress,
  selected,
  styles,
}: {
  description: string;
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  selected: boolean;
  styles: Record<string, object>;
}) {
  const {theme} = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.option,
        selected ? styles.optionActive : null,
        pressed ? {opacity: 0.78, transform: [{scale: 0.99}]} : null,
      ]}>
      <View style={styles.optionIcon}>
        <HugeiconsIcon
          color={selected ? theme.colors.primary : theme.colors.textSecondary}
          icon={icon}
          size={20}
          strokeWidth={2.3}
        />
      </View>
      <View style={styles.optionCopy}>
        <Text style={[styles.optionTitle, selected ? styles.optionTitleActive : null]}>
          {label}
        </Text>
        <Text style={[styles.optionText, selected ? styles.optionTextActive : null]}>
          {description}
        </Text>
      </View>
      {selected ? (
        <HugeiconsIcon
          color={theme.colors.white}
          icon={CheckmarkCircle02Icon}
          size={20}
          strokeWidth={2.4}
        />
      ) : null}
    </Pressable>
  );
}

function formatScanMode(value: ScannerSettings['defaultScanMode']) {
  return scanModeOptions.find(option => option.value === value)?.label ?? value;
}

function describeFeedback(scanner: ScannerSettings) {
  if (scanner.playSound && scanner.vibrate) {
    return 'Sound + vibration';
  }

  if (scanner.vibrate) {
    return 'Vibration only';
  }

  return 'Silent';
}

function sheetTitle(picker?: PickerKey) {
  switch (picker) {
    case 'mode':
      return 'Default scan mode';
    case 'camera':
      return 'Preferred camera';
    case 'duplicates':
      return 'Duplicate handling';
    case 'feedback':
      return 'Scan feedback';
    default:
      return 'Scanner option';
  }
}
