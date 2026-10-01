import React, {useMemo} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {Search01Icon} from '@hugeicons/core-free-icons';

import {useTheme} from '../../theme/useTheme';

type SearchInputProps = {
  accessibilityLabel?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export function SearchInput({
  accessibilityLabel = 'Search saved codes',
  onChangeText,
  placeholder = 'Search codes, folders, or formats',
  value,
}: SearchInputProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: 28,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing.sm,
          minHeight: 54,
          paddingHorizontal: 16,
        },
        input: {
          color: theme.colors.textPrimary,
          flex: 1,
          fontFamily: theme.fonts.gr,
          fontSize: 15,
          lineHeight: 22,
          paddingVertical: 0,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.root}>
      <HugeiconsIcon
        color={theme.colors.textSecondary}
        icon={Search01Icon}
        size={20}
        strokeWidth={1.9}
      />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.disabled}
        style={styles.input}
        value={value}
      />
    </View>
  );
}
