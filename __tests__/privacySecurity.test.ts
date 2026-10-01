import {
  authenticateForVault,
  createAnalyticsEvent,
  getCodePreviewText,
  isSensitiveCode,
  permissionExplanations,
  sanitizeForLog,
} from '../src/features/security';
import { CodeItem } from '../src/database/entities/CodeItem';
import { PrivacySafeAnalyticsService } from '../src/services/analytics/PrivacySafeAnalyticsService';

function createCode(input: Partial<CodeItem> = {}): CodeItem {
  return {
    content: 'https://example.com',
    createdAt: '2026-09-25T00:00:00.000Z',
    format: 'qr-code',
    id: 'code-1',
    isFavorite: false,
    source: 'generated',
    type: 'qr',
    updatedAt: '2026-09-25T00:00:00.000Z',
    ...input,
  };
}

describe('privacy and security', () => {
  test('redacts sensitive code previews', () => {
    const wifi = createCode({
      content: 'WIFI:T:WPA;S:Studio;P:secret;;',
    });
    const locked = createCode({
      content: 'https://private.example.com',
      isProtected: true,
    });

    expect(isSensitiveCode(wifi)).toBe(true);
    expect(getCodePreviewText(wifi)).toBe('Sensitive content hidden');
    expect(getCodePreviewText(locked)).toBe('Protected by secure vault');
    expect(getCodePreviewText(locked, true)).toBe(
      'https://private.example.com',
    );
  });

  test('sanitizes analytics properties and logs', async () => {
    const event = createAnalyticsEvent('scanner_opened', {
      content: 'https://secret.example.com/path',
      format: 'qr-code',
      password: 'secret',
      source: 'camera',
    });
    const tracked: unknown[] = [];
    const service = new PrivacySafeAnalyticsService({
      track: trackedEvent => {
        tracked.push(trackedEvent);
      },
    });

    await service.track('qr_created', {
      payload: 'WIFI:T:WPA;S:Studio;P:secret;;',
      template: 'restaurant-wifi',
    });

    expect(event.properties).toEqual({
      format: 'qr-code',
      source: 'camera',
    });
    expect(tracked).toEqual([
      {
        name: 'qr_created',
        properties: { template: 'restaurant-wifi' },
      },
    ]);
    expect(sanitizeForLog('WIFI:T:WPA;S:Studio;P:secret;;')).toBe(
      '[sensitive code redacted]',
    );
  });

  test('documents contextual permissions and unavailable vault auth', async () => {
    expect(permissionExplanations.cameraScanner).toContain(
      'only when the camera scanner opens',
    );
    await expect(authenticateForVault()).resolves.toMatchObject({
      success: false,
    });
  });
});
