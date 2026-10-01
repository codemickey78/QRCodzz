import React, {useMemo} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';

import {useTheme} from '../../theme/useTheme';

type SettingsToggleProps = {
  label: string;
  onValueChange?: (value: boolean) => void;
  value: boolean;
};

export function SettingsToggle({label, onValueChange, value}: SettingsToggleProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          minHeight: 64,
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
        label: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        ios_backgroundColor={theme.colors.surfaceMuted}
        thumbColor={value ? theme.colors.black : theme.colors.white}
        trackColor={{
          false: theme.colors.surfaceMuted,
          true: theme.colors.primary,
        }}
        value={value}
      />
    </View>
  );
}
