import {defaultAppSettings} from '../entities/AppSettings';
import {mergeBuiltInTemplates} from '../defaultTemplates';
import {LocalDatabaseSchema, createInitialDatabase} from '../schema';

export type Migration = {
  description: string;
  id: number;
  up: (database: Partial<LocalDatabaseSchema>) => Partial<LocalDatabaseSchema>;
};

const initialDatabase = createInitialDatabase();

export const migrations: Migration[] = [
  {
    id: 1,
    description: 'Initial local-first workspace schema',
    up: database => ({
      ...initialDatabase,
      ...database,
      codes: database.codes ?? [],
      collections: database.collections ?? [],
      customSearchProviders:
        database.customSearchProviders ??
        initialDatabase.customSearchProviders,
      folders: database.folders ?? [],
      qrDesigns: database.qrDesigns ?? [],
      settings: {
        scanner: {
          ...defaultAppSettings.scanner,
          ...database.settings?.scanner,
        },
        appearance: {
          ...defaultAppSettings.appearance,
          ...database.settings?.appearance,
        },
      },
      templates: database.templates ?? initialDatabase.templates,
      schemaVersion: 1,
    }),
  },
  {
    id: 2,
    description: 'Add collections for grouped saved codes',
    up: database => ({
      ...initialDatabase,
      ...database,
      codes: database.codes ?? [],
      collections: database.collections ?? [],
      customSearchProviders:
        database.customSearchProviders ??
        initialDatabase.customSearchProviders,
      folders: database.folders ?? [],
      qrDesigns: database.qrDesigns ?? [],
      settings: {
        scanner: {
          ...defaultAppSettings.scanner,
          ...database.settings?.scanner,
        },
        appearance: {
          ...defaultAppSettings.appearance,
          ...database.settings?.appearance,
        },
      },
      templates: database.templates ?? initialDatabase.templates,
      schemaVersion: 2,
    }),
  },
  {
    id: 3,
    description: 'Add configuration-driven template packs',
    up: database => ({
      ...initialDatabase,
      ...database,
      codes: database.codes ?? [],
      collections: database.collections ?? [],
      customSearchProviders:
        database.customSearchProviders ??
        initialDatabase.customSearchProviders,
      folders: database.folders ?? [],
      qrDesigns: database.qrDesigns ?? [],
      settings: {
        scanner: {
          ...defaultAppSettings.scanner,
          ...database.settings?.scanner,
        },
        appearance: {
          ...defaultAppSettings.appearance,
          ...database.settings?.appearance,
        },
      },
      templates: mergeBuiltInTemplates(database.templates ?? []),
      schemaVersion: 3,
    }),
  },
];

export function migrateDatabase(input?: unknown): LocalDatabaseSchema {
  const database =
    input && typeof input === 'object'
      ? (input as Partial<LocalDatabaseSchema>)
      : createInitialDatabase();

  const currentVersion = database.schemaVersion ?? 0;

  return migrations
    .filter(migration => migration.id > currentVersion)
    .reduce<Partial<LocalDatabaseSchema>>(
      (nextDatabase, migration) => migration.up(nextDatabase),
      database,
    ) as LocalDatabaseSchema;
}
