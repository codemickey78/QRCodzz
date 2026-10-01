import {scanResultParser} from '../src/services/scanner/ScanResultParser';

describe('ScanResultParser', () => {
  test('parses website URLs with basic link checks', () => {
    const result = scanResultParser.parse({
      format: 'qr-code',
      raw: 'https://example.com/path',
    });

    expect(result).toMatchObject({
      displayValue: 'example.com',
      summary: 'Basic link checks passed.',
      type: 'url',
    });
    expect(result.actions.map(action => action.kind)).toEqual([
      'openWebsite',
      'copy',
      'share',
      'save',
      'search',
    ]);
    expect(result.urlSafetyChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({key: 'https', level: 'pass'}),
      ]),
    );
  });

  test('flags HTTP, IP-based, long, punycode, and malformed URL-like scans', () => {
    const httpResult = scanResultParser.parse({
      format: 'qr-code',
      raw: 'http://192.168.0.1/' + 'a'.repeat(170),
    });
    const punycodeResult = scanResultParser.parse({
      format: 'qr-code',
      raw: 'https://xn--exmple-cua.com',
    });
    const malformedResult = scanResultParser.parse({
      format: 'qr-code',
      raw: 'https://',
    });

    expect(httpResult.urlSafetyChecks?.map(check => check.key)).toEqual(
      expect.arrayContaining(['http', 'ipBased', 'longUrl']),
    );
    expect(punycodeResult.urlSafetyChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({key: 'punycode', level: 'warning'}),
      ]),
    );
    expect(malformedResult).toMatchObject({
      summary: 'Review basic link warnings.',
      type: 'plainText',
      urlSafetyChecks: [
        expect.objectContaining({key: 'malformed', level: 'warning'}),
      ],
    });
  });

  test('parses email, phone, SMS, and WhatsApp scans', () => {
    expect(
      scanResultParser.parse({
        format: 'qr-code',
        raw: 'mailto:hello@example.com?subject=Hi',
      }),
    ).toMatchObject({
      metadata: {email: 'hello@example.com', subject: 'Hi'},
      type: 'email',
    });

    expect(
      scanResultParser.parse({format: 'qr-code', raw: 'tel:+15551234567'}),
    ).toMatchObject({
      metadata: {phone: '+15551234567'},
      type: 'phone',
    });

    expect(
      scanResultParser.parse({
        format: 'qr-code',
        raw: 'SMSTO:+15551234567:Hello',
      }),
    ).toMatchObject({
      metadata: {message: 'Hello', phone: '+15551234567'},
      type: 'sms',
    });

    expect(
      scanResultParser.parse({format: 'qr-code', raw: 'https://wa.me/15551234567'}),
    ).toMatchObject({
      type: 'whatsapp',
    });
  });

  test('parses Wi-Fi, contact, location, and calendar scans', () => {
    expect(
      scanResultParser.parse({
        format: 'qr-code',
        raw: 'WIFI:T:WPA;S:Studio\\;Guest;P:p\\:ass;',
      }),
    ).toMatchObject({
      displayValue: 'Studio;Guest',
      metadata: {password: 'p:ass', security: 'WPA', ssid: 'Studio;Guest'},
      type: 'wifi',
    });

    expect(
      scanResultParser.parse({
        format: 'qr-code',
        raw: 'BEGIN:VCARD\nFN:Ada Lovelace\nTEL:+15551234567\nEMAIL:ada@example.com\nEND:VCARD',
      }),
    ).toMatchObject({
      displayValue: 'Ada Lovelace',
      type: 'contact',
    });

    expect(
      scanResultParser.parse({format: 'qr-code', raw: 'geo:5.56,-0.2'}),
    ).toMatchObject({
      metadata: {latitude: '5.56', longitude: '-0.2'},
      type: 'location',
    });

    expect(
      scanResultParser.parse({
        format: 'qr-code',
        raw: 'BEGIN:VEVENT\nSUMMARY:Launch review\nEND:VEVENT',
      }),
    ).toMatchObject({
      displayValue: 'Launch review',
      type: 'calendar',
    });
  });

  test('parses social URLs, app links, product barcodes, unknown barcodes, and text', () => {
    expect(
      scanResultParser.parse({
        format: 'qr-code',
        raw: 'https://instagram.com/openai',
      }),
    ).toMatchObject({type: 'socialUrl'});

    expect(
      scanResultParser.parse({format: 'qr-code', raw: 'myapp://scan/123'}),
    ).toMatchObject({
      actions: expect.arrayContaining([
        expect.objectContaining({kind: 'openApp'}),
      ]),
      type: 'appLink',
    });

    expect(
      scanResultParser.parse({format: 'ean-13', raw: '5901234123457'}),
    ).toMatchObject({type: 'productBarcode'});

    expect(
      scanResultParser.parse({format: 'code-128', raw: 'ASSET-123'}),
    ).toMatchObject({type: 'unknownBarcode'});

    expect(
      scanResultParser.parse({format: 'qr-code', raw: 'Remember the milk'}),
    ).toMatchObject({type: 'plainText'});
  });
});
