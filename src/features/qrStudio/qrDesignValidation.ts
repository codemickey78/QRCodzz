import {
  defaultQRDesignConfig,
  QRDesignConfig,
  QRFrameTemplate,
  QRDesignWarning,
} from './qrDesignTypes';

const minimumContrast = 4.5;

export function parseQRDesignConfig(value: unknown): QRDesignConfig {
  if (!value || typeof value !== 'object') {
    return defaultQRDesignConfig;
  }

  return {
    ...defaultQRDesignConfig,
    ...(value as Partial<QRDesignConfig>),
  };
}

export function validateQRDesign(
  config: QRDesignConfig,
  content = '',
): QRDesignWarning[] {
  const warnings: QRDesignWarning[] = [];
  const contrast = contrastRatio(
    config.foregroundColor,
    config.backgroundTransparent ? '#FFFFFF' : config.backgroundColor,
  );

  if (contrast < minimumContrast) {
    warnings.push({
      key: 'lowContrast',
      message: 'Low contrast. This QR design may be difficult to scan.',
      severity: 'warning',
    });
  }

  if (config.backgroundTransparent) {
    warnings.push({
      key: 'transparentBackground',
      message: 'Transparent backgrounds depend on where the QR is placed.',
      severity: 'info',
    });
  }

  if (config.logoEnabled && config.logoSize > 24) {
    warnings.push({
      key: 'logoSize',
      message:
        'Logo size is high. Keep the center mark smaller for reliability.',
      severity: 'warning',
    });
  }

  if (config.logoEnabled && config.errorCorrectionLevel !== 'H') {
    warnings.push({
      key: 'logoCorrection',
      message: 'Use high error correction when a logo is enabled.',
      severity: 'warning',
    });
  }

  const styledModules =
    config.moduleStyle !== 'classic' ||
    config.eyeFrameStyle !== 'square' ||
    config.eyeCenterStyle !== 'square';

  if (
    styledModules &&
    (config.colorMode !== 'solid' ||
      config.logoEnabled ||
      config.backgroundTransparent)
  ) {
    warnings.push({
      key: 'excessiveStyling',
      message: 'Too many styling effects can reduce scan reliability.',
      severity: 'warning',
    });
  }

  const frameWarning = validateFrameContent(config.frameTemplate, content);

  if (frameWarning) {
    warnings.push(frameWarning);
  }

  return warnings;
}

export function fixQRDesign(config: QRDesignConfig): QRDesignConfig {
  const nextConfig: QRDesignConfig = {
    ...config,
    backgroundTransparent: false,
    errorCorrectionLevel: config.logoEnabled
      ? 'H'
      : config.errorCorrectionLevel,
    logoSize: Math.min(config.logoSize, 22),
  };

  if (
    contrastRatio(nextConfig.foregroundColor, nextConfig.backgroundColor) <
    minimumContrast
  ) {
    nextConfig.foregroundColor = '#101214';
    nextConfig.backgroundColor = '#FFFFFF';
    nextConfig.colorMode = 'solid';
  }

  if (nextConfig.logoEnabled && nextConfig.moduleStyle !== 'classic') {
    nextConfig.moduleStyle = 'rounded';
  }

  return nextConfig;
}

export function contrastRatio(firstColor: string, secondColor: string) {
  const first = relativeLuminance(hexToRgb(firstColor));
  const second = relativeLuminance(hexToRgb(secondColor));
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(value: string) {
  const normalized = value.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map(character => `${character}${character}`)
          .join('')
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    return { blue: 255, green: 255, red: 255 };
  }

  return {
    blue: parseInt(expanded.slice(4, 6), 16),
    green: parseInt(expanded.slice(2, 4), 16),
    red: parseInt(expanded.slice(0, 2), 16),
  };
}

function relativeLuminance({
  blue,
  green,
  red,
}: {
  blue: number;
  green: number;
  red: number;
}) {
  const [r, g, b] = [red, green, blue].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function validateFrameContent(
  frameTemplate: QRFrameTemplate,
  content: string,
): QRDesignWarning | undefined {
  if (isFrameContentAligned(frameTemplate, content)) {
    return undefined;
  }

  return {
    key: 'frameContentMismatch',
    message: 'The selected frame does not match this QR data.',
    severity: 'warning',
  };
}

export function isFrameContentAligned(
  frameTemplate: QRFrameTemplate,
  content: string,
) {
  const value = content.trim();

  if (!value || frameTemplate === 'none' || frameTemplate === 'custom') {
    return true;
  }

  switch (frameTemplate) {
    case 'openWebsite':
    case 'viewMenu':
    case 'downloadApp':
    case 'leaveReview':
      return /^https?:\/\//i.test(value);
    case 'joinWifi':
      return /^wifi:/i.test(value);
    case 'contactMe':
      return (
        /^begin:vcard/i.test(value) ||
        /^mailto:/i.test(value) ||
        /^tel:/i.test(value)
      );
    case 'payNow':
      return (
        /^https?:\/\//i.test(value) ||
        /^upi:/i.test(value) ||
        /^bitcoin:/i.test(value) ||
        /^ethereum:/i.test(value)
      );
    case 'followUs':
      return /^https?:\/\//i.test(value) || /^@/.test(value);
    case 'scanMe':
    default:
      return true;
  }
}
