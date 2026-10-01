import React, {PropsWithChildren, createContext, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';

import {AppearanceMode, AccentTheme} from './tokens';
import {AppTheme, createTheme} from './theme';

type ThemeContextValue = {
  accentTheme: AccentTheme;
  appearance: AppearanceMode;
  isDark: boolean;
  setAccentTheme: (accentTheme: AccentTheme) => void;
  setAppearance: (appearance: AppearanceMode) => void;
  theme: AppTheme;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

export function ThemeProvider({children}: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearance] = useState<AppearanceMode>('light');
  const [accentTheme, setAccentTheme] = useState<AccentTheme>('yellow');

  const isDark =
    appearance === 'system' ? systemScheme === 'dark' : appearance === 'dark';

  const value = useMemo(
    () => ({
      accentTheme,
      appearance,
      isDark,
      setAccentTheme,
      setAppearance,
      theme: createTheme(isDark, accentTheme),
    }),
    [accentTheme, appearance, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
