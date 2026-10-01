import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

import {adUnitIds, areAdsEnabled} from '../../services/ads/AdMobService';
import {useTheme} from '../../theme/useTheme';

export function AdBanner() {
  const {theme} = useTheme();
  const [hasLoadError, setHasLoadError] = useState(false);

  if (!areAdsEnabled || hasLoadError || !adUnitIds.banner) {
    return null;
  }

  return (
    <View
      accessibilityLabel="Advertisement"
      style={[styles.root, {backgroundColor: theme.colors.surface}]}>
      <BannerAd
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={adUnitIds.banner}
        requestOptions={{requestNonPersonalizedAdsOnly: true}}
        onAdFailedToLoad={() => setHasLoadError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    justifyContent: 'center',
  },
});
