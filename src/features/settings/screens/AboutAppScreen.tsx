import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  QrCode01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';

import {AppScreen} from '../../../components/layout/AppScreen';
import {Card} from '../../../components/ui/Card';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {useTheme} from '../../../theme/useTheme';

const appFacts = [
  'Create QR codes and barcodes from common content types.',
  'Scan from camera or images with local history.',
  'Customize QR designs with scan-safe controls.',
  'Keep sensitive values hidden with Secure Vault.',
] as const;

export function AboutAppScreen() {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        hero: {
          backgroundColor: theme.colors.black,
          borderRadius: theme.radii.xl,
          gap: theme.spacing[16],
          padding: theme.spacing[20],
        },
        logo: {
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          borderRadius: 20,
          height: 48,
          justifyContent: 'center',
          width: 48,
        },
        title: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 26,
          lineHeight: 32,
        },
        body: {
          color: '#ffffffc7',
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 21,
        },
        card: {
          gap: theme.spacing[12],
        },
        row: {
          alignItems: 'flex-start',
          flexDirection: 'row',
          gap: theme.spacing[8],
        },
        rowText: {
          color: theme.colors.textPrimary,
          flex: 1,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        meta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
      }),
    [theme],
  );

  return (
    <AppScreen>
      <View style={styles.stack}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <HugeiconsIcon
              color={theme.colors.white}
              icon={QrCode01Icon}
              size={27}
              strokeWidth={2.4}
            />
          </View>
          <View>
            <Text style={styles.title}>QRCodzz</Text>
            <Text style={styles.body}>
              A local-first QR and barcode workspace for scanning, generating,
              organizing, and designing codes.
            </Text>
          </View>
        </View>

        <SectionHeader icon={InformationCircleIcon} title="What it does" />
        <Card style={styles.card}>
          {appFacts.map(fact => (
            <View key={fact} style={styles.row}>
              <HugeiconsIcon
                color={theme.colors.success}
                icon={CheckmarkCircle02Icon}
                size={19}
                strokeWidth={2.4}
              />
              <Text style={styles.rowText}>{fact}</Text>
            </View>
          ))}
        </Card>

        <SectionHeader icon={Shield01Icon} title="Privacy model" />
        <Card style={styles.card}>
          <Text style={styles.meta}>
            QRCodzz is designed around local storage. Generated and scanned
            values stay on your device unless you choose to share, export, or
            open them.
          </Text>
          <Text style={styles.meta}>
            Ads are used only as rewarded unlocks before selected heavier tools.
            There are no locked feature tiers in the app.
          </Text>
        </Card>
      </View>
    </AppScreen>
  );
}
