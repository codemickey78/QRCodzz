export type CodeType = 'qr' | 'barcode';
export type CodeSource = 'scanned' | 'generated';

export type CodeItem = {
  id: string;
  type: CodeType;
  format: string;
  content: string;
  title?: string;
  description?: string;
  source: CodeSource;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  isFavorite: boolean;
  isProtected?: boolean;
  folderId?: string;
  designConfig?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
