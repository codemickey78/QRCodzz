jest.mock(
  '@bwip-js/react-native',
  () => require('../node_modules/bwip-js/dist/bwip-js-node.js'),
  {virtual: true},
);

import {
  BarcodeService,
  normalizeBarcodeContent,
  validateRenderableBarcode,
  validateBarcode,
  validateCodabar,
  validateCode39,
  validateCode93,
  validateEAN13,
  validateEAN8,
  validateITF,
  validateUPCA,
  validateUPCE,
} from '../src/services/barcode/BarcodeService';

describe('barcode validation', () => {
  test('validates and calculates EAN-13 check digits', () => {
    expect(validateEAN13('5901234123457')).toEqual({ valid: true });
    expect(validateEAN13('5901234123450')).toEqual({
      valid: false,
      message: 'EAN-13 checksum digit is invalid.',
    });
    expect(validateEAN13('590123412345')).toEqual({
      valid: true,
      message: 'Checksum digit will be calculated.',
    });
    expect(normalizeBarcodeContent('EAN-13', '590123412345')).toMatchObject({
      content: '5901234123457',
      valid: true,
    });
  });

  test('validates and calculates EAN-8 check digits', () => {
    expect(validateEAN8('96385074')).toEqual({ valid: true });
    expect(validateEAN8('96385070')).toEqual({
      valid: false,
      message: 'EAN-8 checksum digit is invalid.',
    });
    expect(normalizeBarcodeContent('EAN-8', '9638507')).toMatchObject({
      content: '96385074',
      valid: true,
    });
  });

  test('validates and calculates UPC-A check digits', () => {
    expect(validateUPCA('036000291452')).toEqual({ valid: true });
    expect(validateUPCA('036000291450')).toEqual({
      valid: false,
      message: 'UPC-A checksum digit is invalid.',
    });
    expect(normalizeBarcodeContent('UPC-A', '03600029145')).toMatchObject({
      content: '036000291452',
      valid: true,
    });
  });

  test('validates and calculates UPC-E check digits', () => {
    expect(validateUPCE('04210007')).toEqual({ valid: true });
    expect(validateUPCE('24210007')).toEqual({
      valid: false,
      message: 'UPC-E number system must be 0 or 1.',
    });
    expect(validateUPCE('04210000')).toEqual({
      valid: false,
      message: 'UPC-E checksum digit is invalid.',
    });
    expect(normalizeBarcodeContent('UPC-E', '421000')).toMatchObject({
      content: '04210007',
      valid: true,
    });
  });

  test('validates Code 39, Code 93, Codabar, and ITF rules', () => {
    expect(validateCode39('ITEM-42')).toEqual({ valid: true });
    expect(validateCode39('item_42')).toEqual({
      valid: false,
      message: 'Code 39 allows A-Z, numbers, space, and -.$/+%.',
    });

    expect(validateCode93('Asset #93')).toEqual({ valid: true });
    expect(validateCode93('Snowman ☃')).toEqual({
      valid: false,
      message: 'Code 93 requires printable ASCII content.',
    });

    expect(validateCodabar('A123456B')).toEqual({ valid: true });
    expect(validateCodabar('123456')).toEqual({
      valid: false,
      message: 'Codabar must start and end with A, B, C, or D.',
    });

    expect(validateITF('12345678')).toEqual({ valid: true });
    expect(validateITF('1234567')).toEqual({
      valid: false,
      message: 'ITF must contain an even number of digits.',
    });
  });

  test('validates broad 2D formats and unsupported formats', () => {
    expect(validateBarcode('Data Matrix', 'LOT 42')).toEqual({ valid: true });
    expect(validateBarcode('PDF417', '')).toEqual({
      valid: false,
      message: 'Barcode content is required.',
    });
    expect(validateBarcode('Unknown', '123')).toEqual({
      valid: false,
      message: 'Unsupported barcode format.',
    });
    expect(
      BarcodeService.validatePayload({ content: 'ticket', format: 'Aztec' }),
    ).toBe(true);
  });

  test('rejects barcode values that the renderer cannot encode', () => {
    expect(
      validateRenderableBarcode({
        content: '7587586858585',
        format: 'Aztec Runes',
      }),
    ).toMatchObject({
      valid: false,
      message: 'Aztec runes must be 0 to 255',
    });
  });
});
