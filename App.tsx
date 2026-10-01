import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, Text, TextInput} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppToastProvider} from './src/components/feedback/AppToast';
import {BottomSheetModalProvider} from './src/components/ui/BottomSheet';
import {RootNavigator} from './src/app/navigation/RootNavigator';
import {AppProviders} from './src/app/providers/AppProviders';
import {adMobService} from './src/services/ads/AdMobService';
import {fonts} from './src/theme/tokens';
import {useTheme} from './src/theme/useTheme';

const DefaultText = Text as typeof Text & {defaultProps?: {style?: unknown}};
const DefaultTextInput = TextInput as typeof TextInput & {
  defaultProps?: {style?: unknown};
};

DefaultText.defaultProps = DefaultText.defaultProps ?? {};
DefaultText.defaultProps.style = [
  {fontFamily: fonts.gr, letterSpacing: 0},
  DefaultText.defaultProps.style,
];
DefaultTextInput.defaultProps = DefaultTextInput.defaultProps ?? {};
DefaultTextInput.defaultProps.style = [
  {fontFamily: fonts.gr, letterSpacing: 0},
  DefaultTextInput.defaultProps.style,
];

function AppContent() {
  const {isDark} = useTheme();

  useEffect(() => {
    void adMobService.initialize();
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <RootNavigator />
    </>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProviders>
          <BottomSheetModalProvider>
            <AppToastProvider>
              <AppContent />
            </AppToastProvider>
          </BottomSheetModalProvider>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
