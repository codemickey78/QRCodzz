import {databaseClient} from '../../database/databaseClient';
import {AppScannerService} from './AppScannerService';

export const scannerService = new AppScannerService(
  databaseClient.repositories.codes,
);
