import { defaultAppSettings } from '../src/database/entities/AppSettings';
import { LocalDatabaseSchema } from '../src/database/schema';
import {
  createBackup,
  createBackupFileName,
  createCodeImageExportJob,
  createCollectionExportFileName,
  createCollectionExportPayload,
  createCollectionShareItems,
  createPrintSheetManifest,
  mergeBackupIntoSnapshot,
  serializeCollectionExport,
  serializeBackup,
  validateBackupJson,
} from '../src/features/export';

const code = {
  content: 'https://example.com',
  createdAt: '2026-09-25T10:00:00.000Z',
  format: 'qr-code',
  id: 'code-1',
  isFavorite: true,
  source: 'generated' as const,
  title: 'Example',
  type: 'qr' as const,
  updatedAt: '2026-09-25T10:00:00.000Z',
};

function createSnapshot(
  overrides: Partial<LocalDatabaseSchema> = {},
): LocalDatabaseSchema {
  return {
    codes: [],
    collections: [],
    customSearchProviders: [],
    folders: [],
    qrDesigns: [],
    schemaVersion: 1,
    settings: defaultAppSettings,
    templates: [],
    ...overrides,
  };
}

describe('export service', () => {
  test('creates PNG export jobs with deterministic filenames and sizes', () => {
    expect(
      createCodeImageExportJob(code, {
        backgroundTransparent: true,
        format: 'png',
        resolution: 1024,
      }),
    ).toMatchObject({
      filename: 'example.png',
      height: 1024,
      mimeType: 'image/png',
      transparentBackground: true,
      width: 1024,
    });

    expect(
      createCodeImageExportJob(code, {
        customSize: 9999,
        format: 'png',
        resolution: 'custom',
      }).width,
    ).toBe(4096);
  });

  test('creates backups and predictable filenames', () => {
    const backup = createBackup(createSnapshot({ codes: [code] }));

    expect(backup.codes).toHaveLength(1);
    expect(serializeBackup(backup)).toContain('"codes"');
    expect(createBackupFileName(new Date('2026-09-25T12:00:00.000Z'))).toBe(
      'qr-workspace-backup-2026-09-25.json',
    );
  });

  test('validates corrupted, unsupported, and duplicate backups', () => {
    expect(validateBackupJson('{bad')).toMatchObject({ valid: false });
    expect(
      validateBackupJson(
        JSON.stringify({
          backupVersion: 99,
          schemaVersion: 1,
        }),
      ),
    ).toMatchObject({
      errors: expect.arrayContaining(['Unsupported backup version.']),
      valid: false,
    });

    const backup = createBackup(createSnapshot({ codes: [code, code] }));
    expect(validateBackupJson(JSON.stringify(backup))).toMatchObject({
      errors: expect.arrayContaining(['Duplicate IDs in backup: code-1']),
      valid: false,
    });
  });

  test('merges backups while skipping duplicate existing IDs', () => {
    const importedCode = { ...code, id: 'code-2' };
    const backup = createBackup(
      createSnapshot({ codes: [code, importedCode] }),
    );
    const result = mergeBackupIntoSnapshot(
      createSnapshot({ codes: [code] }),
      backup,
    );

    expect(result.importedCodes).toBe(1);
    expect(result.duplicateIds).toEqual(['code-1']);
    expect(result.snapshot.codes.map(item => item.id)).toEqual([
      'code-2',
      'code-1',
    ]);
  });

  test('creates print sheet manifests with quiet zones', () => {
    const manifest = createPrintSheetManifest([code], {
      barcodeSize: 180,
      columns: 2,
      margin: 24,
      paperSize: 'A4',
      qrSize: 180,
      rows: 5,
      showCodeValue: true,
      showTitle: true,
    });

    expect(manifest.fileName).toMatch(/^qr-workspace-print-sheet-/);
    expect(manifest.items).toHaveLength(1);
    expect(manifest.quietZone).toBeGreaterThanOrEqual(16);
  });

  test('exports and shares collection items from existing code records', () => {
    const secondCode = {
      ...code,
      content: 'WIFI:T:WPA;S:Cafe;P:secret;;',
      id: 'code-2',
      title: 'Wi-Fi',
    };
    const collection = {
      createdAt: '2026-09-25T10:00:00.000Z',
      description: 'Front-of-house codes',
      id: 'collection-1',
      itemIds: ['code-2', 'missing-code', 'code-1'],
      title: 'My Restaurant',
      updatedAt: '2026-09-25T10:00:00.000Z',
    };

    const exportPayload = createCollectionExportPayload(collection, [
      code,
      secondCode,
    ]);
    const shareItems = createCollectionShareItems(collection, [code, secondCode]);

    expect(exportPayload.items.map(item => item.id)).toEqual([
      'code-2',
      'code-1',
    ]);
    expect(shareItems).toEqual([
      expect.objectContaining({id: 'code-2', title: 'Wi-Fi'}),
      expect.objectContaining({id: 'code-1', title: 'Example'}),
    ]);
    expect(serializeCollectionExport(exportPayload)).toContain('"My Restaurant"');
    expect(createCollectionExportFileName(collection)).toMatch(
      /^qr-workspace-collection-my-restaurant-/,
    );
  });
});
