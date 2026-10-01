import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {PencilEdit02Icon} from '@hugeicons/core-free-icons';

import {useTheme} from '../../theme/useTheme';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
};

export function SettingsRow({label, onPress, value}: SettingsRowProps) {
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
        valueWrap: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
        },
        label: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
        value: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
        },
        editPill: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 15,
          height: 30,
          justifyContent: 'center',
          width: 30,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        pressed ? {opacity: 0.72} : null,
      ]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrap}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {onPress ? (
          <View style={styles.editPill}>
            <HugeiconsIcon
              color={theme.colors.primary}
              icon={PencilEdit02Icon}
              size={16}
              strokeWidth={2.2}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
