import {LocalDatabase} from '../adapters/LocalDatabase';
import {LocalCodeRepository} from './LocalCodeRepository';
import {LocalCollectionRepository} from './LocalCollectionRepository';
import {LocalCustomSearchProviderRepository} from './LocalCustomSearchProviderRepository';
import {LocalFolderRepository} from './LocalFolderRepository';
import {LocalQRDesignRepository} from './LocalQRDesignRepository';
import {LocalSettingsRepository} from './LocalSettingsRepository';
import {LocalTemplateRepository} from './LocalTemplateRepository';

export function createRepositories(database: LocalDatabase) {
  return {
    codes: new LocalCodeRepository(database),
    collections: new LocalCollectionRepository(database),
    customSearchProviders: new LocalCustomSearchProviderRepository(database),
    folders: new LocalFolderRepository(database),
    qrDesigns: new LocalQRDesignRepository(database),
    settings: new LocalSettingsRepository(database),
    templates: new LocalTemplateRepository(database),
  };
}

export type AppRepositories = ReturnType<typeof createRepositories>;
