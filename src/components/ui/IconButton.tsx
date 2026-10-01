import React, {useMemo} from 'react';
import {Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {Notification01Icon} from '@hugeicons/core-free-icons';

import {useTheme} from '../../theme/useTheme';

type IconButtonProps = {
  accessibilityLabel: string;
  color?: string;
  icon?: IconSvgElement;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  accessibilityLabel,
  color,
  icon = Notification01Icon,
  onPress,
  size = 25,
  style,
}: IconButtonProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: 10,
          borderWidth: StyleSheet.hairlineWidth,
          height: 45,
          justifyContent: 'center',
          width: 45,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        style,
        pressed ? {opacity: 0.72, transform: [{scale: 0.96}]} : null,
      ]}>
      <HugeiconsIcon
        color={color ?? theme.colors.textPrimary}
        icon={icon}
        size={size}
        strokeWidth={1.8}
      />
    </Pressable>
  );
}
