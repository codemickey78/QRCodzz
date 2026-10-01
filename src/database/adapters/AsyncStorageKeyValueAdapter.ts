import AsyncStorage from '@react-native-async-storage/async-storage';

import {KeyValueStorageAdapter} from './KeyValueStorageAdapter';

export const asyncStorageKeyValueAdapter: KeyValueStorageAdapter = {
  getItem: key => AsyncStorage.getItem(key),
  removeItem: key => AsyncStorage.removeItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};
