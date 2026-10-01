import React, {PropsWithChildren, useMemo} from 'react';
import {ScrollView, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '../../theme/useTheme';

type AppScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  topSafeArea?: boolean;
}>;

export function AppScreen({
  children,
  contentContainerStyle,
  scrollEnabled = true,
  topSafeArea = false,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          backgroundColor: theme.colors.background,
          flexGrow: 1,
          paddingBottom: insets.bottom + theme.spacing.xxxl,
          paddingHorizontal: 18,
          paddingTop: (topSafeArea ? insets.top : 0) + theme.spacing.lg,
        },
      }),
    [insets.bottom, insets.top, theme, topSafeArea],
  );

  return (
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={scrollEnabled}
      style={{backgroundColor: theme.colors.background}}>
      {children}
    </ScrollView>
  );
}
