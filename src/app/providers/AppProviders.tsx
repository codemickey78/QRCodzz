import React, {PropsWithChildren} from 'react';
import {TamaguiProvider} from '@tamagui/core';

import {PremiumProvider} from '../../features/premium';
import {ThemeProvider} from '../../theme/ThemeProvider';
import {tamaguiConfig} from '../../theme/tamaguiConfig';
import {useTheme} from '../../theme/useTheme';

export function AppProviders({children}: PropsWithChildren) {
  return (
    <ThemeProvider>
      <TamaguiBridge>
        <PremiumProvider>{children}</PremiumProvider>
      </TamaguiBridge>
    </ThemeProvider>
  );
}

function TamaguiBridge({children}: PropsWithChildren) {
  const {isDark} = useTheme();

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={isDark ? 'dark' : 'light'}>
      {children}
    </TamaguiProvider>
  );
}
