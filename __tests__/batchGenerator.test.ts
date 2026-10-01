import {
  buildBatchFilename,
  buildSequenceRows,
  parseBatchInput,
  summarizeBatch,
  validateBatchRows,
} from '../src/features/batchGenerator/batchGeneratorUtils';

describe('batch generator utilities', () => {
  test('builds padded sequence rows', () => {
    expect(
      buildSequenceRows(
        {
          end: '3',
          padding: '5',
          prefix: 'PRODUCT-',
          start: '1',
          suffix: '',
        },
        'Code 128',
      ),
    ).toEqual([
      { format: 'Code 128', value: 'PRODUCT-00001' },
      { format: 'Code 128', value: 'PRODUCT-00002' },
      { format: 'Code 128', value: 'PRODUCT-00003' },
    ]);
  });

  test('parses line, CSV, and JSON inputs', () => {
    expect(parseBatchInput('paste', 'alpha\nbeta\n', 'QR')).toEqual([
      { format: 'QR', value: 'alpha' },
      { format: 'QR', value: 'beta' },
    ]);

    expect(
      parseBatchInput('csv', '"5901234123457",EAN-13\nITEM-42,Code 39', 'QR'),
    ).toEqual([
      { format: 'EAN-13', value: '5901234123457' },
      { format: 'Code 39', value: 'ITEM-42' },
    ]);

    expect(
      parseBatchInput(
        'json',
        JSON.stringify({
          items: [{ value: '03600029145', format: 'UPC-A' }, 'plain'],
        }),
        'QR',
      ),
    ).toEqual([
      { format: 'UPC-A', value: '03600029145' },
      { format: 'QR', value: 'plain' },
    ]);
  });

  test('validates rows independently and normalizes checksums', () => {
    const rows = validateBatchRows(
      [
        { format: 'EAN-13', value: '590123412345' },
        { format: 'EAN-13', value: 'bad' },
        { format: 'QR', value: 'https://example.com' },
      ],
      'QR',
    );

    expect(rows).toMatchObject([
      { encodedContent: '5901234123457', valid: true },
      { message: 'EAN-13 must be 12 or 13 digits.', valid: false },
      { encodedContent: 'https://example.com', valid: true },
    ]);
    expect(summarizeBatch(rows)).toEqual({ invalid: 1, total: 3, valid: 2 });
  });

  test('creates predictable filenames', () => {
    expect(buildBatchFilename('Product 001', 'QR', 1)).toBe(
      '001_product_001.png',
    );
    expect(buildBatchFilename('', 'Code 128', 12)).toBe('012_code_128.png');
  });
});
