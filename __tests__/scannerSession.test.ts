import {ScannerSessionMachine} from '../src/services/scanner/ScannerSessionMachine';
import {ScannableBarcode} from '../src/services/scanner/scannerTypes';

const qrBarcode: ScannableBarcode = {
  displayValue: 'https://example.com',
  format: 'qr-code',
  rawValue: 'https://example.com',
  valueType: 'url',
};

const secondQrBarcode: ScannableBarcode = {
  displayValue: 'https://example.org',
  format: 'qr-code',
  rawValue: 'https://example.org',
  valueType: 'url',
};

describe('ScannerSessionMachine', () => {
  test('ignores duplicate scans within the duplicate window', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 0,
      duplicateWindowMs: 4000,
      playSound: false,
      storeDuplicates: false,
      vibrate: false,
    });

    scanner.start();

    expect(scanner.handleBarcode(qrBarcode, 'camera', 1000).kind).toBe(
      'accepted',
    );
    expect(scanner.handleBarcode(qrBarcode, 'camera', 2000)).toEqual({
      kind: 'ignored',
      reason: 'duplicate',
    });
  });

  test('accepts duplicates outside the duplicate window', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 0,
      duplicateWindowMs: 4000,
      playSound: false,
      storeDuplicates: false,
      vibrate: false,
    });

    scanner.start();

    expect(scanner.handleBarcode(qrBarcode, 'camera', 1000).kind).toBe(
      'accepted',
    );
    expect(scanner.handleBarcode(qrBarcode, 'camera', 6000).kind).toBe(
      'accepted',
    );
  });

  test('allows repeated scans when duplicate storage is enabled', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 0,
      duplicateWindowMs: 4000,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();

    expect(scanner.handleBarcode(qrBarcode, 'camera', 1000).kind).toBe(
      'accepted',
    );
    expect(scanner.handleBarcode(qrBarcode, 'camera', 2000).kind).toBe(
      'accepted',
    );
  });

  test('debounces rapid scans', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 900,
      duplicateWindowMs: 0,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();

    expect(scanner.handleBarcode(qrBarcode, 'camera', 1000).kind).toBe(
      'accepted',
    );
    expect(scanner.handleBarcode(qrBarcode, 'camera', 1200)).toEqual({
      kind: 'ignored',
      reason: 'debounced',
    });
  });

  test('pauses and resumes scanning', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 0,
      duplicateWindowMs: 0,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();
    scanner.pause();

    expect(scanner.handleBarcode(qrBarcode, 'camera', 1000)).toEqual({
      kind: 'ignored',
      reason: 'paused',
    });

    scanner.resume();
    expect(scanner.handleBarcode(qrBarcode, 'camera', 1000).kind).toBe(
      'accepted',
    );
  });

  test('ignores empty image results and accepts the next real detection', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 0,
      duplicateWindowMs: 0,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();

    expect(scanner.handleBarcode(undefined, 'image', 1000)).toEqual({
      kind: 'ignored',
      reason: 'empty',
    });
    expect(scanner.handleBarcode(qrBarcode, 'image', 1000).kind).toBe(
      'accepted',
    );
  });

  test('processes the first barcode from rapid multiple-code detections', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: false,
      continuousScanning: true,
      debounceMs: 0,
      duplicateWindowMs: 0,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();

    const first = scanner.handleBarcode(qrBarcode, 'camera', 1000);
    const second = scanner.handleBarcode(secondQrBarcode, 'camera', 1000);

    expect(first.kind).toBe('accepted');
    expect(second.kind).toBe('accepted');
    expect(scanner.getState().lastResult?.content).toBe(
      secondQrBarcode.rawValue,
    );
  });

  test('requires confirmation when manual confirmation is enabled', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: true,
      continuousScanning: false,
      debounceMs: 0,
      duplicateWindowMs: 0,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();

    const result = scanner.handleBarcode(qrBarcode, 'camera', 1000);

    expect(result.kind).toBe('needsConfirmation');
    expect(scanner.getState().status).toBe('detected');

    const confirmedResult = scanner.confirmPending();

    expect(confirmedResult?.content).toBe(qrBarcode.rawValue);
    expect(scanner.getState().status).toBe('paused');
  });

  test('rejects pending manual scans and resumes scanning', () => {
    const scanner = new ScannerSessionMachine({
      confirmScansManually: true,
      continuousScanning: false,
      debounceMs: 0,
      duplicateWindowMs: 0,
      playSound: false,
      storeDuplicates: true,
      vibrate: false,
    });

    scanner.start();
    scanner.handleBarcode(qrBarcode, 'camera', 1000);
    scanner.rejectPending();

    expect(scanner.getState()).toEqual({status: 'scanning'});
  });

  test('stores readable error messages and recovers on resume', () => {
    const scanner = new ScannerSessionMachine();

    scanner.fail('Unable to access the camera.');
    expect(scanner.getState()).toEqual({
      error: 'Unable to access the camera.',
      status: 'error',
    });

    scanner.resume();
    expect(scanner.getState().status).toBe('scanning');
  });
});
