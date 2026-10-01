import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '../../theme/useTheme';

type BottomSheetProps = PropsWithChildren<{
  onDismiss?: () => void;
  snapPoints?: string[];
  visible: boolean;
}>;

export function BottomSheet({
  children,
  onDismiss,
  snapPoints,
  visible,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const maxHeight = useMemo(
    () => resolveSnapHeight(isKeyboardVisible ? '92%' : snapPoints?.[0] ?? '72%'),
    [isKeyboardVisible, snapPoints],
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        avoidingView: {
          flex: 1,
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.28)',
          flex: 1,
          justifyContent: 'flex-end',
        },
        backdrop: {
          ...StyleSheet.absoluteFill,
          zIndex: 0,
        },
        sheet: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 24,
          maxHeight,
          overflow: 'hidden',
          zIndex: 1,
        },
        handle: {
          alignSelf: 'center',
          backgroundColor: theme.colors.disabled,
          borderRadius: 2,
          height: 4,
          marginTop: 10,
          width: 42,
        },
        content: {
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
          paddingTop: 8,
        },
      }),
    [insets.bottom, maxHeight, theme],
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleDismiss}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Close bottom sheet"
            accessibilityRole="button"
            onPress={handleDismiss}
            style={styles.backdrop}
          />
          <View pointerEvents="box-none" style={styles.sheet}>
            <View style={styles.handle} />
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled>
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function BottomSheetModalProvider({children}: PropsWithChildren) {
  return <>{children}</>;
}

function resolveSnapHeight(snapPoint: string) {
  const windowHeight = Dimensions.get('window').height;
  const percentage = Number(snapPoint.replace('%', ''));

  if (Number.isFinite(percentage) && percentage > 0) {
    return windowHeight * Math.min(percentage, 96) / 100;
  }

  return windowHeight * 0.72;
}
