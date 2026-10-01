import {AppSettings} from '../entities/AppSettings';

export type SettingsUpdate = {
  appearance?: Partial<AppSettings['appearance']>;
  scanner?: Partial<AppSettings['scanner']>;
};

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  updateAppearanceSettings(
    input: Partial<AppSettings['appearance']>,
  ): Promise<AppSettings>;
  updateScannerSettings(input: Partial<AppSettings['scanner']>): Promise<AppSettings>;
  updateSettings(input: SettingsUpdate): Promise<AppSettings>;
}
