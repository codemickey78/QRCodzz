import React, { PropsWithChildren, useMemo } from 'react';
import {
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

type ButtonProps = PropsWithChildren<{
  accessibilityLabel: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

function pressState(
  pressed: boolean,
  disabled?: boolean,
): StyleProp<ViewStyle> {
  if (disabled) {
    return {opacity: 0.58};
  }

  return pressed ? {opacity: 0.78, transform: [{scale: 0.985}]} : null;
}

export function PrimaryButton({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.full,
          minHeight: 52,
          justifyContent: 'center',
          paddingHorizontal: 18,
          paddingVertical: 12,
        },
        label: {
          color: theme.colors.white,
          ...theme.typography.bodyStrong,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}: PressableStateCallbackType) => [
        styles.button,
        style,
        pressState(pressed, disabled),
      ]}
    >
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.full,
          borderWidth: StyleSheet.hairlineWidth,
          minHeight: 52,
          justifyContent: 'center',
          paddingHorizontal: 18,
          paddingVertical: 12,
        },
        label: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}: PressableStateCallbackType) => [
        styles.button,
        style,
        pressState(pressed, disabled),
      ]}
    >
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

export function BlackButton({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignItems: 'center',
          backgroundColor: theme.colors.black,
          borderRadius: theme.radii.full,
          minHeight: 56,
          justifyContent: 'center',
          paddingHorizontal: 18,
          paddingVertical: 13,
        },
        label: {
          color: theme.colors.white,
          ...theme.typography.bodyStrong,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}: PressableStateCallbackType) => [
        styles.button,
        style,
        pressState(pressed, disabled),
      ]}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}
