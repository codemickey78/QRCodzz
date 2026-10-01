import {InMemoryDatabaseAdapter} from '../src/database/adapters/InMemoryDatabaseAdapter';
import {LocalDatabase} from '../src/database/adapters/LocalDatabase';
import {defaultAppSettings} from '../src/database/entities/AppSettings';
import {createRepositories} from '../src/database/repositories/createRepositories';

function createTestRepositories() {
  const database = new LocalDatabase(new InMemoryDatabaseAdapter());
  return createRepositories(database);
}

describe('local repositories', () => {
  test('creates, searches, updates, and deletes codes', async () => {
    const repositories = createTestRepositories();

    const code = await repositories.codes.create({
      content: 'https://example.com/product/123',
      format: 'QR',
      isFavorite: false,
      source: 'generated',
      title: 'Product landing page',
      type: 'qr',
    });

    await expect(repositories.codes.getById(code.id)).resolves.toMatchObject({
      content: 'https://example.com/product/123',
      type: 'qr',
    });

    await expect(
      repositories.codes.search({search: 'landing'}),
    ).resolves.toHaveLength(1);

    const updatedCode = await repositories.codes.update(code.id, {
      isFavorite: true,
    });

    expect(updatedCode.isFavorite).toBe(true);

    await repositories.codes.delete(code.id);
    await expect(repositories.codes.getAll()).resolves.toHaveLength(0);
  });

  test('keeps folder deletion non-destructive for code records', async () => {
    const repositories = createTestRepositories();

    const folder = await repositories.folders.create({
      icon: 'archive',
      name: 'Receipts',
    });

    const code = await repositories.codes.create({
      content: 'INV-001',
      folderId: folder.id,
      format: 'Code 128',
      isFavorite: false,
      source: 'scanned',
      type: 'barcode',
    });

    await repositories.folders.delete(folder.id);

    await expect(repositories.codes.getById(code.id)).resolves.toMatchObject({
      folderId: undefined,
      id: code.id,
    });
  });

  test('loads default settings and persists updates', async () => {
    const repositories = createTestRepositories();

    await expect(repositories.settings.getSettings()).resolves.toEqual(
      defaultAppSettings,
    );

    const settings = await repositories.settings.updateScannerSettings({
      copyAfterScan: true,
    });

    expect(settings.scanner.copyAfterScan).toBe(true);
    expect(settings.appearance).toEqual(defaultAppSettings.appearance);
  });

  test('keeps built-in templates queryable', async () => {
    const repositories = createTestRepositories();

    const templates = await repositories.templates.getBuiltIns();

    expect(templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'Restaurant',
          id: 'restaurant-menu',
          isBuiltIn: true,
          name: 'Menu QR',
        }),
        expect.objectContaining({
          category: 'Creator',
          id: 'creator-tiktok',
          isBuiltIn: true,
        }),
        expect.objectContaining({
          category: 'Business',
          id: 'business-payment',
          isBuiltIn: true,
        }),
      ]),
    );
    expect(
      templates.every(template => template.configuration.generatorId),
    ).toBe(true);
  });

  test('adds and removes collection items without duplicating code records', async () => {
    const repositories = createTestRepositories();

    const menu = await repositories.codes.create({
      content: 'https://example.com/menu',
      format: 'QR',
      isFavorite: false,
      source: 'generated',
      title: 'Menu',
      type: 'qr',
    });
    const wifi = await repositories.codes.create({
      content: 'WIFI:T:WPA;S:Cafe;P:secret;;',
      format: 'QR',
      isFavorite: false,
      source: 'generated',
      title: 'Wi-Fi',
      type: 'qr',
    });
    const collection = await repositories.collections.create({
      description: 'Front-of-house codes',
      itemIds: [menu.id],
      title: 'My Restaurant',
    });

    const withWifi = await repositories.collections.addItem(
      collection.id,
      wifi.id,
    );
    const deduped = await repositories.collections.addItem(
      collection.id,
      wifi.id,
    );
    const withoutMenu = await repositories.collections.removeItem(
      collection.id,
      menu.id,
    );

    expect(withWifi.itemIds).toEqual([menu.id, wifi.id]);
    expect(deduped.itemIds).toEqual([menu.id, wifi.id]);
    expect(withoutMenu.itemIds).toEqual([wifi.id]);
    await expect(repositories.codes.getAll()).resolves.toHaveLength(2);
  });
});
