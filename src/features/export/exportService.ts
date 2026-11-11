import {PermissionsAndroid, Platform} from 'react-native';

import { appConfig } from '../../app/config/appConfig';
import { CodeItem } from '../../database/entities/CodeItem';
import { Collection } from '../../database/entities/Collection';
import { Folder } from '../../database/entities/Folder';
import { LocalDatabaseSchema } from '../../database/schema';
import {RewardedAccessResult} from '../../services/purchase/PurchaseService';
import {BarcodeRenderService} from '../../services/barcode/BarcodeRenderService';
import {
  defaultQRDesignConfig,
  frameTemplateLabels,
  QRDesignConfig,
} from '../qrStudio/qrDesignTypes';
import {parseQRDesignConfig} from '../qrStudio/qrDesignValidation';

export type ExportResolution = 512 | 1024 | 2048 | 'custom';
export type ExportImageFormat = 'png' | 'svg' | 'pdf';
export type PrintPaperSize = 'A4' | 'Letter' | 'Custom';

export type CodeImageExportOptions = {
  backgroundTransparent?: boolean;
  customSize?: number;
  format: ExportImageFormat;
  resolution: ExportResolution;
};

export type CodeImageExportJob = {
  codeId: string;
  content: string;
  designConfig?: Record<string, unknown>;
  filename: string;
  format: ExportImageFormat;
  height: number;
  mimeType: string;
  transparentBackground: boolean;
  type: 'qr' | 'barcode';
  width: number;
};

export type CodePngExport = {
  base64: string;
  dataUri: string;
  filename: string;
  height: number;
  width: number;
};

export type PrintSheetOptions = {
  barcodeSize: number;
  columns: number;
  margin: number;
  paperSize: PrintPaperSize;
  qrSize: number;
  rows: number;
  showCodeValue: boolean;
  showTitle: boolean;
};

export type PrintSheetManifest = {
  fileName: string;
  items: Array<{
    content: string;
    format: string;
    id: string;
    title?: string;
    type: 'qr' | 'barcode';
  }>;
  options: PrintSheetOptions;
  quietZone: number;
};

export type BackupPayload = {
  appName: string;
  backupVersion: 1;
  codes: LocalDatabaseSchema['codes'];
  collections: LocalDatabaseSchema['collections'];
  customSearchProviders: LocalDatabaseSchema['customSearchProviders'];
  exportedAt: string;
  folders: LocalDatabaseSchema['folders'];
  qrDesigns: LocalDatabaseSchema['qrDesigns'];
  schemaVersion: number;
  settings: LocalDatabaseSchema['settings'];
  templates: LocalDatabaseSchema['templates'];
};

export type CollectionExportPayload = {
  appName: string;
  collection: Collection;
  exportedAt: string;
  items: CodeItem[];
};

export type CollectionShareItem = {
  content: string;
  format: string;
  id: string;
  title?: string;
  type: 'qr' | 'barcode';
};

export type BackupValidationResult =
  | { backup: BackupPayload; errors: string[]; valid: true; warnings: string[] }
  | { errors: string[]; valid: false; warnings: string[] };

export type BackupMergeResult = {
  duplicateIds: string[];
  importedCodes: number;
  importedCollections: number;
  importedFolders: number;
  importedQRDesigns: number;
  importedTemplates: number;
  snapshot: LocalDatabaseSchema;
};

const backupVersion = 1;
const supportedSchemaVersion = appConfig.storageSchemaVersion;

export function createCodeImageExportJob(
  code: CodeItem,
  options: CodeImageExportOptions,
): CodeImageExportJob {
  const size = resolveExportSize(options);
  const format = options.format;

  return {
    codeId: code.id,
    content: code.content,
    designConfig: code.designConfig,
    filename: `${slugify(code.title || code.content || code.id)}.${format}`,
    format,
    height: size,
    mimeType: mimeTypeForFormat(format),
    transparentBackground:
      code.type === 'qr' && Boolean(options.backgroundTransparent),
    type: code.type,
    width: size,
  };
}

export async function createCodePngDataUri(
  code: CodeItem,
  options: CodeImageExportOptions,
): Promise<CodePngExport> {
  const job = createCodeImageExportJob(code, options);
  const size = job.width;
  const foregroundColor =
    typeof code.designConfig?.foregroundColor === 'string'
      ? code.designConfig.foregroundColor
      : '#101214';
  const backgroundColor =
    !job.transparentBackground &&
    typeof code.designConfig?.backgroundColor === 'string'
      ? code.designConfig.backgroundColor
      : '#FFFFFF';
  const renderedCode = await BarcodeRenderService.createDataUrl({
    backgroundColor,
    content: code.content,
    foregroundColor,
    format: code.format,
    includeText: code.type === 'barcode',
    ...barcodeRenderMetadata(code.metadata),
    padding: code.type === 'qr' ? 4 : 8,
    scale: code.type === 'qr' ? Math.max(8, Math.round(size / 64)) : 3,
    type: code.type,
  });
  const dataUri = renderedCode.uri;

  if (code.type === 'qr') {
    const designConfig = parseQRDesignConfig(code.designConfig);

    if (designConfig.frameTemplate !== 'none') {
      return createFramedQrPngExport({
        backgroundColor,
        dataUri,
        designConfig,
        foregroundColor,
        filename: job.filename,
        qrHeight: renderedCode.height,
        qrWidth: renderedCode.width,
        size,
      });
    }
  }

  const base64 = dataUri.replace(/^data:image\/png;base64,/, '');

  return {
    base64,
    dataUri,
    filename: job.filename,
    height: size,
    width: size,
  };
}

async function createFramedQrPngExport({
  backgroundColor,
  dataUri,
  designConfig,
  filename,
  foregroundColor,
  qrHeight,
  qrWidth,
  size,
}: {
  backgroundColor: string;
  dataUri: string;
  designConfig: QRDesignConfig;
  filename: string;
  foregroundColor: string;
  qrHeight: number;
  qrWidth: number;
  size: number;
}): Promise<CodePngExport> {
  const {Images} =
    require('react-native-nitro-image') as typeof import('react-native-nitro-image');
  const baseQr = dataUri.replace(/^data:image\/png;base64,/, '');
  const decodedQr = await Images.loadFromEncodedImageDataAsync({
    buffer: base64ToArrayBuffer(baseQr),
    height: qrHeight,
    imageFormat: 'png',
    width: qrWidth,
  });

  try {
    const qrPixels = await decodedQr.toRawPixelDataAsync();
    const frameLabel =
      designConfig.frameTemplate === 'custom'
        ? designConfig.frameText
        : frameTemplateLabels[designConfig.frameTemplate] ??
          defaultQRDesignConfig.frameText;
    const canvasWidth = size;
    const labelHeight = Math.max(52, Math.round(size * 0.12));
    const framePadding = Math.max(18, Math.round(size * 0.045));
    const borderWidth = Math.max(4, Math.round(size * 0.01));
    const canvasHeight = size + labelHeight + framePadding * 2;
    const background = parseHexColor(backgroundColor);
    const foreground = parseHexColor(foregroundColor);
    const framedPixels = createPixelBufferForDimensions(
      canvasWidth,
      canvasHeight,
      background,
    );
    const qrTop = labelHeight + framePadding;
    const qrLeft = framePadding;
    const qrSize = size - framePadding * 2;

    fillRect(
      framedPixels,
      canvasWidth,
      0,
      0,
      canvasWidth,
      canvasHeight,
      background,
    );
    strokeRect(
      framedPixels,
      canvasWidth,
      framePadding / 2,
      labelHeight / 2,
      canvasWidth - framePadding,
      canvasHeight - labelHeight / 2 - framePadding / 2,
      borderWidth,
      foreground,
    );
    drawCenteredText(
      framedPixels,
      canvasWidth,
      canvasHeight,
      frameLabel.toUpperCase(),
      Math.round(labelHeight * 0.32),
      Math.round(labelHeight * 0.24),
      foreground,
    );
    drawImageNearest(
      framedPixels,
      canvasWidth,
      qrLeft,
      qrTop,
      qrSize,
      qrSize,
      qrPixels,
    );

    const base64 = encodePng(framedPixels, canvasWidth, canvasHeight);

    return {
      base64,
      dataUri: `data:image/png;base64,${base64}`,
      filename,
      height: canvasHeight,
      width: canvasWidth,
    };
  } finally {
    decodedQr.dispose();
  }
}

function barcodeRenderMetadata(metadata?: Record<string, unknown>) {
  const payload =
    metadata?.payload && typeof metadata.payload === 'object'
      ? (metadata.payload as Record<string, unknown>)
      : {};

  return {
    altText: typeof payload.altText === 'string' ? payload.altText : undefined,
    options: typeof payload.options === 'string' ? payload.options : undefined,
  };
}

export async function saveCodePngToTemporaryFile(image: CodePngExport) {
  const {Images} =
    require('react-native-nitro-image') as typeof import('react-native-nitro-image');
  const decodedImage = await Images.loadFromEncodedImageDataAsync({
    buffer: base64ToArrayBuffer(image.base64),
    height: image.height,
    imageFormat: 'png',
    width: image.width,
  });

  return decodedImage.saveToTemporaryFileAsync('png', 100);
}

export async function saveCodePngForExport(image: CodePngExport) {
  const filePath = await saveCodePngToTemporaryFile(image);
  const fileUri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;

  if (Platform.OS === 'android') {
    await ensureAndroidGalleryWriteAccess();
    const {CameraRoll} =
      require('@react-native-camera-roll/camera-roll') as typeof import('@react-native-camera-roll/camera-roll');
    const asset = await CameraRoll.saveAsset(fileUri, {
      type: 'photo',
    });

    return {
      assetUri: asset.node.image.uri,
      filePath,
      savedToGallery: true,
    };
  }

  return {
    filePath,
    savedToGallery: false,
  };
}

export async function exportCodePngAfterReward(
  requestRewardedAccess: (reason: 'export') => Promise<RewardedAccessResult>,
  createImage: () => Promise<CodePngExport>,
) {
  const reward = await requestRewardedAccess('export');
  if (reward.status !== 'earned') {
    return {reward} as const;
  }

  const image = await createImage();
  const exportFile = await saveCodePngForExport(image);
  return {exportFile, image, reward} as const;
}

async function ensureAndroidGalleryWriteAccess() {
  if (Platform.OS !== 'android' || Number(Platform.Version) > 28) {
    return;
  }

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const hasPermission = await PermissionsAndroid.check(permission);

  if (hasPermission) {
    return;
  }

  const result = await PermissionsAndroid.request(permission);

  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Photo library permission is required to save PNG exports.');
  }
}

export function createPrintSheetManifest(
  codes: CodeItem[],
  options: PrintSheetOptions,
): PrintSheetManifest {
  return {
    fileName: `qr-workspace-print-sheet-${todayStamp()}.pdf`,
    items: codes.slice(0, options.rows * options.columns).map(code => ({
      content: code.content,
      format: code.format,
      id: code.id,
      title: code.title,
      type: code.type,
    })),
    options,
    quietZone: Math.max(16, Math.round(options.qrSize * 0.08)),
  };
}

export function createBackup(snapshot: LocalDatabaseSchema): BackupPayload {
  return {
    appName: appConfig.name,
    backupVersion,
    codes: snapshot.codes,
    collections: snapshot.collections,
    customSearchProviders: snapshot.customSearchProviders,
    exportedAt: new Date().toISOString(),
    folders: snapshot.folders,
    qrDesigns: snapshot.qrDesigns,
    schemaVersion: snapshot.schemaVersion,
    settings: snapshot.settings,
    templates: snapshot.templates,
  };
}

export function createBackupFileName(date = new Date()) {
  return `qr-workspace-backup-${date.toISOString().slice(0, 10)}.json`;
}

export function createCollectionExportPayload(
  collection: Collection,
  codes: CodeItem[],
): CollectionExportPayload {
  return {
    appName: appConfig.name,
    collection,
    exportedAt: new Date().toISOString(),
    items: resolveCollectionItems(collection, codes),
  };
}

export function createCollectionExportFileName(collection: Collection) {
  return `qr-workspace-collection-${slugify(collection.title)}-${todayStamp()}.json`;
}

export function createCollectionShareItems(
  collection: Collection,
  codes: CodeItem[],
): CollectionShareItem[] {
  return resolveCollectionItems(collection, codes).map(code => ({
    content: code.content,
    format: code.format,
    id: code.id,
    title: code.title,
    type: code.type,
  }));
}

export function serializeBackup(backup: BackupPayload) {
  return JSON.stringify(backup, null, 2);
}

export function serializeCollectionExport(exportPayload: CollectionExportPayload) {
  return JSON.stringify(exportPayload, null, 2);
}

export function validateBackupJson(value: string): BackupValidationResult {
  try {
    const parsed = JSON.parse(value);
    return validateBackupPayload(parsed);
  } catch {
    return {
      errors: ['Backup JSON is corrupted or not valid JSON.'],
      valid: false,
      warnings: [],
    };
  }
}

export function validateBackupPayload(value: unknown): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!value || typeof value !== 'object') {
    return {
      errors: ['Backup must be a JSON object.'],
      valid: false,
      warnings,
    };
  }

  const backup = value as Partial<BackupPayload>;

  if (backup.backupVersion !== backupVersion) {
    errors.push('Unsupported backup version.');
  }

  if (backup.schemaVersion !== supportedSchemaVersion) {
    errors.push('Unsupported schema version.');
  }

  for (const key of [
    'codes',
    'collections',
    'folders',
    'qrDesigns',
    'templates',
    'customSearchProviders',
  ] as const) {
    if (!Array.isArray(backup[key])) {
      errors.push(`${key} must be an array.`);
    }
  }

  if (!backup.settings || typeof backup.settings !== 'object') {
    errors.push('settings must be an object.');
  }

  const ids = [
    ...(Array.isArray(backup.codes) ? backup.codes : []),
    ...(Array.isArray(backup.collections) ? backup.collections : []),
    ...(Array.isArray(backup.folders) ? backup.folders : []),
    ...(Array.isArray(backup.qrDesigns) ? backup.qrDesigns : []),
    ...(Array.isArray(backup.templates) ? backup.templates : []),
  ].map(item =>
    item && typeof item === 'object' ? String(item.id ?? '') : '',
  );
  const duplicateIds = findDuplicates(ids.filter(Boolean));

  if (duplicateIds.length) {
    errors.push(`Duplicate IDs in backup: ${duplicateIds.join(', ')}`);
  }

  if (Array.isArray(backup.codes)) {
    backup.codes.forEach((code, index) => {
      if (!isCodeLike(code)) {
        errors.push(`codes[${index}] is missing required fields.`);
      }
    });
  }

  if (Array.isArray(backup.collections)) {
    backup.collections.forEach((collection, index) => {
      if (!isCollectionLike(collection)) {
        errors.push(`collections[${index}] is missing required fields.`);
      }
    });
  }

  if (Array.isArray(backup.folders)) {
    backup.folders.forEach((folder, index) => {
      if (!isFolderLike(folder)) {
        errors.push(`folders[${index}] is missing required fields.`);
      }
    });
  }

  if (errors.length) {
    return { errors, valid: false, warnings };
  }

  return {
    backup: backup as BackupPayload,
    errors,
    valid: true,
    warnings,
  };
}

export function mergeBackupIntoSnapshot(
  snapshot: LocalDatabaseSchema,
  backup: BackupPayload,
): BackupMergeResult {
  const existingIds = new Set([
    ...snapshot.codes.map(item => item.id),
    ...(snapshot.collections ?? []).map(item => item.id),
    ...snapshot.folders.map(item => item.id),
    ...snapshot.qrDesigns.map(item => item.id),
    ...snapshot.templates.map(item => item.id),
  ]);
  const duplicateIds: string[] = [];
  const unique = <T extends { id: string }>(items: T[]) =>
    items.filter(item => {
      if (existingIds.has(item.id)) {
        duplicateIds.push(item.id);
        return false;
      }

      existingIds.add(item.id);
      return true;
    });

  const folders = unique(backup.folders);
  const codes = unique(backup.codes);
  const collections = unique(backup.collections);
  const qrDesigns = unique(backup.qrDesigns);
  const templates = unique(backup.templates);

  return {
    duplicateIds,
    importedCodes: codes.length,
    importedCollections: collections.length,
    importedFolders: folders.length,
    importedQRDesigns: qrDesigns.length,
    importedTemplates: templates.length,
    snapshot: {
      ...snapshot,
      codes: [...codes, ...snapshot.codes],
      collections: [...collections, ...(snapshot.collections ?? [])],
      customSearchProviders: [
        ...snapshot.customSearchProviders,
        ...backup.customSearchProviders.filter(
          provider =>
            !snapshot.customSearchProviders.some(
              existingProvider => existingProvider.id === provider.id,
            ),
        ),
      ],
      folders: [...snapshot.folders, ...folders],
      qrDesigns: [...snapshot.qrDesigns, ...qrDesigns],
      settings: backup.settings,
      templates: [...snapshot.templates, ...templates],
    },
  };
}

function resolveExportSize(options: CodeImageExportOptions) {
  if (options.resolution === 'custom') {
    return clamp(Math.round(options.customSize ?? 1024), 128, 4096);
  }

  return options.resolution;
}

function createPixelBufferForDimensions(
  width: number,
  height: number,
  color: number[],
) {
  const pixels = new Uint8Array(width * height * 4);

  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = color[3] ?? 255;
  }

  return pixels;
}

function strokeRect(
  pixels: Uint8Array,
  imageWidth: number,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number,
  color: number[],
) {
  const left = Math.round(x);
  const top = Math.round(y);
  const rectWidth = Math.round(width);
  const rectHeight = Math.round(height);
  const lineWidth = Math.round(strokeWidth);

  fillRect(pixels, imageWidth, left, top, rectWidth, lineWidth, color);
  fillRect(
    pixels,
    imageWidth,
    left,
    top + rectHeight - lineWidth,
    rectWidth,
    lineWidth,
    color,
  );
  fillRect(pixels, imageWidth, left, top, lineWidth, rectHeight, color);
  fillRect(
    pixels,
    imageWidth,
    left + rectWidth - lineWidth,
    top,
    lineWidth,
    rectHeight,
    color,
  );
}

function drawImageNearest(
  targetPixels: Uint8Array,
  targetWidth: number,
  targetX: number,
  targetY: number,
  targetImageWidth: number,
  targetImageHeight: number,
  source: {
    buffer: ArrayBuffer;
    height: number;
    pixelFormat: string;
    width: number;
  },
) {
  const sourcePixels = new Uint8Array(source.buffer);

  for (let row = 0; row < targetImageHeight; row += 1) {
    const sourceRow = Math.min(
      source.height - 1,
      Math.floor((row / targetImageHeight) * source.height),
    );

    for (let column = 0; column < targetImageWidth; column += 1) {
      const sourceColumn = Math.min(
        source.width - 1,
        Math.floor((column / targetImageWidth) * source.width),
      );
      const sourceIndex = (sourceRow * source.width + sourceColumn) * 4;
      const targetIndex =
        ((targetY + row) * targetWidth + targetX + column) * 4;
      const [red, green, blue, alpha] = readPixel(
        sourcePixels,
        sourceIndex,
        source.pixelFormat,
      );

      targetPixels[targetIndex] = red;
      targetPixels[targetIndex + 1] = green;
      targetPixels[targetIndex + 2] = blue;
      targetPixels[targetIndex + 3] = alpha;
    }
  }
}

function readPixel(pixels: Uint8Array, index: number, pixelFormat: string) {
  switch (pixelFormat) {
    case 'BGRA':
      return [
        pixels[index + 2],
        pixels[index + 1],
        pixels[index],
        pixels[index + 3],
      ];
    case 'ARGB':
      return [
        pixels[index + 1],
        pixels[index + 2],
        pixels[index + 3],
        pixels[index],
      ];
    case 'ABGR':
      return [
        pixels[index + 3],
        pixels[index + 2],
        pixels[index + 1],
        pixels[index],
      ];
    case 'RGB':
      return [pixels[index], pixels[index + 1], pixels[index + 2], 255];
    case 'BGR':
      return [pixels[index + 2], pixels[index + 1], pixels[index], 255];
    case 'RGBA':
    default:
      return [
        pixels[index],
        pixels[index + 1],
        pixels[index + 2],
        pixels[index + 3],
      ];
  }
}

function drawCenteredText(
  pixels: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  text: string,
  centerY: number,
  scale: number,
  color: number[],
) {
  const glyphs = text
    .split('')
    .map(character => glyphForCharacter(character))
    .filter(Boolean);
  const textWidth =
    glyphs.reduce((sum, glyph) => sum + glyph[0].length + 1, 0) * scale;
  let cursorX = Math.max(0, Math.round((imageWidth - textWidth) / 2));
  const top = Math.max(0, Math.round(centerY - (7 * scale) / 2));

  glyphs.forEach(glyph => {
    glyph.forEach((line, row) => {
      line.split('').forEach((mark, column) => {
        if (mark === '1') {
          fillRect(
            pixels,
            imageWidth,
            cursorX + column * scale,
            top + row * scale,
            scale,
            scale,
            color,
          );
        }
      });
    });
    cursorX += (glyph[0].length + 1) * scale;
  });

  if (top + 7 * scale > imageHeight) {
    return;
  }
}

function glyphForCharacter(character: string) {
  const glyphs: Record<string, string[]> = {
    ' ': ['000', '000', '000', '000', '000', '000', '000'],
    '-': ['000', '000', '000', '111', '000', '000', '000'],
    '.': ['00', '00', '00', '00', '00', '11', '11'],
    '@': ['01110', '10001', '10111', '10101', '10111', '10000', '01111'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
    J: ['00001', '00001', '00001', '00001', '10001', '10001', '01110'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  };

  return glyphs[character] ?? glyphs[' '];
}

function fillRect(
  pixels: Uint8Array,
  imageWidth: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number[],
) {
  const imageHeight = pixels.length / 4 / imageWidth;

  for (let row = y; row < y + height; row += 1) {
    if (row < 0 || row >= imageHeight) {
      continue;
    }

    for (let column = x; column < x + width; column += 1) {
      if (column < 0 || column >= imageWidth) {
        continue;
      }

      const index = (row * imageWidth + column) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = color[3] ?? 255;
    }
  }
}

function encodePng(pixels: Uint8Array, width: number, height: number) {
  const scanlineLength = width * 4 + 1;
  const raw = new Uint8Array(scanlineLength * height);

  for (let row = 0; row < height; row += 1) {
    const rawOffset = row * scanlineLength;
    raw[rawOffset] = 0;
    raw.set(
      pixels.subarray(row * width * 4, (row + 1) * width * 4),
      rawOffset + 1,
    );
  }

  return toBase64(
    concatBytes(
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      pngChunk('IHDR', concatBytes(uint32(width), uint32(height), new Uint8Array([8, 6, 0, 0, 0]))),
      pngChunk('IDAT', zlibStore(raw)),
      pngChunk('IEND', new Uint8Array()),
    ),
  );
}

function zlibStore(data: Uint8Array) {
  const blocks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  let offset = 0;

  while (offset < data.length) {
    const length = Math.min(65535, data.length - offset);
    const isFinal = offset + length >= data.length;
    const header = new Uint8Array(5);
    header[0] = isFinal ? 1 : 0;
    header[1] = length & 255;
    header[2] = (length >> 8) & 255;
    const nlen = 0xffff - length;
    header[3] = nlen & 255;
    header[4] = (nlen >> 8) & 255;
    blocks.push(header, data.subarray(offset, offset + length));
    offset += length;
  }

  blocks.push(uint32(adler32(data)));
  return concatBytes(...blocks);
}

function pngChunk(type: string, data: Uint8Array) {
  const typeBytes = ascii(type);
  const crcInput = concatBytes(typeBytes, data);
  return concatBytes(uint32(data.length), crcInput, uint32(crc32(crcInput)));
}

function uint32(value: number) {
  const bytes = new Uint8Array(4);
  bytes[0] = (value >>> 24) & 255;
  bytes[1] = (value >>> 16) & 255;
  bytes[2] = (value >>> 8) & 255;
  bytes[3] = value & 255;
  return bytes;
}

function ascii(value: string) {
  return new Uint8Array(value.split('').map(character => character.charCodeAt(0)));
}

function concatBytes(...arrays: Uint8Array[]) {
  const total = arrays.reduce((sum, array) => sum + array.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  arrays.forEach(array => {
    output.set(array, offset);
    offset += array.length;
  });
  return output;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(data: Uint8Array) {
  let a = 1;
  let b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function toBase64(bytes: Uint8Array) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const triplet = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }

  return output;
}

function base64ToArrayBuffer(value: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = value.replace(/=+$/, '');
  const bytes: number[] = [];

  for (let index = 0; index < clean.length; index += 4) {
    const first = alphabet.indexOf(clean[index]);
    const second = alphabet.indexOf(clean[index + 1]);
    const third = index + 2 < clean.length ? alphabet.indexOf(clean[index + 2]) : 0;
    const fourth = index + 3 < clean.length ? alphabet.indexOf(clean[index + 3]) : 0;
    const chunk =
      (first << 18) |
      (second << 12) |
      ((third & 63) << 6) |
      (fourth & 63);

    bytes.push((chunk >> 16) & 255);
    if (index + 2 < clean.length) {
      bytes.push((chunk >> 8) & 255);
    }
    if (index + 3 < clean.length) {
      bytes.push(chunk & 255);
    }
  }

  return new Uint8Array(bytes).buffer;
}

function parseHexColor(value: string) {
  const normalized = value.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return [16, 18, 20, 255];
  }

  return [0, 2, 4].map(index =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  ).concat(255);
}

function mimeTypeForFormat(format: ExportImageFormat) {
  switch (format) {
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    case 'png':
    default:
      return 'image/png';
  }
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'code'
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach(value => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
}

function isCodeLike(value: unknown) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const code = value as Partial<CodeItem>;
  return Boolean(
    code.id &&
      (code.type === 'qr' || code.type === 'barcode') &&
      typeof code.format === 'string' &&
      typeof code.content === 'string' &&
      (code.source === 'scanned' || code.source === 'generated') &&
      typeof code.createdAt === 'string' &&
      typeof code.updatedAt === 'string' &&
      typeof code.isFavorite === 'boolean',
  );
}

function isCollectionLike(value: unknown) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const collection = value as Partial<Collection>;
  return Boolean(
    collection.id &&
      typeof collection.title === 'string' &&
      Array.isArray(collection.itemIds) &&
      collection.itemIds.every(itemId => typeof itemId === 'string') &&
      typeof collection.createdAt === 'string' &&
      typeof collection.updatedAt === 'string',
  );
}

function isFolderLike(value: unknown) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const folder = value as Partial<Folder>;
  return Boolean(
    folder.id &&
      typeof folder.name === 'string' &&
      typeof folder.createdAt === 'string' &&
      typeof folder.updatedAt === 'string',
  );
}

function resolveCollectionItems(collection: Collection, codes: CodeItem[]) {
  const codesById = new Map(codes.map(code => [code.id, code]));
  return collection.itemIds
    .map(itemId => codesById.get(itemId))
    .filter((code): code is CodeItem => Boolean(code));
}
