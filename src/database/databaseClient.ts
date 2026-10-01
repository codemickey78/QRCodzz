import {asyncStorageKeyValueAdapter} from './adapters/AsyncStorageKeyValueAdapter';
import {LocalDatabase} from './adapters/LocalDatabase';
import {createRepositories} from './repositories/createRepositories';

const database = new LocalDatabase(asyncStorageKeyValueAdapter);

export const databaseClient = {
  database,
  repositories: createRepositories(database),
};
