import {Vibration} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {loadImage} from 'react-native-nitro-image';
import {createBarcodeScanner} from 'react-native-vision-camera-barcode-scanner';

import {CodeRepository} from '../../database/repositories/CodeRepository';
import {
  getFormatsForMode,
  NormalizedScanResult,
  ScannerMode,
} from './scannerTypes';
import {scanResultParser} from './ScanResultParser';

export class AppScannerService {
  constructor(private readonly codeRepository: CodeRepository) {}

  async persistScan(result: NormalizedScanResult) {
    const parsedResult = scanResultParser.parse({
      format: result.format,
      raw: result.content,
    });

    return this.codeRepository.create({
      content: result.content,
      format: result.format,
      isFavorite: false,
      metadata: {
        parsedResult,
        source: result.source,
        valueType: result.valueType,
      },
      source: 'scanned',
      title: parsedResult.displayValue,
      type: result.format === 'qr-code' ? 'qr' : 'barcode',
    });
  }

  async getScanResult(codeId: string) {
    const code = await this.codeRepository.getById(codeId);

    if (!code) {
      return undefined;
    }

    return {
      code,
      parsedResult: scanResultParser.parse({
        format: code.format,
        raw: code.content,
      }),
    };
  }

  playScanFeedback(settings: {playSound: boolean; vibrate: boolean}) {
    try {
      if (settings.vibrate) {
        Vibration.vibrate(40);
      }
    } catch {
      // Feedback must never block or crash scan persistence.
    }
  }

  async scanImageFromLibrary(mode: ScannerMode) {
    const response = await launchImageLibrary({
      assetRepresentationMode: 'current',
      includeBase64: true,
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    });

    const asset = response.assets?.[0];

    if (response.didCancel || !asset) {
      return [];
    }

    const image = await loadPickedImage(asset);
    const scanner = createBarcodeScanner({
      barcodeFormats: getFormatsForMode(mode),
    });

    try {
      const firstPass = await scanner.scanCodesInImageAsync(image);

      if (firstPass.length > 0) {
        return firstPass;
      }

      const largestSide = Math.max(image.width, image.height);

      if (largestSide >= 1400) {
        return firstPass;
      }

      const scale = Math.min(3, 1400 / Math.max(largestSide, 1));
      const resizedImage = image.resize(
        Math.round(image.width * scale),
        Math.round(image.height * scale),
      );

      try {
        return await scanner.scanCodesInImageAsync(resizedImage);
      } finally {
        resizedImage.dispose();
      }
    } finally {
      image.dispose();
      scanner.dispose();
    }
  }
}

type PickedAsset = NonNullable<
  Awaited<ReturnType<typeof launchImageLibrary>>['assets']
>[number];

async function loadPickedImage(asset?: PickedAsset) {
  const uri = asset?.originalPath ?? asset?.uri;

  if (!uri) {
    throw new Error('No image was selected.');
  }

  try {
    return await loadImage(uri.startsWith('http') ? {url: uri} : {filePath: uri});
  } catch (error) {
    if (!asset?.base64 || !asset.width || !asset.height) {
      throw error;
    }

    return loadImage({
      encodedImageData: {
        buffer: base64ToArrayBuffer(asset.base64),
        height: asset.height,
        imageFormat: imageFormatForAsset(asset),
        width: asset.width,
      },
    });
  }
}

function imageFormatForAsset(asset: PickedAsset) {
  const value = `${asset.type ?? ''} ${asset.fileName ?? ''}`.toLowerCase();

  if (value.includes('png')) {
    return 'png' as const;
  }

  if (value.includes('heic') || value.includes('heif')) {
    return 'heic' as const;
  }

  return 'jpg' as const;
}

function base64ToArrayBuffer(value: string) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const cleanValue = value.replace(/[^A-Za-z0-9+/=]/g, '');
  const outputLength =
    Math.floor((cleanValue.length * 3) / 4) -
    (cleanValue.endsWith('==') ? 2 : cleanValue.endsWith('=') ? 1 : 0);
  const bytes = new Uint8Array(outputLength);
  let buffer = 0;
  let bits = 0;
  let byteIndex = 0;

  for (let index = 0; index < cleanValue.length; index += 1) {
    const character = cleanValue[index];

    if (character === '=') {
      break;
    }

    const valueIndex = alphabet.indexOf(character);

    if (valueIndex < 0) {
      continue;
    }

    buffer = buffer * 64 + valueIndex;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes[byteIndex] = Math.floor(buffer / 2 ** bits) % 256;
      byteIndex += 1;
      buffer %= 2 ** bits;
    }
  }

  return bytes.buffer;
}
