import {AccentTheme, AppearanceMode} from '../../theme/tokens';

export type ScannerSettings = {
  automaticallyOpenWebsites: boolean;
  copyAfterScan: boolean;
  vibrate: boolean;
  playSound: boolean;
  confirmScansManually: boolean;
  storeDuplicates: boolean;
  continuousScanning: boolean;
  autoZoom: boolean;
  defaultScanMode: 'automatic' | 'qrOnly' | 'barcodeOnly' | 'products' | 'batch';
  preferredCamera: 'back' | 'front';
};

export type AppearanceSettings = {
  appearance: AppearanceMode;
  accentTheme: AccentTheme;
};

export type AppSettings = {
  scanner: ScannerSettings;
  appearance: AppearanceSettings;
};

export const defaultAppSettings: AppSettings = {
  scanner: {
    automaticallyOpenWebsites: false,
    copyAfterScan: false,
    vibrate: true,
    playSound: true,
    confirmScansManually: true,
    storeDuplicates: false,
    continuousScanning: false,
    autoZoom: true,
    defaultScanMode: 'automatic',
    preferredCamera: 'back',
  },
  appearance: {
    appearance: 'system',
    accentTheme: 'emerald',
  },
};
