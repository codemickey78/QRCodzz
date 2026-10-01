import {Platform} from 'react-native';

export type AppearanceMode = 'light' | 'dark' | 'system';
export type AccentTheme =
  | 'yellow'
  | 'emerald'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'rose'
  | 'monochrome';

export const fonts = {
  gb: Platform.select({
    android: 'googlesans-bold',
    default: 'GoogleSans-Bold',
  }),
  gm: Platform.select({
    android: 'googlesans-medium',
    default: 'GoogleSans-Medium',
  }),
  gr: Platform.select({
    android: 'googlesans-regular',
    default: 'GoogleSans-Regular',
  }),
  gs: Platform.select({
    android: 'googlesans-semibold',
    default: 'GoogleSans-SemiBold',
  }),
} as const;

export const typography = {
  display: {
    fontFamily: fonts.gb,
    fontSize: 36,
    lineHeight: 42,
  },
  title: {
    fontFamily: fonts.gb,
    fontSize: 24,
    lineHeight: 30,
  },
  heading: {
    fontFamily: fonts.gb,
    fontSize: 19,
    lineHeight: 25,
  },
  body: {
    fontFamily: fonts.gr,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fonts.gs,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.gr,
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    fontFamily: fonts.gr,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const accentPalette: Record<AccentTheme, string> = {
  yellow: '#6E53F9',
  emerald: '#059669',
  blue: '#2563EB',
  purple: '#6E53F9',
  orange: '#EA580C',
  rose: '#E11D48',
  monochrome: '#111111',
};

export const lightColors = {
  background: '#fdfdfd',
  surface: '#ffffff',
  surfaceMuted: '#f6f5ff',
  surfaceStrong: '#efecff',
  textPrimary: '#111318',
  textSecondary: '#707887',
  border: '#ebe9f8',
  primary: '#6E53F9',
  primarySoft: '#eeeaff',
  guard: '#6E53F9',
  accent: '#6E53F9',
  accentSoft: '#eeeaff',
  warning: '#ff9f0a',
  warningSoft: '#fff5e2',
  danger: '#e33d4e',
  dangerSoft: '#fff0f2',
  success: '#18a058',
  successSoft: '#e9f8ef',
  disabled: '#a4aebb',
  black: '#050606',
  yellow: '#6E53F9',
  white: '#ffffff',
};

export const darkColors = {
  background: '#0d0f16',
  surface: '#171923',
  surfaceMuted: '#232634',
  surfaceStrong: '#2d3142',
  textPrimary: '#ffffff',
  textSecondary: '#b8bdca',
  border: '#333649',
  primary: '#6E53F9',
  primarySoft: '#282146',
  guard: '#9b8cff',
  accent: '#9b8cff',
  accentSoft: '#282146',
  warning: '#ffcf25',
  warningSoft: '#494522',
  danger: '#ff5c76',
  dangerSoft: '#4a2832',
  success: '#3ddc84',
  successSoft: '#153823',
  disabled: '#626870',
  black: '#050606',
  yellow: '#9b8cff',
  white: '#ffffff',
};
