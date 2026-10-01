import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {
  AdvertisimentIcon,
  CheckmarkCircle02Icon,
  GiftIcon,
} from '@hugeicons/core-free-icons';

import {AppScreen} from '../../../components/layout/AppScreen';
import {Card} from '../../../components/ui/Card';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {
  PremiumBadge,
  getFeaturesForTier,
  premiumFeatureCatalog,
} from '../../premium';
import {useTheme} from '../../../theme/useTheme';

export function PremiumScreen() {
  const {theme} = useTheme();
  const adUnlockedFeatures = getFeaturesForTier('free').filter(
    feature => feature.adRequired,
  );
  const alwaysFreeFeatures = getFeaturesForTier('free').filter(
    feature => !feature.adRequired,
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        hero: {
          backgroundColor: theme.colors.black,
          borderRadius: theme.radii.xl,
          gap: theme.spacing[12],
          padding: theme.spacing[20],
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
        title: {
          color: theme.colors.white,
          flex: 1,
          fontFamily: theme.fonts.gb,
          fontSize: 21,
          lineHeight: 27,
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
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing[8],
          paddingVertical: theme.spacing[12],
        },
        rowCopy: {
          flex: 1,
          gap: theme.spacing[4],
        },
        rowTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
        rowMeta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        note: {
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
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <HugeiconsIcon
                color={theme.colors.white}
                icon={GiftIcon}
                size={23}
                strokeWidth={2.4}
              />
            </View>
            <Text style={styles.title}>Everything is free</Text>
          </View>
          <Text style={styles.body}>
            QRCodzz does not lock tools behind feature tiers. Some heavier
            actions ask for a rewarded ad before use, then the feature opens
            normally.
          </Text>
        </View>

        <SectionHeader icon={AdvertisimentIcon} title="Rewarded ad unlocks" />
        <Card style={styles.card}>
          <PremiumBadge />
          {adUnlockedFeatures.map(feature => (
            <FeatureRow
              description={feature.description}
              key={feature.feature}
              title={feature.title}
              styles={styles}
            />
          ))}
        </Card>

        <SectionHeader icon={CheckmarkCircle02Icon} title="Always available" />
        <Card style={styles.card}>
          {alwaysFreeFeatures.slice(0, 10).map(feature => (
            <FeatureRow
              description={feature.description}
              key={feature.feature}
              title={feature.title}
              styles={styles}
            />
          ))}
          <Text style={styles.note}>
            {premiumFeatureCatalog.removeAds.description}
          </Text>
        </Card>
      </View>
    </AppScreen>
  );
}

function FeatureRow({
  description,
  styles,
  title,
}: {
  description: string;
  styles: Record<string, object>;
  title: string;
}) {
  const {theme} = useTheme();
  return (
    <View style={styles.row}>
      <HugeiconsIcon
        color={theme.colors.primary}
        icon={CheckmarkCircle02Icon}
        size={19}
        strokeWidth={2.4}
      />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowMeta}>{description}</Text>
      </View>
    </View>
  );
}
