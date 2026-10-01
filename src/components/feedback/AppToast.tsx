import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '../../theme/useTheme';

type ShowToast = (title: string, message?: string) => void;

const ToastContext = createContext<ShowToast | undefined>(undefined);

export function AppToastProvider({children}: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const [toast, setToast] = useState<{message?: string; title: string}>();

  const showToast = useCallback<ShowToast>((title, message) => {
    setToast({message, title});
  }, []);

  const value = useMemo(() => showToast, [showToast]);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        toast: {
          backgroundColor: theme.colors.black,
          borderRadius: theme.radii.lg,
          bottom: insets.bottom + 18,
          gap: 2,
          left: 18,
          paddingHorizontal: 16,
          paddingVertical: 12,
          position: 'absolute',
          right: 18,
          shadowColor: theme.colors.black,
          shadowOffset: {height: 8, width: 0},
          shadowOpacity: 0.16,
          shadowRadius: 18,
          zIndex: 999,
        },
        title: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
          lineHeight: 19,
        },
        message: {
          color: '#ffffffbf',
          fontFamily: theme.fonts.gr,
          fontSize: 12,
          lineHeight: 17,
        },
      }),
    [insets.bottom, theme],
  );

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(() => setToast(undefined), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.title}>{toast.title}</Text>
          {toast.message ? (
            <Text style={styles.message}>{toast.message}</Text>
          ) : null}
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const showToast = useContext(ToastContext);

  if (!showToast) {
    throw new Error('useAppToast must be used inside AppToastProvider');
  }

  return showToast;
}
