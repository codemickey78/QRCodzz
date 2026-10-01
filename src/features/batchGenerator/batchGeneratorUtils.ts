import {
  BarcodeFormat,
  normalizeBarcodeContent,
} from '../../services/barcode/BarcodeService';

export type BatchOutputFormat = 'QR' | BarcodeFormat;
export type BatchInputMethod = 'paste' | 'csv' | 'txt' | 'json' | 'sequence';

export type BatchSequenceInput = {
  end: string;
  padding: string;
  prefix: string;
  start: string;
  suffix: string;
};

export type BatchDraftRow = {
  format?: BatchOutputFormat;
  value: string;
};

export type BatchValidatedRow = {
  encodedContent: string;
  filename: string;
  format: BatchOutputFormat;
  index: number;
  message?: string;
  valid: boolean;
  value: string;
};

export const batchOutputFormats: BatchOutputFormat[] = [
  'QR',
  'Code 128',
  'EAN-13',
  'EAN-8',
  'UPC-A',
  'UPC-E',
  'Code 39',
  'Code 93',
  'Codabar',
  'ITF',
  'Data Matrix',
  'PDF417',
  'Aztec',
];

export function parseBatchInput(
  method: BatchInputMethod,
  input: string,
  fallbackFormat: BatchOutputFormat,
) {
  switch (method) {
    case 'csv':
      return parseCsvInput(input, fallbackFormat);
    case 'json':
      return parseJsonInput(input, fallbackFormat);
    case 'txt':
    case 'paste':
    default:
      return parseLineInput(input, fallbackFormat);
  }
}

export function buildSequenceRows(
  input: BatchSequenceInput,
  format: BatchOutputFormat,
) {
  const start = Number(input.start);
  const end = Number(input.end);
  const padding = Math.max(0, Number(input.padding) || 0);

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    end < start ||
    end - start > 999
  ) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const value = start + offset;
    return {
      format,
      value: `${input.prefix}${String(value).padStart(padding, '0')}${
        input.suffix
      }`,
    };
  });
}

export function validateBatchRows(
  rows: BatchDraftRow[],
  fallbackFormat: BatchOutputFormat,
) {
  return rows.map((row, index) => {
    const format = row.format ?? fallbackFormat;
    const value = row.value.trim();
    const validation = validateBatchValue(format, value);

    return {
      encodedContent: validation.encodedContent,
      filename: buildBatchFilename(value, format, index + 1),
      format,
      index: index + 1,
      message: validation.message,
      valid: validation.valid,
      value,
    };
  });
}

export function summarizeBatch(rows: BatchValidatedRow[]) {
  const valid = rows.filter(row => row.valid).length;
  return {
    invalid: rows.length - valid,
    total: rows.length,
    valid,
  };
}

export function buildBatchFilename(
  value: string,
  format: BatchOutputFormat,
  index: number,
) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 36);
  const prefix = slug || format.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return `${String(index).padStart(3, '0')}_${prefix}.png`;
}

function parseLineInput(input: string, fallbackFormat: BatchOutputFormat) {
  return input
    .split(/\r?\n/)
    .map(value => value.trim())
    .filter(Boolean)
    .map(value => ({ format: fallbackFormat, value }));
}

function parseCsvInput(input: string, fallbackFormat: BatchOutputFormat) {
  return input
    .split(/\r?\n/)
    .map(line => parseCsvLine(line))
    .filter(columns => columns.some(Boolean))
    .map(columns => {
      const [value, format] = columns;
      return {
        format: parseBatchFormat(format) ?? fallbackFormat,
        value: value.trim(),
      };
    })
    .filter(row => row.value);
}

function parseJsonInput(input: string, fallbackFormat: BatchOutputFormat) {
  try {
    const parsed = JSON.parse(input);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;

    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map(item => {
        if (typeof item === 'string' || typeof item === 'number') {
          return { format: fallbackFormat, value: String(item) };
        }

        if (!item || typeof item !== 'object') {
          return undefined;
        }

        const value = String(item.value ?? item.content ?? '').trim();
        const format = parseBatchFormat(String(item.format ?? ''));
        return value ? { format: format ?? fallbackFormat, value } : undefined;
      })
      .filter(Boolean) as BatchDraftRow[];
  } catch {
    return [];
  }
}

function parseCsvLine(line: string) {
  const columns: string[] = [];
  let current = '';
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === ',' && !quoted) {
      columns.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  columns.push(current.trim());
  return columns;
}

function parseBatchFormat(value?: string) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return batchOutputFormats.find(
    format =>
      format.toLowerCase() === normalized ||
      format.toLowerCase().replace(/[^a-z0-9]/g, '') ===
        normalized.replace(/[^a-z0-9]/g, ''),
  );
}

function validateQrValue(value: string) {
  return value
    ? { valid: true }
    : { message: 'QR content is required.', valid: false };
}

function validateBatchValue(format: BatchOutputFormat, value: string) {
  if (format === 'QR') {
    const validation = validateQrValue(value);
    return {
      encodedContent: value,
      message: validation.message,
      valid: validation.valid,
    };
  }

  const validation = normalizeBarcodeContent(format, value);
  return {
    encodedContent: validation.valid ? validation.content ?? value : value,
    message: validation.message,
    valid: validation.valid,
  };
}
