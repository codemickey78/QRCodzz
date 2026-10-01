import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {useTheme} from '../../theme/useTheme';

type FilterChipProps = {
  disabled?: boolean;
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function FilterChip({disabled, label, onPress, selected}: FilterChipProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        chip: {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.surfaceMuted,
          borderRadius: theme.radii.sm,
          minHeight: 38,
          justifyContent: 'center',
          opacity: disabled ? 0.58 : 1,
          paddingHorizontal: 14,
          paddingVertical: 9,
        },
        label: {
          color: selected ? theme.colors.white : theme.colors.textPrimary,
          fontFamily: selected ? theme.fonts.gb : theme.fonts.gr,
          fontSize: 13,
          lineHeight: 17,
        },
      }),
    [disabled, selected, theme],
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.chip,
        pressed ? {opacity: 0.72, transform: [{scale: 0.97}]} : null,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
