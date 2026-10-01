import React, {useMemo} from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';

import {useTheme} from '../../theme/useTheme';

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({label, style, ...props}: FormFieldProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          gap: theme.spacing.sm,
        },
        label: {
          color: theme.colors.textSecondary,
          ...theme.typography.label,
        },
        input: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gr,
          fontSize: 15,
          lineHeight: 22,
          minHeight: 54,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlignVertical: props.multiline ? 'top' : 'center',
        },
        multilineInput: {
          minHeight: 132,
        },
      }),
    [props.multiline, theme],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.disabled}
        scrollEnabled={props.multiline}
        style={[styles.input, props.multiline ? styles.multilineInput : null, style]}
        {...props}
      />
    </View>
  );
}
