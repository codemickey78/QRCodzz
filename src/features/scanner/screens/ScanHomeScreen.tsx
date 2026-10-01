import React, {useMemo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  AiScanIcon,
  FlashIcon,
  ImageUploadIcon,
  QrCode01Icon,
  Settings04Icon,
  ShieldEnergyIcon,
  TransactionHistoryIcon,
} from '@hugeicons/core-free-icons';

import {
  MainTabParamList,
  ScanStackParamList,
} from '../../../app/navigation/navigationTypes';
import {AdBanner} from '../../../components/ads/AdBanner';
import {AppScreen} from '../../../components/layout/AppScreen';
import {PrimaryButton} from '../../../components/ui/Button';
import {useTheme} from '../../../theme/useTheme';

const logoSource = require('../../../assets/img/logo.jpg');

type ScanNavigation = NativeStackNavigationProp<ScanStackParamList, 'ScanHome'>;
type MainTabNavigation = BottomTabNavigationProp<MainTabParamList>;

export function ScanHomeScreen() {
  const navigation = useNavigation<ScanNavigation>();
  const tabNavigation = navigation.getParent<MainTabNavigation>();
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing.md,
        },
        topRow: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        brand: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.md,
        },
        logo: {
          borderRadius: 14,
          height: 40,
          width: 40,
        },
        eyebrow: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        title: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
        },
        flashButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: 22,
          borderWidth: StyleSheet.hairlineWidth,
          height: 44,
          justifyContent: 'center',
          width: 44,
        },
        scannerPanel: {
          backgroundColor: theme.colors.black,
          borderRadius: 22,
          gap: theme.spacing.sm,
          overflow: 'hidden',
          padding: theme.spacing.md,
        },
        scanPreview: {
          alignItems: 'center',
          aspectRatio: 2,
          alignSelf: 'center',
          backgroundColor: '#111318',
          borderColor: '#ffffff28',
          borderRadius: 20,
          borderWidth: 1,
          justifyContent: 'center',
          maxWidth: 112,
          width: '100%',
        },
        corner: {
          borderColor: theme.colors.primary,
          height: 26,
          position: 'absolute',
          width: 26,
        },
        topLeftCorner: {
          borderLeftWidth: 3,
          borderTopWidth: 3,
          left: 13,
          top: 13,
        },
        topRightCorner: {
          borderRightWidth: 3,
          borderTopWidth: 3,
          right: 13,
          top: 13,
        },
        bottomLeftCorner: {
          borderBottomWidth: 3,
          borderLeftWidth: 3,
          bottom: 13,
          left: 13,
        },
        bottomRightCorner: {
          borderBottomWidth: 3,
          borderRightWidth: 3,
          bottom: 13,
          right: 13,
        },
        scanCore: {
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 14,
          height: 60,
          justifyContent: 'center',
          width: 60,
        },
        scanLine: {
          backgroundColor: theme.colors.primary,
          borderRadius: 2,
          height: 3,
          marginTop: theme.spacing.xs,
          width: 42,
        },
        panelCopy: {
          gap: theme.spacing.xs,
        },
        panelTitle: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 17,
          lineHeight: 21,
        },
        panelText: {
          color: '#ffffffb8',
          fontFamily: theme.fonts.gr,
          fontSize: 11,
          lineHeight: 15,
        },
        primaryAction: {
          backgroundColor: theme.colors.primary,
        },
        cardGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        },
        actionCard: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing.sm,
          minHeight: 82,
          padding: theme.spacing.md,
          width: '47%',
        },
        actionIcon: {
          alignItems: 'center',
          borderRadius: 15,
          height: 34,
          justifyContent: 'center',
          width: 34,
        },
        actionTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 12,
          lineHeight: 16,
        },
        actionText: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        securityStrip: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radii.lg,
          flexDirection: 'row',
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
        },
        securityIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.successSoft,
          borderRadius: 18,
          height: 40,
          justifyContent: 'center',
          width: 40,
        },
        securityCopy: {
          flex: 1,
          gap: theme.spacing.xs,
        },
        securityTitle: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
        securityText: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
      }),
    [theme],
  );

  const actionCards: ScanActionCardProps[] = [
    {
      color: theme.colors.primary,
      description: 'Scan QR codes and barcodes automatically.',
      icon: AiScanIcon,
      onPress: () => navigation.navigate('CameraScanner'),
      title: 'Camera scan',
    },
    {
      color: '#0EA5E9',
      description: 'Pick a saved image and scan the code inside it.',
      icon: ImageUploadIcon,
      onPress: () => navigation.navigate('CameraScanner', {openGallery: true}),
      title: 'Scan image',
    },
    {
      color: '#10B981',
      description: 'Jump to your scanned and created code library.',
      icon: TransactionHistoryIcon,
      onPress: () => tabNavigation?.navigate('Library', {screen: 'LibraryHome'}),
      title: 'History',
    },
    {
      color: '#F59E0B',
      description: 'Tune confirmation, vibration, and duplicate handling.',
      icon: Settings04Icon,
      onPress: () =>
        tabNavigation?.navigate('Settings', {screen: 'ScannerSettings'}),
      title: 'Scan settings',
    },
  ];

  return (
    <AppScreen topSafeArea>
      <View style={styles.stack}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <Image source={logoSource} style={styles.logo} />
            <View>
              <Text style={styles.eyebrow}>QRCodzz</Text>
              <Text style={styles.title}>Smart scan</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Open camera with flash controls"
            accessibilityRole="button"
            onPress={() => navigation.navigate('CameraScanner')}
            style={({pressed}) => [
              styles.flashButton,
              pressed ? {opacity: 0.72, transform: [{scale: 0.96}]} : null,
            ]}>
            <HugeiconsIcon
              color={theme.colors.primary}
              icon={FlashIcon}
              size={25}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>

        <View style={styles.scannerPanel}>
          <View style={styles.scanPreview}>
            <View style={[styles.corner, styles.topLeftCorner]} />
            <View style={[styles.corner, styles.topRightCorner]} />
            <View style={[styles.corner, styles.bottomLeftCorner]} />
            <View style={[styles.corner, styles.bottomRightCorner]} />
            <View style={styles.scanCore}>
              <HugeiconsIcon
                color={theme.colors.black}
                icon={QrCode01Icon}
                size={28}
                strokeWidth={1.9}
              />
              <View style={styles.scanLine} />
            </View>
          </View>
          <View style={styles.panelCopy}>
            <Text style={styles.panelTitle}>Point, parse, act.</Text>
            <Text style={styles.panelText}>
              Scan QR codes, barcodes, links, contacts, Wi-Fi, and products.
            </Text>
          </View>
          <PrimaryButton
            accessibilityLabel="Scan using camera"
            onPress={() => navigation.navigate('CameraScanner')}
            style={styles.primaryAction}>
            Start Scan
          </PrimaryButton>
        </View>

        <AdBanner />

        <View style={styles.cardGrid}>
          {actionCards.map(card => (
            <ScanActionCard key={card.title} {...card} styles={styles} />
          ))}
        </View>

        <View style={styles.securityStrip}>
          <View style={styles.securityIcon}>
            <HugeiconsIcon
              color={theme.colors.success}
              icon={ShieldEnergyIcon}
              size={22}
              strokeWidth={2.2}
            />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Local-first scanning</Text>
            <Text style={styles.securityText}>
              Results are saved to your Library on this device.
            </Text>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

type ScanActionCardProps = {
  color: string;
  description: string;
  icon: IconSvgElement;
  onPress?: () => void;
  styles?: Record<string, object>;
  title: string;
};

function ScanActionCard({
  color,
  description,
  icon,
  onPress,
  styles,
  title,
}: ScanActionCardProps) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles?.actionCard,
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}>
      <View style={[styles?.actionIcon, {backgroundColor: `${color}18`}]}>
        <HugeiconsIcon color={color} icon={icon} size={22} strokeWidth={2.2} />
      </View>
      <View>
        <Text style={styles?.actionTitle}>{title}</Text>
        <Text style={styles?.actionText}>{description}</Text>
      </View>
    </Pressable>
  );
}
