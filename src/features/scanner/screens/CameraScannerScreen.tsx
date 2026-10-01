import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useBarcodeScannerOutput} from 'react-native-vision-camera-barcode-scanner';
import {StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft02Icon, ZapIcon} from '@hugeicons/core-free-icons';

import {ScanStackParamList} from '../../../app/navigation/navigationTypes';
import {AdBanner} from '../../../components/ads/AdBanner';
import {EmptyState} from '../../../components/feedback/EmptyState';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import {IconButton} from '../../../components/ui/IconButton';
import {useScannerSession} from '../../../hooks/useScannerSession';
import { permissionExplanations } from '../../security';
import {useTheme} from '../../../theme/useTheme';

type CameraNavigation = NativeStackNavigationProp<
  ScanStackParamList,
  'CameraScanner'
>;
type CameraRoute = RouteProp<ScanStackParamList, 'CameraScanner'>;

export function CameraScannerScreen() {
  const navigation = useNavigation<CameraNavigation>();
  const route = useRoute<CameraRoute>();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const permission = useCameraPermission();
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const scanner = useScannerSession();
  const {
    barcodeFormats,
    fail,
    handleBarcodes,
    pause,
    scanImage,
    start,
  } = scanner;
  const device = useCameraDevice('back');
  const scannerOutput = useBarcodeScannerOutput({
    barcodeFormats,
    onBarcodeScanned: barcodes => handleBarcodes(barcodes, 'camera'),
    onError: error => fail(error.message),
    outputResolution: 'preview',
  });
  const isCameraActive = scanner.sessionState.status === 'scanning';
  const canSetTorchMode = Boolean(
    device?.hasTorch && isCameraActive && isCameraStarted,
  );
  const torchMode = canSetTorchMode
    ? scanner.isTorchOn
      ? 'on'
      : 'off'
    : undefined;

  useEffect(() => {
    if (!isCameraActive) {
      setIsCameraStarted(false);
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (!canSetTorchMode && scanner.isTorchOn) {
      scanner.setIsTorchOn(false);
    }
  }, [canSetTorchMode, scanner]);

  const toggleTorch = useCallback(() => {
    if (!canSetTorchMode) {
      scanner.setIsTorchOn(false);
      return;
    }

    scanner.setIsTorchOn(!scanner.isTorchOn);
  }, [canSetTorchMode, scanner]);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (!permission.hasPermission && permission.canRequestPermission) {
      permission.requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (route.params?.openGallery) {
      scanImage();
    }
  }, [route.params?.openGallery, scanImage]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: theme.colors.background,
          flex: 1,
          paddingBottom: insets.bottom + theme.spacing[16],
          paddingHorizontal: theme.spacing[16],
          paddingTop: insets.top + theme.spacing[12],
        },
        topBar: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[12],
        },
        title: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 19,
          lineHeight: 24,
        },
        cameraWrap: {
          alignSelf: 'center',
          backgroundColor: theme.colors.black,
          borderColor: theme.colors.border,
          borderRadius: 28,
          borderWidth: StyleSheet.hairlineWidth,
          height: 300,
          marginTop: theme.spacing[12],
          overflow: 'hidden',
          width: '100%',
        },
        camera: {
          flex: 1,
        },
        frame: {
          borderColor: theme.colors.accent,
          borderRadius: 24,
          borderWidth: 2.5,
          height: 180,
          left: '50%',
          marginLeft: -90,
          marginTop: -90,
          position: 'absolute',
          top: '50%',
          width: 180,
        },
        controls: {
          gap: theme.spacing.sm,
          marginTop: theme.spacing[12],
        },
        actionRow: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        actionButton: {
          flex: 1,
        },
        status: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
          textAlign: 'center',
        },
        torchUnavailable: {
          opacity: 0.48,
        },
      }),
    [insets.bottom, insets.top, theme],
  );

  if (!permission.hasPermission) {
    return (
      <View style={styles.root}>
        <View style={styles.topBar}>
          <IconButton
            accessibilityLabel="Go back"
            icon={ArrowLeft02Icon}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Scan</Text>
          <View />
        </View>
        <EmptyState
          message={
            permission.canRequestPermission
              ? permissionExplanations.cameraScanner
              : 'Camera access is denied. Enable it in system settings to scan with the camera.'
          }
          title="Camera permission needed"
        />
        {permission.canRequestPermission ? (
          <PrimaryButton
            accessibilityLabel="Request camera permission"
            onPress={permission.requestPermission}>
            Allow camera
          </PrimaryButton>
        ) : null}
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.root}>
        <View style={styles.topBar}>
          <IconButton
            accessibilityLabel="Go back"
            icon={ArrowLeft02Icon}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Scan</Text>
          <View />
        </View>
        <EmptyState
          message="This device does not expose a back camera that can be used for scanning."
          title="No camera available"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <IconButton
          accessibilityLabel="Go back"
          icon={ArrowLeft02Icon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Scan</Text>
        <IconButton
          accessibilityLabel="Toggle flashlight"
          color={
            scanner.isTorchOn && canSetTorchMode
              ? theme.colors.yellow
              : undefined
          }
          icon={ZapIcon}
          onPress={toggleTorch}
          style={!canSetTorchMode ? styles.torchUnavailable : undefined}
        />
      </View>

      <AdBanner />

      <View style={styles.cameraWrap}>
        <Camera
          device={device}
          enableNativeTapToFocusGesture
          enableNativeZoomGesture
          isActive={isCameraActive}
          onError={error => fail(error.message)}
          onStarted={() => setIsCameraStarted(true)}
          onStopped={() => setIsCameraStarted(false)}
          outputs={[scannerOutput]}
          style={styles.camera}
          torchMode={torchMode}
        />
        <View pointerEvents="none" style={styles.frame} />
      </View>

      <View style={styles.controls}>
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {scanner.sessionState.error
            ? scanner.sessionState.error
            : scanner.sessionState.pendingResult
            ? `Detected ${scanner.sessionState.pendingResult.format}: ${scanner.sessionState.pendingResult.content}`
            : scanner.sessionState.lastResult
              ? `Saved ${scanner.sessionState.lastResult.format}: ${scanner.sessionState.lastResult.content}`
              : 'Point the camera at a QR code or barcode.'}
        </Text>

        {scanner.sessionState.pendingResult ? (
          <View style={styles.actionRow}>
            <SecondaryButton
              accessibilityLabel="Reject scan"
              onPress={scanner.rejectPending}
              style={styles.actionButton}>
              Reject
            </SecondaryButton>
            <PrimaryButton
              accessibilityLabel="Confirm scan"
              onPress={scanner.confirmPending}
              style={styles.actionButton}>
              Confirm
            </PrimaryButton>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <SecondaryButton
              accessibilityLabel="Scan image from gallery"
              onPress={scanImage}
              style={styles.actionButton}>
              Gallery
            </SecondaryButton>
            <SecondaryButton
              accessibilityLabel={
                scanner.sessionState.status === 'paused'
                  ? 'Resume scanning'
                  : 'Pause scanning'
              }
              onPress={
                scanner.sessionState.status === 'paused'
                  ? scanner.resume
                  : pause
              }
              style={styles.actionButton}>
              {scanner.sessionState.status === 'paused' ? 'Resume' : 'Pause'}
            </SecondaryButton>
          </View>
        )}

        {scanner.lastSavedCodeId ? (
          <PrimaryButton
            accessibilityLabel="View scan result"
            onPress={() => {
              const codeId = scanner.lastSavedCodeId;

              if (codeId) {
                navigation.navigate('ScanResult', {codeId});
              }
            }}>
            View result
          </PrimaryButton>
        ) : null}
      </View>
    </View>
  );
}
