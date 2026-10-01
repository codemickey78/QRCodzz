import { NavigatorScreenParams } from '@react-navigation/native';

export type ScanStackParamList = {
  ScanHome: undefined;
  CameraScanner: { openGallery?: boolean } | undefined;
  ScanResult: { codeId: string };
};

export type CreateStackParamList = {
  CreateHome: undefined;
  GeneratorForm: {
    generatorId?: string;
    initialPayload?: Record<string, unknown>;
    mode?: 'qr' | 'barcode';
    templateName?: string;
  };
  QRPreview: { codeId: string };
  BarcodePreview: { codeId: string };
  QRStudio: { codeId?: string };
  BatchGenerator: undefined;
};

export type LibraryStackParamList = {
  LibraryHome: undefined;
  CodeDetails: { codeId: string };
  CollectionDetails: { collectionId: string };
  FolderDetails: { folderId: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  ScannerSettings: undefined;
  Appearance: undefined;
  Premium: undefined;
  AboutApp: undefined;
  HelpSupport: undefined;
  DataManagement: undefined;
  PrivacySecurity: undefined;
};

export type MainTabParamList = {
  Scan: NavigatorScreenParams<ScanStackParamList>;
  Create: NavigatorScreenParams<CreateStackParamList>;
  Library: NavigatorScreenParams<LibraryStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type MainTabName = keyof MainTabParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}
