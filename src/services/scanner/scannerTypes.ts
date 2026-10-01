import {Barcode, BarcodeFormat, TargetBarcodeFormat} from 'react-native-vision-camera-barcode-scanner';

export type ScannerMode = 'automatic' | 'qrOnly' | 'barcodeOnly' | 'products' | 'batch';
export type ScannerSessionStatus =
  | 'idle'
  | 'scanning'
  | 'detected'
  | 'processing'
  | 'paused'
  | 'error';

export type SupportedScanFormat =
  | 'qr-code'
  | 'data-matrix'
  | 'aztec'
  | 'pdf-417'
  | 'ean-13'
  | 'ean-8'
  | 'upc-a'
  | 'upc-e'
  | 'code-128'
  | 'code-39'
  | 'code-93'
  | 'codabar'
  | 'itf';

export type NormalizedScanResult = {
  content: string;
  format: BarcodeFormat;
  rawFormat: string;
  scannedAt: string;
  source: 'camera' | 'image';
  valueType?: string;
};

export type ScannerSessionSettings = {
  confirmScansManually: boolean;
  continuousScanning: boolean;
  debounceMs: number;
  duplicateWindowMs: number;
  playSound: boolean;
  storeDuplicates: boolean;
  vibrate: boolean;
};

export type ScannerSessionState = {
  error?: string;
  lastResult?: NormalizedScanResult;
  pendingResult?: NormalizedScanResult;
  status: ScannerSessionStatus;
};

export type ScannerHandleResult =
  | {kind: 'accepted'; result: NormalizedScanResult}
  | {kind: 'ignored'; reason: 'debounced' | 'duplicate' | 'paused' | 'empty'}
  | {kind: 'needsConfirmation'; result: NormalizedScanResult};

export type ScannableBarcode = Pick<
  Barcode,
  'displayValue' | 'format' | 'rawValue' | 'valueType'
>;

export const supportedScannerFormats: SupportedScanFormat[] = [
  'qr-code',
  'data-matrix',
  'aztec',
  'pdf-417',
  'ean-13',
  'ean-8',
  'upc-a',
  'upc-e',
  'code-128',
  'code-39',
  'code-93',
  'codabar',
  'itf',
];

export function getFormatsForMode(mode: ScannerMode): TargetBarcodeFormat[] {
  switch (mode) {
    case 'qrOnly':
      return ['qr-code'];
    case 'barcodeOnly':
      return supportedScannerFormats.filter(format => format !== 'qr-code');
    case 'products':
      return ['ean-13', 'ean-8', 'upc-a', 'upc-e'];
    case 'batch':
    case 'automatic':
    default:
      return supportedScannerFormats;
  }
}
