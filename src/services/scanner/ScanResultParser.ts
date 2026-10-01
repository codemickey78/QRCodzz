import type {BarcodeFormat} from 'react-native-vision-camera-barcode-scanner';

export type ParsedScanResultType =
  | 'url'
  | 'plainText'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'contact'
  | 'location'
  | 'calendar'
  | 'whatsapp'
  | 'socialUrl'
  | 'appLink'
  | 'productBarcode'
  | 'unknownBarcode';

export type ScanActionKind =
  | 'openWebsite'
  | 'copy'
  | 'share'
  | 'save'
  | 'search'
  | 'openApp'
  | 'call'
  | 'sms'
  | 'whatsapp'
  | 'composeEmail'
  | 'copySsid'
  | 'copyPassword'
  | 'connectWifi'
  | 'addContact'
  | 'openMaps'
  | 'directions'
  | 'copyCoordinates'
  | 'addCalendar'
  | 'searchProduct'
  | 'searchWeb';

export type ParsedScanAction = {
  kind: ScanActionKind;
  label: string;
  value?: string;
};

export type UrlSafetyCheck = {
  key:
    | 'https'
    | 'http'
    | 'ipBased'
    | 'longUrl'
    | 'punycode'
    | 'malformed';
  level: 'info' | 'warning' | 'pass';
  message: string;
};

export type ParsedScanResult = {
  actions: ParsedScanAction[];
  displayValue: string;
  metadata: Record<string, unknown>;
  raw: string;
  summary?: string;
  type: ParsedScanResultType;
  urlSafetyChecks?: UrlSafetyCheck[];
};

type ParseInput = {
  format?: BarcodeFormat | string;
  raw: string;
};

const productBarcodeFormats = new Set([
  'ean-13',
  'ean-8',
  'upc-a',
  'upc-e',
]);

const socialHosts = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'tiktok.com',
  'x.com',
  'twitter.com',
  'youtube.com',
];

export class ScanResultParser {
  parse(input: ParseInput): ParsedScanResult {
    const raw = input.raw.trim();
    const format = input.format ?? 'unknown';
    const formatValue = String(format);

    if (productBarcodeFormats.has(formatValue)) {
      return this.parseProductBarcode(raw, format);
    }

    if (this.isLinearBarcode(formatValue)) {
      return this.parseUnknownBarcode(raw, format);
    }

    if (this.isWifi(raw)) {
      return this.parseWifi(raw);
    }

    if (this.isVCard(raw)) {
      return this.parseVCard(raw);
    }

    if (this.isCalendar(raw)) {
      return this.parseCalendar(raw);
    }

    if (this.isSms(raw)) {
      return this.parseSms(raw);
    }

    if (this.isGeo(raw)) {
      return this.parseLocation(raw);
    }

    if (this.isEmail(raw)) {
      return this.parseEmail(raw);
    }

    if (this.isPhone(raw)) {
      return this.parsePhone(raw);
    }

    const parsedUrl = this.parseUrl(raw);

    if (parsedUrl) {
      return parsedUrl;
    }

    if (this.looksLikeUrl(raw)) {
      return this.parseMalformedUrl(raw);
    }

    return {
      actions: [
        {kind: 'copy', label: 'Copy', value: raw},
        {kind: 'share', label: 'Share', value: raw},
        {kind: 'search', label: 'Search', value: raw},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: raw,
      metadata: {},
      raw,
      summary: 'Plain text',
      type: 'plainText',
    };
  }

  private parseProductBarcode(
    raw: string,
    format: BarcodeFormat | string,
  ): ParsedScanResult {
    return {
      actions: [
        {kind: 'searchProduct', label: 'Search product', value: raw},
        {kind: 'searchWeb', label: 'Search web', value: raw},
        {kind: 'copy', label: 'Copy', value: raw},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: raw,
      metadata: {format},
      raw,
      summary: 'Product barcode',
      type: 'productBarcode',
    };
  }

  private parseUnknownBarcode(
    raw: string,
    format: BarcodeFormat | string,
  ): ParsedScanResult {
    return {
      actions: [
        {kind: 'searchWeb', label: 'Search web', value: raw},
        {kind: 'copy', label: 'Copy', value: raw},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: raw,
      metadata: {format},
      raw,
      summary: 'Unknown barcode',
      type: 'unknownBarcode',
    };
  }

  private parseUrl(raw: string): ParsedScanResult | undefined {
    const normalizedRaw = /^[a-z][a-z0-9+.-]*:/i.test(raw)
      ? raw
      : `https://${raw}`;

    let url: URL;

    try {
      url = new URL(normalizedRaw);
    } catch {
      return undefined;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return this.parseAppLink(raw, url);
    }

    if (!url.hostname || url.hostname.indexOf('.') === -1) {
      return undefined;
    }

    const type = this.getUrlType(url);

    return {
      actions: [
        {kind: 'openWebsite', label: 'Open Website', value: url.toString()},
        {kind: 'copy', label: 'Copy', value: url.toString()},
        {kind: 'share', label: 'Share', value: url.toString()},
        {kind: 'save', label: 'Save'},
        {kind: 'search', label: 'Search', value: url.hostname},
      ],
      displayValue: url.hostname.replace(/^www\./, ''),
      metadata: {
        host: url.hostname,
        protocol: url.protocol,
        url: url.toString(),
      },
      raw,
      summary: this.getUrlSafetySummary(url),
      type,
      urlSafetyChecks: this.getUrlSafetyChecks(url, raw),
    };
  }

  private parseAppLink(raw: string, url: URL): ParsedScanResult {
    return {
      actions: [
        {kind: 'openApp', label: 'Open App Link', value: url.toString()},
        {kind: 'copy', label: 'Copy', value: url.toString()},
        {kind: 'share', label: 'Share', value: url.toString()},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: url.toString(),
      metadata: {
        protocol: url.protocol,
        url: url.toString(),
      },
      raw,
      summary: 'App link',
      type: 'appLink',
    };
  }

  private parseMalformedUrl(raw: string): ParsedScanResult {
    return {
      actions: [
        {kind: 'copy', label: 'Copy', value: raw},
        {kind: 'share', label: 'Share', value: raw},
        {kind: 'search', label: 'Search', value: raw},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: raw,
      metadata: {},
      raw,
      summary: 'Review basic link warnings.',
      type: 'plainText',
      urlSafetyChecks: [
        {
          key: 'malformed',
          level: 'warning',
          message: 'URL could not be parsed.',
        },
      ],
    };
  }

  private getUrlType(url: URL): ParsedScanResultType {
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'appLink';
    }

    if (host === 'wa.me' || host.endsWith('.whatsapp.com')) {
      return 'whatsapp';
    }

    if (socialHosts.some(socialHost => host === socialHost || host.endsWith(`.${socialHost}`))) {
      return 'socialUrl';
    }

    return 'url';
  }

  private getUrlSafetySummary(url: URL) {
    const warnings = this
      .getUrlSafetyChecks(url, url.toString())
      .filter(check => check.level === 'warning');

    return warnings.length > 0
      ? 'Review basic link warnings.'
      : 'Basic link checks passed.';
  }

  private getUrlSafetyChecks(url: URL, raw: string): UrlSafetyCheck[] {
    const hostname = url.hostname.toLowerCase();
    const checks: UrlSafetyCheck[] = [];

    checks.push(
      url.protocol === 'https:'
        ? {
            key: 'https',
            level: 'pass',
            message: 'Uses HTTPS.',
          }
        : {
            key: 'http',
            level: 'warning',
            message: 'Does not use HTTPS.',
          },
    );

    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes('[')) {
      checks.push({
        key: 'ipBased',
        level: 'warning',
        message: 'Uses an IP-based host.',
      });
    }

    if (raw.length > 160) {
      checks.push({
        key: 'longUrl',
        level: 'warning',
        message: 'URL is unusually long.',
      });
    }

    if (hostname.includes('xn--')) {
      checks.push({
        key: 'punycode',
        level: 'warning',
        message: 'Hostname uses punycode characters.',
      });
    }

    return checks;
  }

  private parseEmail(raw: string): ParsedScanResult {
    const mailto = raw.toLowerCase().startsWith('mailto:')
      ? raw.slice('mailto:'.length)
      : raw;
    const [address, query = ''] = mailto.split('?');
    const params = new URLSearchParams(query);

    return {
      actions: [
        {kind: 'composeEmail', label: 'Compose Email', value: address},
        {kind: 'copy', label: 'Copy', value: address},
        {kind: 'share', label: 'Share', value: address},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: address,
      metadata: {
        email: address,
        subject: params.get('subject') ?? undefined,
      },
      raw,
      summary: 'Email address',
      type: 'email',
    };
  }

  private parsePhone(raw: string): ParsedScanResult {
    const phone = raw.replace(/^tel:/i, '').trim();

    return {
      actions: [
        {kind: 'call', label: 'Call', value: phone},
        {kind: 'sms', label: 'SMS', value: phone},
        {kind: 'whatsapp', label: 'WhatsApp', value: phone},
        {kind: 'copy', label: 'Copy', value: phone},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: phone,
      metadata: {phone},
      raw,
      summary: 'Phone number',
      type: 'phone',
    };
  }

  private parseSms(raw: string): ParsedScanResult {
    const body = raw.replace(/^smsto:/i, '').replace(/^sms:/i, '');
    const [target, colonMessage] = body.split(':');
    const [phone, query = ''] = target.split('?');
    const params = new URLSearchParams(query);
    const message = colonMessage ?? params.get('body') ?? undefined;

    return {
      actions: [
        {kind: 'sms', label: 'SMS', value: phone},
        {kind: 'copy', label: 'Copy', value: phone},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: phone,
      metadata: {message, phone},
      raw,
      summary: 'SMS message',
      type: 'sms',
    };
  }

  private parseWifi(raw: string): ParsedScanResult {
    const metadata = this.parseWifiFields(raw);

    return {
      actions: [
        {kind: 'copySsid', label: 'Copy SSID', value: String(metadata.ssid ?? '')},
        {
          kind: 'copyPassword',
          label: 'Copy Password',
          value: String(metadata.password ?? ''),
        },
        {kind: 'share', label: 'Share', value: raw},
        {kind: 'connectWifi', label: 'Connect where supported'},
      ],
      displayValue: String(metadata.ssid ?? 'Wi-Fi network'),
      metadata,
      raw,
      summary: 'Wi-Fi network',
      type: 'wifi',
    };
  }

  private parseVCard(raw: string): ParsedScanResult {
    const metadata = this.parseKeyValueLines(raw);
    const name = String(metadata.fn ?? metadata.n ?? 'Contact');
    const phone = String(metadata.tel ?? '');
    const email = String(metadata.email ?? '');

    return {
      actions: [
        {kind: 'addContact', label: 'Add Contact', value: raw},
        ...(phone ? [{kind: 'call' as const, label: 'Call', value: phone}] : []),
        ...(email
          ? [{kind: 'composeEmail' as const, label: 'Email', value: email}]
          : []),
        ...(phone
          ? [{kind: 'whatsapp' as const, label: 'WhatsApp', value: phone}]
          : []),
        {kind: 'save', label: 'Save'},
      ],
      displayValue: name,
      metadata,
      raw,
      summary: 'Contact card',
      type: 'contact',
    };
  }

  private parseLocation(raw: string): ParsedScanResult {
    const coordinates = raw.replace(/^geo:/i, '').split('?')[0];
    const [latitude, longitude] = coordinates.split(',');

    return {
      actions: [
        {kind: 'openMaps', label: 'Open Maps', value: coordinates},
        {kind: 'directions', label: 'Directions', value: coordinates},
        {kind: 'copyCoordinates', label: 'Copy Coordinates', value: coordinates},
        {kind: 'share', label: 'Share', value: coordinates},
      ],
      displayValue: coordinates,
      metadata: {latitude, longitude},
      raw,
      summary: 'Geographic location',
      type: 'location',
    };
  }

  private parseCalendar(raw: string): ParsedScanResult {
    const metadata = this.parseKeyValueLines(raw);

    return {
      actions: [
        {kind: 'addCalendar', label: 'Add to Calendar', value: raw},
        {kind: 'share', label: 'Share', value: raw},
        {kind: 'save', label: 'Save'},
      ],
      displayValue: String(metadata.summary ?? 'Calendar event'),
      metadata,
      raw,
      summary: 'Calendar event',
      type: 'calendar',
    };
  }

  private parseKeyValueLines(raw: string) {
    return raw.split(/\r?\n/).reduce<Record<string, string>>((metadata, line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) {
        return metadata;
      }

      const rawKey = line.slice(0, separatorIndex).split(';')[0];
      const value = line.slice(separatorIndex + 1);

      if (rawKey) {
        metadata[rawKey.toLowerCase()] = value;
      }

      return metadata;
    }, {});
  }

  private parseWifiFields(raw: string) {
    const body = raw.replace(/^WIFI:/i, '').replace(/;$/, '');

    return this.splitEscaped(body, ';').reduce<Record<string, string>>(
      (metadata, field) => {
        const [key, ...valueParts] = field.split(':');
        const value = this.unescapeWifiValue(valueParts.join(':'));

        if (key === 'S') {
          metadata.ssid = value;
        }

        if (key === 'T') {
          metadata.security = value;
        }

        if (key === 'P') {
          metadata.password = value;
        }

        return metadata;
      },
      {},
    );
  }

  private isWifi(raw: string) {
    return raw.toUpperCase().startsWith('WIFI:');
  }

  private isVCard(raw: string) {
    return raw.toUpperCase().includes('BEGIN:VCARD');
  }

  private isCalendar(raw: string) {
    return raw.toUpperCase().includes('BEGIN:VEVENT');
  }

  private isGeo(raw: string) {
    return /^geo:-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/i.test(raw);
  }

  private isSms(raw: string) {
    return /^(sms|smsto):/i.test(raw);
  }

  private isEmail(raw: string) {
    return (
      /^mailto:/i.test(raw) ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
    );
  }

  private isPhone(raw: string) {
    return /^tel:/i.test(raw) || /^\+?[0-9][0-9\s().-]{6,}$/.test(raw);
  }

  private looksLikeUrl(raw: string) {
    return (
      /^[a-z][a-z0-9+.-]*:/i.test(raw) ||
      /^www\./i.test(raw) ||
      /^https?:\/\//i.test(raw)
    );
  }

  private isLinearBarcode(format: string) {
    return (
      format !== 'qr-code' &&
      format !== 'data-matrix' &&
      format !== 'aztec' &&
      format !== 'pdf-417' &&
      format !== 'unknown'
    );
  }

  private splitEscaped(value: string, separator: string) {
    const parts: string[] = [];
    let current = '';
    let isEscaped = false;

    for (const character of value) {
      if (isEscaped) {
        current += `\\${character}`;
        isEscaped = false;
        continue;
      }

      if (character === '\\') {
        isEscaped = true;
        continue;
      }

      if (character === separator) {
        parts.push(current);
        current = '';
        continue;
      }

      current += character;
    }

    parts.push(current);
    return parts;
  }

  private unescapeWifiValue(value: string) {
    return value
      .replace(/\\;/g, ';')
      .replace(/\\:/g, ':')
      .replace(/\\,/g, ',')
      .replace(/\\\\/g, '\\');
  }
}

export const scanResultParser = new ScanResultParser();
