export type QRModuleStyle =
  | 'classic'
  | 'rounded'
  | 'dots'
  | 'circle'
  | 'diamond'
  | 'softSquare';

export type QREyeStyle = 'square' | 'rounded' | 'circle' | 'diamond';
export type QREyeCenterStyle = QREyeStyle | 'dot';
export type QRColorMode = 'solid' | 'linearGradient' | 'radialGradient';
export type QRGradientDirection =
  | 'topBottom'
  | 'leftRight'
  | 'diagonallyDown'
  | 'diagonallyUp';
export type QRLogoShape = 'square' | 'rounded' | 'circle';
export type QRFrameTemplate =
  | 'none'
  | 'scanMe'
  | 'openWebsite'
  | 'viewMenu'
  | 'joinWifi'
  | 'followUs'
  | 'payNow'
  | 'contactMe'
  | 'downloadApp'
  | 'leaveReview'
  | 'custom';

export type QRDesignConfig = {
  backgroundColor: string;
  backgroundTransparent: boolean;
  colorMode: QRColorMode;
  errorCorrectionLevel: 'M' | 'Q' | 'H';
  eyeCenterStyle: QREyeCenterStyle;
  eyeFrameStyle: QREyeStyle;
  foregroundColor: string;
  frameText: string;
  frameTemplate: QRFrameTemplate;
  gradientDirection: QRGradientDirection;
  gradientEndColor: string;
  logoBackgroundColor: string;
  logoBorderRadius: number;
  logoEnabled: boolean;
  logoIcon: string;
  logoPadding: number;
  logoShape: QRLogoShape;
  logoSize: number;
  logoUri?: string;
  moduleStyle: QRModuleStyle;
};

export type QRDesignWarning = {
  key: string;
  message: string;
  severity: 'info' | 'warning';
};

export const defaultQRDesignConfig: QRDesignConfig = {
  backgroundColor: '#FFFFFF',
  backgroundTransparent: false,
  colorMode: 'solid',
  errorCorrectionLevel: 'M',
  eyeCenterStyle: 'square',
  eyeFrameStyle: 'square',
  foregroundColor: '#101214',
  frameText: 'SCAN ME',
  frameTemplate: 'none',
  gradientDirection: 'topBottom',
  gradientEndColor: '#2563EB',
  logoBackgroundColor: '#FFFFFF',
  logoBorderRadius: 10,
  logoEnabled: false,
  logoIcon: '*',
  logoPadding: 6,
  logoShape: 'rounded',
  logoSize: 18,
  moduleStyle: 'classic',
};

export const frameTemplateLabels: Record<QRFrameTemplate, string> = {
  contactMe: 'CONTACT ME',
  custom: 'CUSTOM',
  downloadApp: 'DOWNLOAD APP',
  followUs: 'FOLLOW US',
  joinWifi: 'JOIN WI-FI',
  leaveReview: 'LEAVE A REVIEW',
  none: 'None',
  openWebsite: 'OPEN WEBSITE',
  payNow: 'PAY NOW',
  scanMe: 'SCAN ME',
  viewMenu: 'VIEW MENU',
};

export const colorPresets = [
  { label: 'Black', value: '#101214' },
  { label: 'Graphite', value: '#374151' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Teal', value: '#0F766E' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Sky', value: '#0284C7' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Violet', value: '#6D28D9' },
  { label: 'Orange', value: '#EA580C' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Pink', value: '#DB2777' },
] as const;
