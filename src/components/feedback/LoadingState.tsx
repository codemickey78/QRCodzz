import React, {useMemo} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useTheme} from '../../theme/useTheme';

export function LoadingState() {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing[24],
        },
      }),
    [theme],
  );

  return (
    <View accessibilityLabel="Loading" style={styles.root}>
      <ActivityIndicator color={theme.colors.accent} />
    </View>
  );
}
