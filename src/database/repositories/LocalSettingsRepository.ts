import {LocalDatabase} from '../adapters/LocalDatabase';
import {AppSettings} from '../entities/AppSettings';
import {SettingsRepository, SettingsUpdate} from './SettingsRepository';

export class LocalSettingsRepository implements SettingsRepository {
  constructor(private readonly database: LocalDatabase) {}

  async getSettings() {
    const {settings} = await this.database.getSnapshot();
    return settings;
  }

  async updateAppearanceSettings(input: Partial<AppSettings['appearance']>) {
    return this.updateSettings({appearance: input});
  }

  async updateScannerSettings(input: Partial<AppSettings['scanner']>) {
    return this.updateSettings({scanner: input});
  }

  async updateSettings(input: SettingsUpdate) {
    const snapshot = await this.database.updateSnapshot(database => ({
      ...database,
      settings: {
        appearance: {
          ...database.settings.appearance,
          ...input.appearance,
        },
        scanner: {
          ...database.settings.scanner,
          ...input.scanner,
        },
      },
    }));

    return snapshot.settings;
  }
}
