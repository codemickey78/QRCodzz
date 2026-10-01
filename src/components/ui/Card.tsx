import React, {PropsWithChildren, useMemo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {useTheme} from '../../theme/useTheme';

type CardProps = PropsWithChildren<{
  elevated?: boolean;
  radius?: 'base' | 'dashboard';
  style?: StyleProp<ViewStyle>;
}>;

export function Card({children, elevated = true, radius = 'base', style}: CardProps) {
  const {isDark, theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: radius === 'dashboard' ? theme.radii.xl : theme.radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          elevation: elevated ? 2 : 0,
          padding: radius === 'dashboard' ? 19 : theme.spacing.lg,
          shadowColor: isDark ? '#000000' : '#dfe8f5',
          shadowOffset: {height: 8, width: 0},
          shadowOpacity: elevated ? (isDark ? 0.45 : 0.5) : 0,
          shadowRadius: elevated ? 18 : 0,
        },
      }),
    [elevated, isDark, radius, theme],
  );

  return <View style={[styles.card, style]}>{children}</View>;
}
