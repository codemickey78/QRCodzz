import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Barcode} from 'react-native-vision-camera-barcode-scanner';

import {useAppSettings} from './useAppSettings';
import {scannerService} from '../services/scanner/scannerService';
import {
  ScannerSessionMachine,
  defaultScannerSessionSettings,
} from '../services/scanner/ScannerSessionMachine';
import {
  getFormatsForMode,
  NormalizedScanResult,
  ScannerMode,
  ScannerSessionState,
} from '../services/scanner/scannerTypes';

export function useScannerSession(initialMode: ScannerMode = 'automatic') {
  const {settings} = useAppSettings();
  const [mode, setMode] = useState<ScannerMode>(initialMode);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [lastSavedCodeId, setLastSavedCodeId] = useState<string | undefined>();
  const machineRef = useRef(new ScannerSessionMachine());
  const [sessionState, setSessionState] = useState<ScannerSessionState>(
    machineRef.current.getState(),
  );

  useEffect(() => {
    machineRef.current.setSettings({
      ...defaultScannerSessionSettings,
      confirmScansManually: settings.scanner.confirmScansManually,
      continuousScanning: settings.scanner.continuousScanning,
      playSound: settings.scanner.playSound,
      storeDuplicates: settings.scanner.storeDuplicates,
      vibrate: settings.scanner.vibrate,
    });
  }, [settings.scanner]);

  const syncState = useCallback(() => {
    setSessionState({...machineRef.current.getState()});
  }, []);

  const start = useCallback(() => {
    machineRef.current.start();
    syncState();
  }, [syncState]);

  const pause = useCallback(() => {
    setIsTorchOn(false);
    machineRef.current.pause();
    syncState();
  }, [syncState]);

  const resume = useCallback(() => {
    machineRef.current.resume();
    syncState();
  }, [syncState]);

  const persistResult = useCallback(
    async (result: NormalizedScanResult) => {
      scannerService.playScanFeedback({
        playSound: settings.scanner.playSound,
        vibrate: settings.scanner.vibrate,
      });
      const savedCode = await scannerService.persistScan(result);
      setLastSavedCodeId(savedCode.id);
      return savedCode;
    },
    [settings.scanner.playSound, settings.scanner.vibrate],
  );

  const handleBarcodes = useCallback(
    async (barcodes: Barcode[], source: NormalizedScanResult['source']) => {
      const result = machineRef.current.handleBarcode(barcodes[0], source);

      if (result.kind === 'accepted') {
        try {
          await persistResult(result.result);
        } catch (error) {
          machineRef.current.fail(
            error instanceof Error ? error.message : 'Unable to save scan.',
          );
        }
      }

      syncState();
      return result;
    },
    [persistResult, syncState],
  );

  const confirmPending = useCallback(async () => {
    const result = machineRef.current.confirmPending();
    syncState();

    if (result) {
      try {
        await persistResult(result);
      } catch (error) {
        machineRef.current.fail(
          error instanceof Error ? error.message : 'Unable to save scan.',
        );
      }
    }

    syncState();
    return result;
  }, [persistResult, syncState]);

  const rejectPending = useCallback(() => {
    machineRef.current.rejectPending();
    syncState();
  }, [syncState]);

  const scanImage = useCallback(async () => {
    try {
      machineRef.current.resume();
      syncState();
      const barcodes = await scannerService.scanImageFromLibrary(mode);

      if (barcodes.length === 0) {
        machineRef.current.fail('No QR code or barcode was found in that image.');
        syncState();
        return {kind: 'ignored' as const, reason: 'empty' as const};
      }

      return handleBarcodes(barcodes, 'image');
    } catch (error) {
      machineRef.current.fail(
        error instanceof Error ? error.message : 'Unable to scan image.',
      );
      setIsTorchOn(false);
      syncState();
      return undefined;
    }
  }, [handleBarcodes, mode, syncState]);

  const fail = useCallback(
    (message: string) => {
      setIsTorchOn(false);
      machineRef.current.fail(message);
      syncState();
    },
    [syncState],
  );

  const barcodeFormats = useMemo(() => getFormatsForMode(mode), [mode]);

  return {
    barcodeFormats,
    confirmPending,
    fail,
    handleBarcodes,
    isTorchOn,
    lastSavedCodeId,
    mode,
    pause,
    rejectPending,
    resume,
    scanImage,
    sessionState,
    setIsTorchOn,
    setMode,
    start,
  };
}
