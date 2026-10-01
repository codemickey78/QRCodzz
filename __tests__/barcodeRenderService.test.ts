import {createBwipOptions} from '../src/services/barcode/BarcodeRenderService';
import {bwipBarcodeCatalog} from '../src/services/barcode/bwipBarcodeCatalog';

describe('barcode render service', () => {
  test.each([
    ['EAN-13', 'ean13'],
    ['EAN-8', 'ean8'],
    ['UPC-A', 'upca'],
    ['UPC-E', 'upce'],
    ['Code 128', 'code128'],
    ['Code 39', 'code39'],
    ['Code 93', 'code93'],
    ['Codabar', 'rationalizedCodabar'],
    ['ITF', 'interleaved2of5'],
    ['Data Matrix', 'datamatrix'],
    ['PDF417', 'pdf417'],
    ['Aztec', 'azteccode'],
    ['AusPost 4 State Customer Code', 'auspost'],
    ['GS1 QR Code', 'gs1qrcode'],
    ['Royal Mail Mailmark', 'mailmark'],
    ['USPS Intelligent Mail', 'onecode'],
    ['Ultracode', 'ultracode'],
  ])('maps %s to bwip-js encoder %s', (format, bcid) => {
    expect(
      createBwipOptions({
        content: '1234567890',
        format,
        type: 'barcode',
      }),
    ).toMatchObject({bcid});
  });

  test('always maps QR code records to qrcode', () => {
    const options = createBwipOptions({
      content: 'https://example.com',
      format: 'qr-code',
      type: 'qr',
    });

    expect(options).toMatchObject({
      bcid: 'qrcode',
      eclevel: 'H',
      includetext: false,
    });
    expect(options).not.toHaveProperty('height');
  });

  test.each(bwipBarcodeCatalog)(
    'renders catalog sample for $label',
    definition => {
      const bwipjs = require('../node_modules/bwip-js/dist/bwip-js-node.js') as {
        toSVG: (options: Record<string, unknown>) => string;
      };

      expect(() =>
        bwipjs.toSVG(
          createBwipOptions({
            content: definition.placeholder,
            format: definition.label,
            includeText: true,
            type: 'barcode',
          }),
        ),
      ).not.toThrow();
    },
  );
});
