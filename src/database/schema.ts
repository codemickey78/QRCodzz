import {appConfig} from '../app/config/appConfig';
import {builtInTemplates} from './defaultTemplates';
import {defaultAppSettings, AppSettings} from './entities/AppSettings';
import {CodeItem} from './entities/CodeItem';
import {Collection} from './entities/Collection';
import {CustomSearchProvider} from './entities/CustomSearchProvider';
import {Folder} from './entities/Folder';
import {QRDesign} from './entities/QRDesign';
import {Template} from './entities/Template';

export type LocalDatabaseSchema = {
  schemaVersion: number;
  codes: CodeItem[];
  collections: Collection[];
  customSearchProviders: CustomSearchProvider[];
  folders: Folder[];
  qrDesigns: QRDesign[];
  settings: AppSettings;
  templates: Template[];
};

export function createInitialDatabase(): LocalDatabaseSchema {
  return {
    schemaVersion: appConfig.storageSchemaVersion,
    codes: [],
    collections: [],
    customSearchProviders: [
      {
        id: 'web-search',
        name: 'Web search',
        urlTemplate: 'https://www.google.com/search?q={content}',
        supportedFormats: ['QR', 'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E'],
        enabled: true,
      },
    ],
    folders: [],
    qrDesigns: [],
    settings: defaultAppSettings,
    templates: builtInTemplates,
  };
}
