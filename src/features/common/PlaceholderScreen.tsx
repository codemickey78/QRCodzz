import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {EmptyState} from '../../components/feedback/EmptyState';
import {AppScreen} from '../../components/layout/AppScreen';
import {SecondaryButton} from '../../components/ui/Button';
import {Card} from '../../components/ui/Card';
import {SectionHeader} from '../../components/ui/SectionHeader';
import {useTheme} from '../../theme/useTheme';

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
  sectionTitle: string;
  items: string[];
};

export function PlaceholderScreen({
  items,
  sectionTitle,
  title,
}: PlaceholderScreenProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        item: {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gs,
          fontSize: 15,
          paddingVertical: theme.spacing[12],
        },
        lastItem: {
          borderBottomWidth: 0,
        },
      }),
    [theme],
  );

  return (
    <AppScreen>
      <View style={styles.stack}>
        <SectionHeader title={sectionTitle} />
        <Card>
          {items.map((item, index) => (
            <Text
              key={item}
              style={[styles.item, index === items.length - 1 && styles.lastItem]}>
              {item}
            </Text>
          ))}
        </Card>
        <SecondaryButton accessibilityLabel={`Back from ${title}`}>
          Back
        </SecondaryButton>
        <EmptyState
          message="This route is prepared for the next implementation phase."
          title="Placeholder"
        />
      </View>
    </AppScreen>
  );
}
