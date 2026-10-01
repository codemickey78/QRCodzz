import {nowIso} from '../../utils/date';
import {
  NormalizedScanResult,
  ScannableBarcode,
  ScannerHandleResult,
  ScannerSessionSettings,
  ScannerSessionState,
} from './scannerTypes';

export const defaultScannerSessionSettings: ScannerSessionSettings = {
  confirmScansManually: true,
  continuousScanning: false,
  debounceMs: 900,
  duplicateWindowMs: 4000,
  playSound: true,
  storeDuplicates: false,
  vibrate: true,
};

export class ScannerSessionMachine {
  private lastAcceptedAt = 0;
  private recentResults = new Map<string, number>();
  private state: ScannerSessionState = {status: 'idle'};

  constructor(
    private settings: ScannerSessionSettings = defaultScannerSessionSettings,
  ) {}

  getState() {
    return this.state;
  }

  setSettings(settings: Partial<ScannerSessionSettings>) {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }

  start() {
    this.state = {status: 'scanning'};
    return this.state;
  }

  pause() {
    this.state = {...this.state, status: 'paused'};
    return this.state;
  }

  resume() {
    this.state = {...this.state, status: 'scanning'};
    return this.state;
  }

  fail(error: string) {
    this.state = {error, status: 'error'};
    return this.state;
  }

  handleBarcode(
    barcode: ScannableBarcode | undefined,
    source: NormalizedScanResult['source'],
    timestamp = Date.now(),
  ): ScannerHandleResult {
    if (!barcode?.rawValue && !barcode?.displayValue) {
      return {kind: 'ignored', reason: 'empty'};
    }

    if (this.state.status === 'paused' || this.state.status === 'processing') {
      return {kind: 'ignored', reason: 'paused'};
    }

    if (timestamp - this.lastAcceptedAt < this.settings.debounceMs) {
      return {kind: 'ignored', reason: 'debounced'};
    }

    const content = barcode.rawValue ?? barcode.displayValue ?? '';
    const duplicateKey = `${barcode.format}:${content}`;
    const previousScanAt = this.recentResults.get(duplicateKey);

    if (
      !this.settings.storeDuplicates &&
      previousScanAt &&
      timestamp - previousScanAt < this.settings.duplicateWindowMs
    ) {
      return {kind: 'ignored', reason: 'duplicate'};
    }

    const result: NormalizedScanResult = {
      content,
      format: barcode.format,
      rawFormat: barcode.format,
      scannedAt: nowIso(),
      source,
      valueType: barcode.valueType,
    };

    this.lastAcceptedAt = timestamp;
    this.recentResults.set(duplicateKey, timestamp);

    if (this.settings.confirmScansManually) {
      this.state = {
        pendingResult: result,
        status: 'detected',
      };
      return {kind: 'needsConfirmation', result};
    }

    this.state = {
      lastResult: result,
      status: this.settings.continuousScanning ? 'scanning' : 'paused',
    };
    return {kind: 'accepted', result};
  }

  confirmPending() {
    const result = this.state.pendingResult;

    if (!result) {
      return undefined;
    }

    this.state = {
      lastResult: result,
      status: this.settings.continuousScanning ? 'scanning' : 'paused',
    };
    return result;
  }

  rejectPending() {
    this.state = {status: 'scanning'};
  }
}
