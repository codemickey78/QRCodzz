import {AppSettings} from '../../database/entities/AppSettings';
import {SettingsRepository} from '../../database/repositories/SettingsRepository';

export class AppSettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  getSettings() {
    return this.settingsRepository.getSettings();
  }

  updateAppearanceSettings(input: Partial<AppSettings['appearance']>) {
    return this.settingsRepository.updateAppearanceSettings(input);
  }

  updateScannerSettings(input: Partial<AppSettings['scanner']>) {
    return this.settingsRepository.updateScannerSettings(input);
  }
}
