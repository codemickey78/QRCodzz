import {databaseClient} from '../../database/databaseClient';
import {AppSettingsService} from './AppSettingsService';

export const settingsService = new AppSettingsService(
  databaseClient.repositories.settings,
);
