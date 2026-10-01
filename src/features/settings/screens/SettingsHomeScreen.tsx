import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  AiScanIcon,
  BookOpen01Icon,
  BrushIcon,
  GiftIcon,
  InformationCircleIcon,
  Settings04Icon,
  Shield01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

import {SettingsStackParamList} from '../../../app/navigation/navigationTypes';
import {AppScreen} from '../../../components/layout/AppScreen';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {SettingsRow} from '../../../components/ui/SettingsRow';
import {SettingsToggle} from '../../../components/ui/SettingsToggle';
import {useAppSettings} from '../../../hooks/useAppSettings';
import {useTheme} from '../../../theme/useTheme';

type SettingsNavigation = NativeStackNavigationProp<
  SettingsStackParamList,
  'SettingsHome'
>;

export function SettingsHomeScreen() {
  const navigation = useNavigation<SettingsNavigation>();
  const {settings, updateScannerSettings} = useAppSettings();
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing.lg,
        },
        overview: {
          gap: theme.spacing.md,
        },
        hero: {
          backgroundColor: theme.colors.black,
          borderRadius: 24,
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
        },
        heroTop: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.md,
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
          gap: theme.spacing.xs,
        },
        heroTitle: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 18,
          lineHeight: 23,
        },
        heroText: {
          color: '#ffffffb8',
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
        },
        statusGrid: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
        },
        statusTile: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flex: 1,
          gap: theme.spacing.xs,
          padding: theme.spacing.md,
        },
        statusTop: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.xs,
        },
        statusLabel: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 11,
          lineHeight: 14,
        },
        statusValue: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
          lineHeight: 18,
          textTransform: 'capitalize',
        },
        shortcutGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        },
        shortcut: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing.sm,
          minHeight: 104,
          padding: theme.spacing.md,
          width: '47%',
        },
        shortcutIcon: {
          alignItems: 'center',
          borderRadius: 15,
          height: 34,
          justifyContent: 'center',
          width: 34,
        },
        shortcutTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 13,
          lineHeight: 17,
        },
        shortcutMeta: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        panel: {
          gap: theme.spacing.sm,
        },
      }),
    [theme],
  );

  return (
    <AppScreen>
      <View style={styles.stack}>
        <View style={styles.overview}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <HugeiconsIcon
                  color={theme.colors.white}
                  icon={Settings04Icon}
                  size={22}
                  strokeWidth={2.2}
                />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Workspace controls</Text>
                <Text style={styles.heroText}>
                  Scanner behavior, appearance, privacy, and local data.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusTile}>
              <View style={styles.statusTop}>
                <HugeiconsIcon
                  color={theme.colors.success}
                  icon={Tick02Icon}
                  size={15}
                  strokeWidth={2.4}
                />
                <Text style={styles.statusLabel}>Privacy</Text>
              </View>
              <Text style={styles.statusValue}>Private</Text>
            </View>
            <View style={styles.statusTile}>
              <View style={styles.statusTop}>
                <HugeiconsIcon
                  color={theme.colors.primary}
                  icon={BrushIcon}
                  size={15}
                  strokeWidth={2.4}
                />
                <Text style={styles.statusLabel}>Theme</Text>
              </View>
              <Text style={styles.statusValue}>
                {settings.appearance.appearance}
              </Text>
            </View>
            <View style={styles.statusTile}>
              <View style={styles.statusTop}>
                <HugeiconsIcon
                  color={theme.colors.primary}
                  icon={AiScanIcon}
                  size={15}
                  strokeWidth={2.4}
                />
                <Text style={styles.statusLabel}>Scanner</Text>
              </View>
              <Text style={styles.statusValue}>
                {settings.scanner.confirmScansManually ? 'Confirm' : 'Auto'}
              </Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Quick access" />
        <View style={styles.shortcutGrid}>
          <SettingsShortcut
            color={theme.colors.primary}
            icon={AiScanIcon}
            meta="Modes and scan rules"
            onPress={() => navigation.navigate('ScannerSettings')}
            styles={styles}
            title="Scanner"
          />
          <SettingsShortcut
            color="#0EA5E9"
            icon={BrushIcon}
            meta="Theme and accent"
            onPress={() => navigation.navigate('Appearance')}
            styles={styles}
            title="Appearance"
          />
          <SettingsShortcut
            color="#10B981"
            icon={Shield01Icon}
            meta="Device-first privacy"
            onPress={() => navigation.navigate('PrivacySecurity')}
            styles={styles}
            title="Privacy"
          />
          <SettingsShortcut
            color="#F59E0B"
            icon={GiftIcon}
            meta="Ad unlocks"
            onPress={() => navigation.navigate('Premium')}
            styles={styles}
            title="Rewards"
          />
          <SettingsShortcut
            color="#4F46E5"
            icon={InformationCircleIcon}
            meta="Version and privacy"
            onPress={() => navigation.navigate('AboutApp')}
            styles={styles}
            title="About app"
          />
          <SettingsShortcut
            color="#E11D48"
            icon={BookOpen01Icon}
            meta="FAQs and support"
            onPress={() => navigation.navigate('HelpSupport')}
            styles={styles}
            title="Help"
          />
        </View>

        <SectionHeader title="Scanner" />
        <View style={styles.panel}>
          <SettingsToggle
            label="Confirm scans manually"
            onValueChange={confirmScansManually =>
              updateScannerSettings({confirmScansManually})
            }
            value={settings.scanner.confirmScansManually}
          />
          <SettingsToggle
            label="Vibrate"
            onValueChange={vibrate => updateScannerSettings({vibrate})}
            value={settings.scanner.vibrate}
          />
          <SettingsRow
            label="Scanner settings"
            onPress={() => navigation.navigate('ScannerSettings')}
            value="Open"
          />
        </View>

        <SectionHeader title="Workspace" />
        <View style={styles.panel}>
          <SettingsRow
            label="Data management"
            onPress={() => navigation.navigate('DataManagement')}
            value="Local"
          />
        </View>
      </View>
    </AppScreen>
  );
}

type SettingsShortcutProps = {
  color: string;
  icon: IconSvgElement;
  meta: string;
  onPress: () => void;
  styles: Record<string, object>;
  title: string;
};

function SettingsShortcut({
  color,
  icon,
  meta,
  onPress,
  styles,
  title,
}: SettingsShortcutProps) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.shortcut,
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}>
      <View style={[styles.shortcutIcon, {backgroundColor: `${color}18`}]}>
        <HugeiconsIcon color={color} icon={icon} size={21} strokeWidth={2.2} />
      </View>
      <View>
        <Text style={styles.shortcutTitle}>{title}</Text>
        <Text style={styles.shortcutMeta}>{meta}</Text>
      </View>
    </Pressable>
  );
}
