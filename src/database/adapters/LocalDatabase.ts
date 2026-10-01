import {appConfig} from '../../app/config/appConfig';
import {migrateDatabase} from '../migrations/migrations';
import {LocalDatabaseSchema} from '../schema';
import {KeyValueStorageAdapter} from './KeyValueStorageAdapter';
import {LocalDatabaseAdapter} from './LocalDatabaseAdapter';

const DATABASE_KEY = '@qrworkspace/local-database';

export class LocalDatabase
  implements LocalDatabaseAdapter<LocalDatabaseSchema>
{
  private snapshot?: LocalDatabaseSchema;

  constructor(private readonly storage: KeyValueStorageAdapter) {}

  async close() {
    this.snapshot = undefined;
  }

  async getSnapshot() {
    await this.initialize();
    return this.snapshot as LocalDatabaseSchema;
  }

  async initialize() {
    if (this.snapshot) {
      return;
    }

    const rawSnapshot = await this.storage.getItem(DATABASE_KEY);
    const parsedSnapshot = rawSnapshot ? JSON.parse(rawSnapshot) : undefined;
    this.snapshot = migrateDatabase(parsedSnapshot);

    if (
      !rawSnapshot ||
      this.snapshot.schemaVersion !== appConfig.storageSchemaVersion
    ) {
      await this.persist(this.snapshot);
    }
  }

  async migrate() {
    const snapshot = await this.getSnapshot();
    this.snapshot = migrateDatabase(snapshot);
    await this.persist(this.snapshot);
  }

  async updateSnapshot(updater: (snapshot: LocalDatabaseSchema) => LocalDatabaseSchema) {
    const snapshot = await this.getSnapshot();
    const nextSnapshot = updater(snapshot);
    this.snapshot = {
      ...nextSnapshot,
      schemaVersion: appConfig.storageSchemaVersion,
    };
    await this.persist(this.snapshot);
    return this.snapshot;
  }

  private async persist(snapshot: LocalDatabaseSchema) {
    await this.storage.setItem(DATABASE_KEY, JSON.stringify(snapshot));
  }
}
