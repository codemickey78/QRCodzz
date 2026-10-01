import { CodeItem } from '../../database/entities/CodeItem';
import { BiometricsService } from '../../services/biometrics/BiometricsService';

export type PermissionPurpose =
  | 'cameraScanner'
  | 'scanImage'
  | 'selectLogo'
  | 'importContact'
  | 'currentLocation'
  | 'addEventToCalendar';

export type AnalyticsEventName =
  | 'scanner_opened'
  | 'image_scan_started'
  | 'qr_created'
  | 'qr_exported'
  | 'barcode_created'
  | 'code_exported'
  | 'batch_started'
  | 'backup_exported'
  | 'print_sheet_prepared'
  | 'vault_locked'
  | 'vault_unlocked';

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  properties?: Record<string, boolean | number | string>;
};

export type BiometricsPromptResult =
  | { success: true }
  | { message: string; success: false };

export const privacyPrinciples = [
  'Your QR codes stay on your device.',
  'QR and barcode creation happen locally.',
  'No account is required for the local workspace.',
  'QR contents and scan values are not uploaded for analytics.',
] as const;

export const permissionExplanations: Record<PermissionPurpose, string> = {
  addEventToCalendar:
    'Calendar access is requested only when you add a scanned event to your calendar.',
  cameraScanner:
    'Camera access is requested only when the camera scanner opens.',
  currentLocation:
    'Location access is requested only when you choose to fill a QR code with your current location.',
  importContact:
    'Contacts access is requested only when you import a contact into a QR code.',
  scanImage:
    'Photos access is requested only when you scan a code from an image.',
  selectLogo:
    'Photos access is requested only when you choose a logo for a QR design.',
};

const sensitiveMetadataKeys = new Set([
  'alternativephone',
  'email',
  'fn',
  'message',
  'n',
  'password',
  'phone',
  'tel',
  'whatsapp',
]);

const sensitiveContentPatterns = [
  /^WIFI:/i,
  /^BEGIN:VCARD/i,
  /^MATMSG:/i,
  /^mailto:/i,
  /^SMSTO:/i,
  /^sms:/i,
  /^tel:/i,
];

export function isSensitiveCode(code: CodeItem) {
  return (
    code.isProtected ||
    sensitiveContentPatterns.some(pattern => pattern.test(code.content)) ||
    Object.keys(code.metadata ?? {}).some(key =>
      sensitiveMetadataKeys.has(key.toLowerCase()),
    ) ||
    containsNestedSensitiveMetadata(code.metadata)
  );
}

export function getCodePreviewText(code: CodeItem, unlocked = false) {
  if (code.isProtected && !unlocked) {
    return 'Protected by secure vault';
  }

  if (isSensitiveCode(code) && !unlocked) {
    return 'Sensitive content hidden';
  }

  return code.content;
}

export function getCodeTitleText(code: CodeItem, unlocked = false) {
  if (code.isProtected && !unlocked) {
    return code.title || 'Locked item';
  }

  return code.title || getCodePreviewText(code, unlocked);
}

export async function authenticateForVault(
  reason = 'Unlock protected QRCodzz item',
): Promise<BiometricsPromptResult> {
  const availability = await BiometricsService.getAvailability();

  if (!availability.available) {
    return {
      message:
        availability.reason ??
        'Device authentication is not available on this device.',
      success: false,
    };
  }

  const result = await BiometricsService.authenticate(reason);

  if (result.success) {
    return { success: true };
  }

  return {
    message: result.message ?? 'Device authentication failed.',
    success: false,
  };
}

export function createAnalyticsEvent(
  name: AnalyticsEventName,
  properties: Record<string, unknown> = {},
): AnalyticsEvent {
  return {
    name,
    properties: sanitizeAnalyticsProperties(properties),
  };
}

export function sanitizeForLog(value: unknown) {
  if (typeof value !== 'string') {
    return '[redacted]';
  }

  if (sensitiveContentPatterns.some(pattern => pattern.test(value))) {
    return '[sensitive code redacted]';
  }

  if (value.length > 24) {
    return `${value.slice(0, 8)}...[redacted]`;
  }

  return value;
}

function sanitizeAnalyticsProperties(properties: Record<string, unknown>) {
  return Object.entries(properties).reduce<Record<string, boolean | number | string>>(
    (safeProperties, [key, value]) => {
      if (isSensitiveAnalyticsKey(key) || isUnsafeAnalyticsValue(value)) {
        return safeProperties;
      }

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        safeProperties[key] = value;
      }

      return safeProperties;
    },
    {},
  );
}

function containsNestedSensitiveMetadata(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([key, nestedValue]) =>
      sensitiveMetadataKeys.has(key.toLowerCase()) ||
      containsNestedSensitiveMetadata(nestedValue),
  );
}

function isSensitiveAnalyticsKey(key: string) {
  const normalizedKey = key.toLowerCase();
  return (
    sensitiveMetadataKeys.has(normalizedKey) ||
    ['content', 'payload', 'raw', 'scanvalue', 'url', 'value'].includes(
      normalizedKey,
    )
  );
}

function isUnsafeAnalyticsValue(value: unknown) {
  return (
    typeof value === 'string' &&
    sensitiveContentPatterns.some(pattern => pattern.test(value))
  );
}
