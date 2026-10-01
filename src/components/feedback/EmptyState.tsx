import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {Search01Icon} from '@hugeicons/core-free-icons';

import {useTheme} from '../../theme/useTheme';

type StateProps = {
  title: string;
  message: string;
};

export function EmptyState({message, title}: StateProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignItems: 'center',
          padding: theme.spacing.xxl,
        },
        bubble: {
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.black,
          borderRadius: 24,
          borderWidth: 1.5,
          height: 48,
          justifyContent: 'center',
          width: 48,
        },
        title: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
          marginTop: 18,
          textAlign: 'center',
        },
        message: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 20,
          marginTop: theme.spacing.sm,
          maxWidth: 290,
          textAlign: 'center',
        },
      }),
    [theme],
  );

  return (
    <View style={styles.root}>
      <View style={styles.bubble}>
        <HugeiconsIcon
          color={theme.colors.black}
          icon={Search01Icon}
          size={24}
          strokeWidth={2.2}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
