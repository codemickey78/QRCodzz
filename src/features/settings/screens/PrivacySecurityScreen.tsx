import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../../components/layout/AppScreen';
import { Card } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import {
  permissionExplanations,
  privacyPrinciples,
} from '../../security';
import { BiometricsService } from '../../../services/biometrics/BiometricsService';
import { useTheme } from '../../../theme/useTheme';

export function PrivacySecurityScreen() {
  const { theme } = useTheme();
  const [biometricsAvailable, setBiometricsAvailable] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    BiometricsService.isAvailable().then(available => {
      if (isMounted) {
        setBiometricsAvailable(available);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        card: {
          gap: theme.spacing[12],
        },
        title: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 20,
          lineHeight: 26,
        },
        body: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        row: {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing[4],
          paddingVertical: theme.spacing[12],
        },
        rowTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
        },
        rowMeta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
        },
      }),
    [theme],
  );

  return (
    <AppScreen>
      <View style={styles.stack}>
        <Card style={styles.card}>
          <Text style={styles.title}>Your QR codes stay on your device.</Text>
          {privacyPrinciples.map(principle => (
            <Text key={principle} style={styles.body}>
              {principle}
            </Text>
          ))}
        </Card>

        <SectionHeader title="Permissions" />
        <Card>
          {Object.entries(permissionExplanations).map(([key, explanation]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.rowTitle}>{formatPermissionTitle(key)}</Text>
              <Text style={styles.rowMeta}>{explanation}</Text>
            </View>
          ))}
        </Card>

        <SectionHeader title="Secure Vault" />
        <Card style={styles.card}>
          <Text style={styles.body}>
            Protected entries hide preview text until device authentication
            succeeds. Biometric availability:{' '}
            {biometricsAvailable ? 'available' : 'not connected'}.
          </Text>
        </Card>

        <SectionHeader title="Analytics" />
        <Card style={styles.card}>
          <Text style={styles.body}>
            Analytics events may record product interactions such as
            scanner_opened, qr_created, or batch_started. They must not include
            scanned URLs, barcode values, Wi-Fi credentials, contacts, phone
            numbers, or generated QR contents.
          </Text>
        </Card>
      </View>
    </AppScreen>
  );
}

function formatPermissionTitle(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, first => first.toUpperCase());
}
