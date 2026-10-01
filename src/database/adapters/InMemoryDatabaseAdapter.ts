import {KeyValueStorageAdapter} from './KeyValueStorageAdapter';

export class InMemoryDatabaseAdapter implements KeyValueStorageAdapter {
  private storage = new Map<string, string>();

  async getItem(key: string) {
    return this.storage.get(key) ?? null;
  }

  async removeItem(key: string) {
    this.storage.delete(key);
  }

  async setItem(key: string, value: string) {
    this.storage.set(key, value);
  }
}
