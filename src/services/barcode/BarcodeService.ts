import {bwipBarcodeCatalog, bwipFormatToBcid} from './bwipBarcodeCatalog';
import {createBwipOptions} from './BarcodeRenderService';

export type BarcodeFormat =
  | 'EAN-13'
  | 'EAN-8'
  | 'UPC-A'
  | 'UPC-E'
  | 'Code 128'
  | 'Code 39'
  | 'Code 93'
  | 'Codabar'
  | 'ITF'
  | 'Data Matrix'
  | 'PDF417'
  | 'Aztec'
  | string;

export type BarcodePayload = {
  content: string;
  format: BarcodeFormat | string;
  options?: Record<string, unknown> | string;
};

export type BarcodeValidationResult = {
  valid: boolean;
  message?: string;
};

export type BarcodeNormalizationResult = BarcodeValidationResult & {
  content?: string;
};

const barcodeFormats: BarcodeFormat[] = bwipBarcodeCatalog.map(item => item.label);

const code39Pattern = /^[0-9A-Z .$/+%-]+$/;
const codabarPattern = /^[ABCD][0-9$:/+.-]+[ABCD]$/;

export const BarcodeService = {
  formats: barcodeFormats,

  validatePayload(payload: BarcodePayload) {
    return validateBarcode(payload.format, payload.content).valid;
  },

  normalizePayload(payload: BarcodePayload): BarcodeNormalizationResult {
    return normalizeBarcodeContent(payload.format, payload.content);
  },

  validateRenderablePayload(payload: BarcodePayload): BarcodeNormalizationResult {
    return validateRenderableBarcode(payload);
  },
};

export function validateBarcode(
  format: BarcodeFormat | string,
  content: string,
): BarcodeValidationResult {
  switch (format) {
    case 'EAN-13':
      return validateEAN13(content);
    case 'EAN-8':
      return validateEAN8(content);
    case 'UPC-A':
      return validateUPCA(content);
    case 'UPC-E':
      return validateUPCE(content);
    case 'Code 39':
      return validateCode39(content);
    case 'Code 93':
      return validateCode93(content);
    case 'Codabar':
      return validateCodabar(content);
    case 'ITF':
    case 'Interleaved 2 of 5 (ITF)':
      return validateITF(content);
    default:
      if (bwipFormatToBcid[format]) {
        return validateNonEmpty(content);
      }

      return { valid: false, message: 'Unsupported barcode format.' };
  }
}

export function normalizeBarcodeContent(
  format: BarcodeFormat | string,
  content: string,
): BarcodeNormalizationResult {
  const normalized = content.trim();
  const validation = validateBarcode(format, normalized);

  if (!validation.valid) {
    return validation;
  }

  switch (format) {
    case 'EAN-13':
      return {
        ...validation,
        content:
          normalized.length === 12
            ? `${normalized}${calculateGtinCheckDigit(normalized)}`
            : normalized,
      };
    case 'EAN-8':
      return {
        ...validation,
        content:
          normalized.length === 7
            ? `${normalized}${calculateGtinCheckDigit(normalized)}`
            : normalized,
      };
    case 'UPC-A':
      return {
        ...validation,
        content:
          normalized.length === 11
            ? `${normalized}${calculateGtinCheckDigit(normalized)}`
            : normalized,
      };
    case 'UPC-E':
      return normalizeUPCE(normalized, validation);
    case 'Code 39':
    case 'Code 93':
    case 'Codabar':
      return { ...validation, content: normalized.toUpperCase() };
    default:
      return { ...validation, content: normalized };
  }
}

export function validateRenderableBarcode(
  payload: BarcodePayload,
): BarcodeNormalizationResult {
  const normalized = normalizeBarcodeContent(payload.format, payload.content);

  if (!normalized.valid || !normalized.content) {
    return normalized;
  }

  try {
    const bwipjs = requireBwipRenderer();

    bwipjs.toSVG(
      createBwipOptions({
        content: normalized.content,
        format: payload.format,
        includeText: true,
        options: payload.options,
        type: 'barcode',
      }),
    );

    return normalized;
  } catch (error) {
    return {
      valid: false,
      message: formatRenderError(error),
    };
  }
}

export function validateEAN13(content: string): BarcodeValidationResult {
  const value = content.trim();

  if (!/^\d{12,13}$/.test(value)) {
    return { valid: false, message: 'EAN-13 must be 12 or 13 digits.' };
  }

  if (value.length === 12) {
    return { valid: true, message: 'Checksum digit will be calculated.' };
  }

  return hasValidGtinCheckDigit(value)
    ? { valid: true }
    : { valid: false, message: 'EAN-13 checksum digit is invalid.' };
}

export function validateEAN8(content: string): BarcodeValidationResult {
  const value = content.trim();

  if (!/^\d{7,8}$/.test(value)) {
    return { valid: false, message: 'EAN-8 must be 7 or 8 digits.' };
  }

  if (value.length === 7) {
    return { valid: true, message: 'Checksum digit will be calculated.' };
  }

  return hasValidGtinCheckDigit(value)
    ? { valid: true }
    : { valid: false, message: 'EAN-8 checksum digit is invalid.' };
}

export function validateUPCA(content: string): BarcodeValidationResult {
  const value = content.trim();

  if (!/^\d{11,12}$/.test(value)) {
    return { valid: false, message: 'UPC-A must be 11 or 12 digits.' };
  }

  if (value.length === 11) {
    return { valid: true, message: 'Checksum digit will be calculated.' };
  }

  return hasValidGtinCheckDigit(value)
    ? { valid: true }
    : { valid: false, message: 'UPC-A checksum digit is invalid.' };
}

export function validateUPCE(content: string): BarcodeValidationResult {
  const value = content.trim();

  if (!/^\d{6,8}$/.test(value)) {
    return { valid: false, message: 'UPC-E must be 6, 7, or 8 digits.' };
  }

  if (value.length === 8 && !['0', '1'].includes(value[0])) {
    return { valid: false, message: 'UPC-E number system must be 0 or 1.' };
  }

  if (value.length < 8) {
    return { valid: true, message: 'Checksum digit will be calculated.' };
  }

  const expanded = expandUPCE(value.slice(0, 7));
  return calculateGtinCheckDigit(expanded) === value[7]
    ? { valid: true }
    : { valid: false, message: 'UPC-E checksum digit is invalid.' };
}

export function validateCode39(content: string): BarcodeValidationResult {
  const value = content.trim().toUpperCase();

  if (!value) {
    return { valid: false, message: 'Code 39 content is required.' };
  }

  return code39Pattern.test(value)
    ? { valid: true }
    : {
        valid: false,
        message: 'Code 39 allows A-Z, numbers, space, and -.$/+%.',
      };
}

export function validateCode93(content: string): BarcodeValidationResult {
  const value = content.trim().toUpperCase();

  if (!value) {
    return { valid: false, message: 'Code 93 content is required.' };
  }

  return /^[\x20-\x7E]+$/.test(value)
    ? { valid: true }
    : { valid: false, message: 'Code 93 requires printable ASCII content.' };
}

export function validateCodabar(content: string): BarcodeValidationResult {
  const value = content.trim().toUpperCase();

  if (!value) {
    return { valid: false, message: 'Codabar content is required.' };
  }

  return codabarPattern.test(value)
    ? { valid: true }
    : {
        valid: false,
        message: 'Codabar must start and end with A, B, C, or D.',
      };
}

export function validateITF(content: string): BarcodeValidationResult {
  const value = content.trim();

  if (!/^\d+$/.test(value)) {
    return { valid: false, message: 'ITF must contain digits only.' };
  }

  return value.length % 2 === 0
    ? { valid: true }
    : { valid: false, message: 'ITF must contain an even number of digits.' };
}

function validateNonEmpty(content: string): BarcodeValidationResult {
  return content.trim()
    ? { valid: true }
    : { valid: false, message: 'Barcode content is required.' };
}

function formatRenderError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.replace(/^bwipp\.[^:]+:\s*/, '');
  }

  return 'This barcode value cannot be rendered for the selected format.';
}

function requireBwipRenderer() {
  try {
    return require('@bwip-js/react-native') as {
      toSVG: (options: Record<string, unknown>) => string;
    };
  } catch {
    return require('bwip-js') as {
      toSVG: (options: Record<string, unknown>) => string;
    };
  }
}

function normalizeUPCE(
  value: string,
  validation: BarcodeValidationResult,
): BarcodeNormalizationResult {
  const body = value.length === 6 ? `0${value}` : value.slice(0, 7);
  const checkDigit = calculateGtinCheckDigit(expandUPCE(body));

  return {
    ...validation,
    content: value.length === 8 ? value : `${body}${checkDigit}`,
  };
}

function hasValidGtinCheckDigit(value: string) {
  return calculateGtinCheckDigit(value.slice(0, -1)) === value.slice(-1);
}

function calculateGtinCheckDigit(value: string) {
  const sum = value
    .split('')
    .reverse()
    .reduce((total, digit, index) => {
      const multiplier = index % 2 === 0 ? 3 : 1;
      return total + Number(digit) * multiplier;
    }, 0);

  return String((10 - (sum % 10)) % 10);
}

function expandUPCE(value: string) {
  const numberSystem = value[0];
  const code = value.slice(1);
  const [d1, d2, d3, d4, d5, d6] = code;

  if (['0', '1', '2'].includes(d6)) {
    return `${numberSystem}${d1}${d2}${d6}0000${d3}${d4}${d5}`;
  }

  if (d6 === '3') {
    return `${numberSystem}${d1}${d2}${d3}00000${d4}${d5}`;
  }

  if (d6 === '4') {
    return `${numberSystem}${d1}${d2}${d3}${d4}00000${d5}`;
  }

  return `${numberSystem}${d1}${d2}${d3}${d4}${d5}0000${d6}`;
}
