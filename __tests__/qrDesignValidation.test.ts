import {
  defaultQRDesignConfig,
  QRDesignConfig,
} from '../src/features/qrStudio/qrDesignTypes';
import {
  contrastRatio,
  fixQRDesign,
  isFrameContentAligned,
  parseQRDesignConfig,
  validateQRDesign,
} from '../src/features/qrStudio/qrDesignValidation';

describe('QR design validation', () => {
  test('detects low contrast designs', () => {
    const config: QRDesignConfig = {
      ...defaultQRDesignConfig,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#F3F4F6',
    };

    expect(validateQRDesign(config)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'lowContrast',
          severity: 'warning',
        }),
      ]),
    );
  });

  test('warns about transparent backgrounds and logo safety', () => {
    const config: QRDesignConfig = {
      ...defaultQRDesignConfig,
      backgroundTransparent: true,
      errorCorrectionLevel: 'M',
      logoEnabled: true,
      logoSize: 28,
    };

    const warnings = validateQRDesign(config);

    expect(warnings.map(warning => warning.key)).toEqual(
      expect.arrayContaining([
        'transparentBackground',
        'logoCorrection',
        'logoSize',
      ]),
    );
  });

  test('fixes risky design settings automatically', () => {
    const fixed = fixQRDesign({
      ...defaultQRDesignConfig,
      backgroundColor: '#FFFFFF',
      backgroundTransparent: true,
      foregroundColor: '#F3F4F6',
      logoEnabled: true,
      logoSize: 30,
      moduleStyle: 'diamond',
    });

    expect(fixed.backgroundTransparent).toBe(false);
    expect(fixed.errorCorrectionLevel).toBe('H');
    expect(fixed.foregroundColor).toBe('#101214');
    expect(fixed.logoSize).toBe(22);
    expect(fixed.moduleStyle).toBe('rounded');
  });

  test('parses partial persisted configs over defaults', () => {
    expect(parseQRDesignConfig({ moduleStyle: 'dots' })).toMatchObject({
      ...defaultQRDesignConfig,
      moduleStyle: 'dots',
    });
    expect(parseQRDesignConfig(undefined)).toEqual(defaultQRDesignConfig);
  });

  test('warns when frame template does not match QR data', () => {
    const warnings = validateQRDesign(
      {
        ...defaultQRDesignConfig,
        frameTemplate: 'openWebsite',
      },
      'plain text',
    );

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'frameContentMismatch',
          severity: 'warning',
        }),
      ]),
    );
    expect(
      validateQRDesign(
        {
          ...defaultQRDesignConfig,
          frameTemplate: 'openWebsite',
        },
        'https://example.com',
      ).map(warning => warning.key),
    ).not.toContain('frameContentMismatch');
  });

  test('matches wifi frame only to wifi QR payloads', () => {
    expect(
      isFrameContentAligned(
        'joinWifi',
        'WIFI:T:WPA;S:Network Name;P:Password;;',
      ),
    ).toBe(true);
    expect(isFrameContentAligned('joinWifi', 'https://example.com')).toBe(
      false,
    );
  });

  test('computes usable contrast ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeGreaterThan(20);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
  });
});
