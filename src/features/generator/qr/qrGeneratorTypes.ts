export type QRGeneratorId =
  | 'website'
  | 'text'
  | 'wifi'
  | 'contact'
  | 'businessCard'
  | 'email'
  | 'sms'
  | 'phone'
  | 'whatsapp'
  | 'telegram'
  | 'location'
  | 'event'
  | 'menuUrl'
  | 'googleReviewUrl'
  | 'paymentUrl'
  | 'appUrl'
  | 'productUrl'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'linkedin'
  | 'threads'
  | 'snapchat'
  | 'spotify'
  | 'messenger'
  | 'appLink'
  | 'ean13'
  | 'ean8'
  | 'upca'
  | 'upce'
  | 'code128'
  | 'code39'
  | 'code93'
  | 'codabar'
  | 'itf'
  | 'dataMatrix'
  | 'pdf417'
  | 'aztec'
  | string;

export type QRGeneratorSection =
  | 'Popular'
  | 'Communication'
  | 'Business'
  | 'Social'
  | 'Utility'
  | 'Barcodes';

export type QRFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'date'
  | 'time'
  | 'timezone'
  | 'number';

export type QRGeneratorField = {
  id: string;
  label: string;
  multiline?: boolean;
  options?: string[];
  placeholder?: string;
  type: QRFieldType;
};

export type QRGeneratorDefinition<TPayload extends Record<string, unknown>> = {
  buildInitialPayload: () => TPayload;
  description: string;
  encode: (payload: TPayload) => string;
  fields: QRGeneratorField[];
  helperText?: (payload: TPayload) => string | undefined;
  id: QRGeneratorId;
  label: string;
  preview: (payload: TPayload) => string;
  searchTerms: string[];
  sections: QRGeneratorSection[];
  validate: (payload: TPayload) => string[];
};

export type AnyQRGeneratorDefinition = QRGeneratorDefinition<any>;

export type WebsitePayload = { url: string };
export type TextPayload = { text: string };
export type WifiPayload = {
  hidden: boolean;
  password: string;
  security: 'WPA/WPA2/WPA3' | 'WEP' | 'None';
  ssid: string;
};
export type ContactPayload = {
  alternativePhone: string;
  city: string;
  company: string;
  country: string;
  email: string;
  firstName: string;
  instagram: string;
  jobTitle: string;
  lastName: string;
  linkedIn: string;
  phone: string;
  postcode: string;
  region: string;
  street: string;
  website: string;
  whatsApp: string;
};
export type EmailPayload = { email: string; message: string; subject: string };
export type SmsPayload = { message: string; phone: string };
export type PhonePayload = { phone: string };
export type WhatsAppPayload = { message: string; phone: string };
export type TelegramPayload = { username: string };
export type LocationPayload = { latitude: string; longitude: string };
export type EventPayload = {
  allDay: boolean;
  description: string;
  endDate: string;
  endTime: string;
  location: string;
  organizer: string;
  reminder: string;
  startDate: string;
  startTime: string;
  timezone: string;
  title: string;
};
export type SocialPayload = { handleOrUrl: string };

export type QRGeneratorPayload =
  | WebsitePayload
  | TextPayload
  | WifiPayload
  | ContactPayload
  | EmailPayload
  | SmsPayload
  | PhonePayload
  | WhatsAppPayload
  | TelegramPayload
  | LocationPayload
  | EventPayload
  | SocialPayload;
