import {
  AccentTheme,
  darkColors,
  fonts,
  lightColors,
  radii,
  spacing,
  typography,
} from './tokens';

export type AppTheme = {
  colors: typeof lightColors;
  fonts: typeof fonts;
  radii: typeof radii;
  spacing: typeof spacing;
  typography: typeof typography;
};

export function createTheme(isDark: boolean, _accentTheme: AccentTheme): AppTheme {
  const baseColors = isDark ? darkColors : lightColors;

  return {
    colors: baseColors,
    fonts,
    radii,
    spacing,
    typography,
  };
}
