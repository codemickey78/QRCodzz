import {createTamagui} from '@tamagui/core';

export const tamaguiConfig = createTamagui({
  themes: {
    light: {
      background: '#ffffff',
      color: '#111318',
    },
    dark: {
      background: '#171d2b',
      color: '#ffffff',
    },
  },
  tokens: {
    color: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#050606',
    },
    radius: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
    },
    size: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
    },
    space: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
    },
    zIndex: {
      0: 0,
      1: 1,
      2: 10,
      3: 100,
      4: 1000,
    },
  },
});

export type TamaguiAppConfig = typeof tamaguiConfig;
