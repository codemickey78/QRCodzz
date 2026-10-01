import {MainTabName} from './navigationTypes';

export type TabConfig = {
  name: MainTabName;
  label: string;
  accessibilityLabel: string;
};

export const mainTabs: TabConfig[] = [
  {
    name: 'Scan',
    label: 'Scan',
    accessibilityLabel: 'Open scanner workspace',
  },
  {
    name: 'Create',
    label: 'Create',
    accessibilityLabel: 'Open code creation workspace',
  },
  {
    name: 'Library',
    label: 'Library',
    accessibilityLabel: 'Open saved code library',
  },
  {
    name: 'Settings',
    label: 'Settings',
    accessibilityLabel: 'Open application settings',
  },
];
