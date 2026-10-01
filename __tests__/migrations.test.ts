import {migrateDatabase} from '../src/database/migrations/migrations';

describe('database migrations', () => {
  test('creates a complete current schema from empty input', () => {
    const database = migrateDatabase(undefined);

    expect(database.schemaVersion).toBe(3);
    expect(database.codes).toEqual([]);
    expect(database.collections).toEqual([]);
    expect(database.folders).toEqual([]);
    expect(database.qrDesigns).toEqual([]);
    expect(database.customSearchProviders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'web-search',
          enabled: true,
        }),
      ]),
    );
    expect(database.settings.scanner.defaultScanMode).toBe('automatic');
    expect(database.templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: 'restaurant-menu'}),
        expect.objectContaining({id: 'business-payment'}),
      ]),
    );
  });

  test('upgrades old snapshots without destroying user data', () => {
    const database = migrateDatabase({
      schemaVersion: 1,
      codes: [
        {
          content: 'https://example.com',
          createdAt: '2026-09-25T00:00:00.000Z',
          format: 'qr-code',
          id: 'code-existing',
          isFavorite: true,
          source: 'generated',
          type: 'qr',
          updatedAt: '2026-09-25T00:00:00.000Z',
        },
      ],
      settings: {
        scanner: {
          confirmScansManually: false,
        },
      },
      templates: [
        {
          category: 'Personal',
          configuration: {generatorId: 'text'},
          id: 'custom-template',
          isBuiltIn: false,
          name: 'Custom',
        },
      ],
    });

    expect(database.schemaVersion).toBe(3);
    expect(database.codes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'code-existing',
          isFavorite: true,
        }),
      ]),
    );
    expect(database.settings.scanner.confirmScansManually).toBe(false);
    expect(database.settings.scanner.defaultScanMode).toBe('automatic');
    expect(database.collections).toEqual([]);
    expect(database.templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: 'custom-template'}),
        expect.objectContaining({id: 'restaurant-menu'}),
      ]),
    );
  });
});
