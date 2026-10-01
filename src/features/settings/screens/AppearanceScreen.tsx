import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {Moon02Icon, SmartPhone01Icon, Sun03Icon, Tick02Icon} from '@hugeicons/core-free-icons';

import {AppScreen} from '../../../components/layout/AppScreen';
import {Card} from '../../../components/ui/Card';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {AppearanceMode} from '../../../theme/tokens';
import {useTheme} from '../../../theme/useTheme';

const appearanceOptions: Array<{
  icon: typeof Sun03Icon;
  label: string;
  value: AppearanceMode;
}> = [
  {icon: Sun03Icon, label: 'Light', value: 'light'},
  {icon: Moon02Icon, label: 'Dark', value: 'dark'},
  {icon: SmartPhone01Icon, label: 'System', value: 'system'},
];

export function AppearanceScreen() {
  const {appearance, setAppearance, theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing.lg,
        },
        card: {
          gap: theme.spacing.xs,
        },
        option: {
          alignItems: 'center',
          borderColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing.md,
          minHeight: 58,
          paddingHorizontal: theme.spacing.md,
        },
        optionSelected: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        iconWrap: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: 16,
          height: 32,
          justifyContent: 'center',
          width: 32,
        },
        iconWrapSelected: {
          backgroundColor: '#ffffff24',
        },
        label: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
        labelSelected: {
          color: theme.colors.white,
        },
        labelWrap: {
          flex: 1,
        },
        helper: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        helperSelected: {
          color: '#ffffffcc',
        },
      }),
    [theme],
  );

  return (
    <AppScreen>
      <View style={styles.stack}>
        <SectionHeader title="Theme" />
        <Card style={styles.card}>
          {appearanceOptions.map(option => {
            const selected = appearance === option.value;
            return (
              <Pressable
                accessibilityLabel={`Use ${option.label} appearance`}
                accessibilityRole="button"
                key={option.value}
                onPress={() => setAppearance(option.value)}
                style={({pressed}) => [
                  styles.option,
                  selected ? styles.optionSelected : null,
                  pressed ? {opacity: 0.78, transform: [{scale: 0.99}]} : null,
                ]}>
                <View
                  style={[
                    styles.iconWrap,
                    selected ? styles.iconWrapSelected : null,
                  ]}>
                  <HugeiconsIcon
                    color={selected ? theme.colors.white : theme.colors.textSecondary}
                    icon={option.icon}
                    size={19}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.labelWrap}>
                  <Text style={[styles.label, selected ? styles.labelSelected : null]}>
                    {option.label}
                  </Text>
                  {option.value === 'light' ? (
                    <Text style={[styles.helper, selected ? styles.helperSelected : null]}>
                      Default white app theme
                    </Text>
                  ) : null}
                </View>
                {selected ? (
                  <HugeiconsIcon
                    color={theme.colors.white}
                    icon={Tick02Icon}
                    size={20}
                    strokeWidth={2.3}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </Card>
      </View>
    </AppScreen>
  );
}
