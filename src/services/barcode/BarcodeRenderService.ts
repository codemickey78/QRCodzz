import {CodeItem} from '../../database/entities/CodeItem';
import {
  bwipFormatToBcid,
  twoDimensionalBcidSet,
} from './bwipBarcodeCatalog';
import {PixelRatio} from 'react-native';

type RenderInput = {
  altText?: string;
  backgroundColor?: string;
  content: string;
  foregroundColor?: string;
  format: string;
  height?: number;
  includeText?: boolean;
  options?: Record<string, unknown> | string;
  padding?: number;
  scale?: number;
  type: CodeItem['type'];
};

type BwidOptions = {
  alttext?: string;
  backgroundcolor?: string;
  barcolor?: string;
  bcid: string;
  eclevel?: string;
  height?: number;
  includetext?: boolean;
  padding?: number;
  scale?: number;
  text: string;
  textxalign?: string;
  [key: string]: unknown;
};

export type BarcodeDataUrl = {
  height: number;
  uri: string;
  width: number;
};

const defaultOptionsByBcid: Record<string, Record<string, unknown>> = {
  d3aqr: {
    category: 1,
  },
  mailmark: {
    type: 29,
  },
  rectangularmicroqrcode: {
    version: 'R17x139',
  },
};

export const BarcodeRenderService = {
  createSvg(input: RenderInput) {
    const bwipjs = require('@bwip-js/react-native') as {
      toSVG: (options: BwidOptions) => string;
    };

    return bwipjs.toSVG(createBwipOptions(input));
  },

  async createDataUrl(input: RenderInput): Promise<BarcodeDataUrl> {
    const bwipjs = require('@bwip-js/react-native') as {
      toDataURL: (options: BwidOptions) =>
        | Promise<BarcodeDataUrl | string>
        | BarcodeDataUrl
        | string;
    };

    const result = await Promise.resolve(bwipjs.toDataURL(createBwipOptions(input)));

    if (typeof result === 'string') {
      return {
        height: input.type === 'qr' ? 220 : 116,
        uri: result,
        width: input.type === 'qr' ? 220 : 320,
      };
    }

    return result;
  },

  async createPngDataUri(input: RenderInput) {
    const result = await this.createDataUrl(input);
    return result.uri;
  },

  supportsFormat(format: string) {
    return Boolean(bwipFormatToBcid[format]);
  },
};

export function createBwipOptions(input: RenderInput): BwidOptions {
  const bcid = input.type === 'qr' ? 'qrcode' : bwipFormatToBcid[input.format];

  if (!bcid) {
    throw new Error(`Unsupported barcode format for rendering: ${input.format}`);
  }

  const isTwoDimensional =
    input.type === 'qr' || twoDimensionalBcidSet.has(bcid);

  const parsedOptions =
    typeof input.options === 'string'
      ? parseBwipOptions(input.options)
      : input.options ?? {};
  const defaultOptions = defaultOptionsByBcid[bcid] ?? {};

  const altText =
    input.altText?.trim() ||
    (typeof parsedOptions.alttext === 'string'
      ? parsedOptions.alttext
      : undefined);

  return removeUndefinedOptions({
    backgroundcolor: normalizeColor(input.backgroundColor ?? '#FFFFFF'),
    barcolor: normalizeColor(input.foregroundColor ?? '#101214'),
    eclevel: input.type === 'qr' ? 'H' : undefined,
    height: isTwoDimensional ? undefined : input.height ?? 18,
    includetext: input.includeText ?? (input.type === 'barcode'),
    padding: input.padding ?? (input.type === 'qr' ? 4 : 6),
    scale: input.scale ?? PixelRatio.get(),
    textxalign: 'center',
    ...defaultOptions,
    ...parsedOptions,
    alttext: altText,
    bcid,
    text: input.content,
  });
}

function normalizeColor(value: string) {
  return value.replace('#', '').slice(0, 6);
}

function parseBwipOptions(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .reduce<Record<string, unknown>>((options, token) => {
      const [rawKey, ...rawValueParts] = token.split('=');
      const key = rawKey.trim();

      if (!key) {
        return options;
      }

      const rawValue = rawValueParts.join('=').trim();
      options[key] = rawValue ? coerceOptionValue(rawValue) : true;
      return options;
    }, {});
}

function coerceOptionValue(value: string) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && value.trim() !== ''
    ? numericValue
    : value;
}

function removeUndefinedOptions(options: BwidOptions): BwidOptions {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  ) as BwidOptions;
}
