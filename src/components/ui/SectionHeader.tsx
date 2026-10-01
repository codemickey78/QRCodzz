import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';

import {useTheme} from '../../theme/useTheme';

export function SectionHeader({
  action,
  icon,
  title,
}: {
  action?: string;
  icon?: IconSvgElement;
  title: string;
}) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        titleWrap: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.md,
        },
        mark: {
          alignItems: 'center',
          height: icon ? 26 : 9,
          justifyContent: 'center',
          width: icon ? 26 : 9,
        },
        dot: {
          backgroundColor: theme.colors.primary,
          borderRadius: 4.5,
          height: 9,
          width: 9,
        },
        title: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 17,
          lineHeight: 23,
        },
        action: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
        },
      }),
    [icon, theme],
  );

  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={styles.mark}>
          {icon ? (
            <HugeiconsIcon
              color={theme.colors.primary}
              icon={icon}
              size={22}
              strokeWidth={2.25}
            />
          ) : (
            <View style={styles.dot} />
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}
