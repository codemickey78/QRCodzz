import {
  encodeContact,
  encodeEmail,
  encodeEvent,
  encodeLocation,
  encodePhone,
  encodeSms,
  encodeSocialUrl,
  encodeText,
  encodeWebsite,
  encodeWhatsApp,
  encodeWifi,
  normalizeUrl,
} from './qrEncoders';
import {
  AnyQRGeneratorDefinition,
  ContactPayload,
  EmailPayload,
  EventPayload,
  LocationPayload,
  QRGeneratorField,
  QRGeneratorId,
  QRGeneratorSection,
  SmsPayload,
  TelegramPayload,
  WebsitePayload,
  WhatsAppPayload,
  WifiPayload,
} from './qrGeneratorTypes';

const required = (value: unknown, label: string) =>
  String(value ?? '').trim() ? [] : [`${label} is required.`];

const emailErrors = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? []
    : ['Enter a valid email address.'];

const urlErrors = (value: string) => {
  try {
    const url = new URL(normalizeUrl(value));
    return url.hostname.includes('.') ? [] : ['Enter a valid URL.'];
  } catch {
    return ['Enter a valid URL.'];
  }
};

const phoneErrors = (value: string) =>
  /^\+?[0-9][0-9\s().-]{6,}$/.test(value.trim())
    ? []
    : ['Enter a valid phone number.'];

const dateErrors = (value: string, label: string) => {
  if (!value.trim()) {
    return [];
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return [`${label} must use YYYY-MM-DD.`];
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? []
    : [`${label} must be a real date.`];
};

const timeErrors = (value: string, label: string) =>
  !value.trim() || /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim())
    ? []
    : [`${label} must use 24-hour HH:MM.`];

const reminderErrors = (value: string) =>
  !value.trim() || /^\d+$/.test(value.trim())
    ? []
    : ['Reminder must be whole minutes.'];

const chronologicalEventErrors = (payload: EventPayload) => {
  if (!payload.startDate || !payload.endDate) {
    return [];
  }

  const start = eventDateValue(payload.startDate, payload.startTime, payload.allDay);
  const end = eventDateValue(payload.endDate, payload.endTime, payload.allDay);

  if (start === undefined || end === undefined) {
    return [];
  }

  return end >= start ? [] : ['End must be after start.'];
};

const textField = (
  id: string,
  label: string,
  placeholder?: string,
): QRGeneratorField => ({id, label, placeholder, type: 'text'});

const urlField = (id = 'url', label = 'URL'): QRGeneratorField => ({
  id,
  label,
  placeholder: 'example.com',
  type: 'url',
});

const phoneField = (id = 'phone', label = 'Phone'): QRGeneratorField => ({
  id,
  label,
  placeholder: '+1 555 123 4567',
  type: 'phone',
});

const socialDefinition = (
  id: QRGeneratorId,
  label: string,
  baseUrl: string,
  sections: QRGeneratorSection[] = ['Social'],
  pathPrefix = '',
): AnyQRGeneratorDefinition => ({
  buildInitialPayload: () => ({handleOrUrl: ''}),
  description: `Create a QR code for ${label}.`,
  encode: payload => encodeSocialUrl(payload, baseUrl, pathPrefix),
  fields: [textField('handleOrUrl', `${label} handle or URL`, '@username')],
  id,
  label,
  preview: payload => encodeSocialUrl(payload, baseUrl, pathPrefix),
  searchTerms: [label, 'social', 'profile'],
  sections,
  validate: payload => required(payload.handleOrUrl, `${label} handle or URL`),
});

export const qrGeneratorDefinitions: AnyQRGeneratorDefinition[] = [
  {
    buildInitialPayload: (): WebsitePayload => ({url: ''}),
    description: 'Create a QR code that opens a website.',
    encode: encodeWebsite,
    fields: [urlField()],
    id: 'website',
    label: 'Website',
    preview: payload => encodeWebsite(payload),
    searchTerms: ['website', 'url', 'link'],
    sections: ['Popular', 'Business'],
    validate: payload => [...required(payload.url, 'URL'), ...urlErrors(payload.url)],
  },
  {
    buildInitialPayload: () => ({text: ''}),
    description: 'Create a QR code for multi-line text.',
    encode: encodeText,
    fields: [
      {
        id: 'text',
        label: 'Text',
        multiline: true,
        placeholder: 'Write anything',
        type: 'textarea',
      },
    ],
    id: 'text',
    label: 'Text',
    preview: payload => payload.text,
    searchTerms: ['text', 'note'],
    sections: ['Popular', 'Communication'],
    validate: payload => required(payload.text, 'Text'),
  },
  {
    buildInitialPayload: (): WifiPayload => ({
      hidden: false,
      password: '',
      security: 'WPA/WPA2/WPA3',
      ssid: '',
    }),
    description: 'Create a Wi-Fi QR code with escaped network fields.',
    encode: encodeWifi,
    fields: [
      textField('ssid', 'SSID', 'Network name'),
      {
        id: 'security',
        label: 'Security',
        options: ['WPA/WPA2/WPA3', 'WEP', 'None'],
        type: 'select',
      },
      textField('password', 'Password'),
      {id: 'hidden', label: 'Hidden network', type: 'toggle'},
    ],
    id: 'wifi',
    label: 'Wi-Fi',
    preview: payload => payload.ssid || 'Wi-Fi network',
    searchTerms: ['wifi', 'network', 'internet'],
    sections: ['Popular', 'Utility'],
    validate: payload => [
      ...required(payload.ssid, 'SSID'),
      ...(payload.security === 'None' ? [] : required(payload.password, 'Password')),
    ],
  },
  {
    buildInitialPayload: buildInitialContactPayload,
    description: 'Create a vCard contact QR code.',
    encode: encodeContact,
    fields: [
      textField('firstName', 'First name'),
      textField('lastName', 'Last name'),
      textField('company', 'Company'),
      textField('jobTitle', 'Job title'),
      phoneField('phone', 'Phone'),
      phoneField('alternativePhone', 'Alternative phone'),
      {id: 'email', label: 'Email', placeholder: 'name@example.com', type: 'email'},
      urlField('website', 'Website'),
      textField('street', 'Street'),
      textField('city', 'City'),
      textField('region', 'Region'),
      textField('postcode', 'Postcode'),
      textField('country', 'Country'),
      textField('linkedIn', 'LinkedIn'),
      textField('instagram', 'Instagram'),
      phoneField('whatsApp', 'WhatsApp'),
    ],
    id: 'contact',
    label: 'Contact',
    preview: payload =>
      [payload.firstName, payload.lastName].filter(Boolean).join(' ') || 'Contact',
    searchTerms: ['contact', 'vcard', 'person'],
    sections: ['Popular', 'Business'],
    validate: payload => {
      const hasName = payload.firstName.trim() || payload.lastName.trim();
      const hasReachable = payload.phone.trim() || payload.email.trim();
      return hasName || hasReachable
        ? []
        : ['Enter a name, phone number, or email.'];
    },
  },
  {
    buildInitialPayload: buildInitialContactPayload,
    description: 'Create a polished business card vCard.',
    encode: encodeContact,
    fields: [
      textField('firstName', 'First name'),
      textField('lastName', 'Last name'),
      textField('company', 'Company'),
      textField('jobTitle', 'Job title'),
      phoneField('phone', 'Phone'),
      {id: 'email', label: 'Email', placeholder: 'name@company.com', type: 'email'},
      urlField('website', 'Website'),
      textField('linkedIn', 'LinkedIn'),
    ],
    id: 'businessCard',
    label: 'Business Card',
    preview: payload => payload.company || payload.firstName || 'Business card',
    searchTerms: ['business card', 'vcard', 'contact'],
    sections: ['Business'],
    validate: payload => required(payload.firstName || payload.company, 'Name or company'),
  },
  {
    buildInitialPayload: (): EmailPayload => ({email: '', message: '', subject: ''}),
    description: 'Create a pre-filled email QR code.',
    encode: encodeEmail,
    fields: [
      {id: 'email', label: 'Email', placeholder: 'name@example.com', type: 'email'},
      textField('subject', 'Subject'),
      {id: 'message', label: 'Message', multiline: true, type: 'textarea'},
    ],
    id: 'email',
    label: 'Email',
    preview: payload => payload.email,
    searchTerms: ['email', 'mail'],
    sections: ['Popular', 'Communication'],
    validate: payload => [...required(payload.email, 'Email'), ...emailErrors(payload.email)],
  },
  {
    buildInitialPayload: (): SmsPayload => ({message: '', phone: ''}),
    description: 'Create a pre-filled SMS QR code.',
    encode: encodeSms,
    fields: [phoneField(), {id: 'message', label: 'Message', multiline: true, type: 'textarea'}],
    id: 'sms',
    label: 'SMS',
    preview: payload => payload.phone,
    searchTerms: ['sms', 'message', 'text message'],
    sections: ['Popular', 'Communication'],
    validate: payload => [...required(payload.phone, 'Phone'), ...phoneErrors(payload.phone)],
  },
  {
    buildInitialPayload: () => ({phone: ''}),
    description: 'Create a QR code that starts a phone call.',
    encode: encodePhone,
    fields: [phoneField()],
    id: 'phone',
    label: 'Phone',
    preview: payload => payload.phone,
    searchTerms: ['phone', 'call', 'telephone'],
    sections: ['Popular', 'Communication'],
    validate: payload => [...required(payload.phone, 'Phone'), ...phoneErrors(payload.phone)],
  },
  {
    buildInitialPayload: (): WhatsAppPayload => ({message: '', phone: ''}),
    description: 'Create a WhatsApp chat QR code.',
    encode: encodeWhatsApp,
    fields: [phoneField(), {id: 'message', label: 'Optional message', multiline: true, type: 'textarea'}],
    id: 'whatsapp',
    label: 'WhatsApp',
    preview: payload => payload.phone,
    searchTerms: ['whatsapp', 'chat'],
    sections: ['Popular', 'Communication'],
    validate: payload => [...required(payload.phone, 'Phone'), ...phoneErrors(payload.phone)],
  },
  {
    buildInitialPayload: (): TelegramPayload => ({username: ''}),
    description: 'Create a Telegram profile QR code.',
    encode: payload => encodeSocialUrl({handleOrUrl: payload.username}, 'https://t.me/'),
    fields: [textField('username', 'Telegram username', '@username')],
    id: 'telegram',
    label: 'Telegram',
    preview: payload => payload.username,
    searchTerms: ['telegram', 'chat'],
    sections: ['Communication'],
    validate: payload => required(payload.username, 'Telegram username'),
  },
  {
    buildInitialPayload: (): LocationPayload => ({latitude: '', longitude: ''}),
    description: 'Create a QR code for map coordinates.',
    encode: encodeLocation,
    fields: [
      {id: 'latitude', label: 'Latitude', placeholder: '5.5600', type: 'number'},
      {id: 'longitude', label: 'Longitude', placeholder: '-0.2057', type: 'number'},
    ],
    id: 'location',
    label: 'Location',
    preview: payload => `${payload.latitude}, ${payload.longitude}`,
    searchTerms: ['location', 'geo', 'maps'],
    sections: ['Popular', 'Utility'],
    validate: payload => [
      ...required(payload.latitude, 'Latitude'),
      ...required(payload.longitude, 'Longitude'),
      ...coordinateErrors(payload.latitude, 'Latitude', -90, 90),
      ...coordinateErrors(payload.longitude, 'Longitude', -180, 180),
    ],
  },
  {
    buildInitialPayload: (): EventPayload => ({
      allDay: false,
      description: '',
      endDate: '',
      endTime: '',
      location: '',
      organizer: '',
      reminder: '',
      startDate: '',
      startTime: '',
      timezone: '',
      title: '',
    }),
    description: 'Create an iCalendar-compatible event QR code.',
    encode: encodeEvent,
    fields: [
      textField('title', 'Title'),
      {id: 'allDay', label: 'All-day', type: 'toggle'},
      {id: 'startDate', label: 'Start date', placeholder: '2026-09-25', type: 'date'},
      {id: 'startTime', label: 'Start time', placeholder: '09:00', type: 'time'},
      {id: 'endDate', label: 'End date', placeholder: '2026-09-25', type: 'date'},
      {id: 'endTime', label: 'End time', placeholder: '10:00', type: 'time'},
      {id: 'timezone', label: 'Timezone', placeholder: 'Africa/Accra', type: 'timezone'},
      textField('location', 'Location'),
      {id: 'description', label: 'Description', multiline: true, type: 'textarea'},
      textField('organizer', 'Organizer'),
      {id: 'reminder', label: 'Reminder minutes before', placeholder: '15', type: 'number'},
    ],
    id: 'event',
    label: 'Event',
    preview: payload => payload.title || 'Calendar event',
    searchTerms: ['calendar', 'event', 'ical'],
    sections: ['Popular', 'Utility'],
    validate: payload => [
      ...required(payload.title, 'Title'),
      ...required(payload.startDate, 'Start date'),
      ...required(payload.endDate, 'End date'),
      ...dateErrors(payload.startDate, 'Start date'),
      ...dateErrors(payload.endDate, 'End date'),
      ...(payload.allDay ? [] : timeErrors(payload.startTime, 'Start time')),
      ...(payload.allDay ? [] : timeErrors(payload.endTime, 'End time')),
      ...reminderErrors(payload.reminder),
      ...chronologicalEventErrors(payload),
    ],
  },
  urlAlias('menuUrl', 'Menu URL', ['Business']),
  urlAlias('googleReviewUrl', 'Google Review URL', ['Business']),
  urlAlias('paymentUrl', 'Payment URL', ['Business']),
  urlAlias('appUrl', 'App URL', ['Business']),
  urlAlias('productUrl', 'Product URL', ['Business']),
  socialDefinition('instagram', 'Instagram', 'https://instagram.com/'),
  socialDefinition('facebook', 'Facebook', 'https://facebook.com/'),
  socialDefinition('tiktok', 'TikTok', 'https://tiktok.com/@'),
  socialDefinition('youtube', 'YouTube', 'https://youtube.com/'),
  socialDefinition('x', 'X', 'https://x.com/'),
  socialDefinition('linkedin', 'LinkedIn', 'https://linkedin.com/in/'),
  socialDefinition('threads', 'Threads', 'https://threads.net/@'),
  socialDefinition('snapchat', 'Snapchat', 'https://snapchat.com/add/'),
  socialDefinition('spotify', 'Spotify', 'https://open.spotify.com/user/'),
  socialDefinition('messenger', 'Messenger', 'https://m.me/'),
  {
    buildInitialPayload: (): WebsitePayload => ({url: ''}),
    description: 'Create a QR code for a custom app deep link.',
    encode: payload => payload.url.trim(),
    fields: [urlField('url', 'App link')],
    id: 'appLink',
    label: 'App Link',
    preview: payload => payload.url,
    searchTerms: ['app link', 'deep link', 'custom scheme'],
    sections: ['Utility'],
    validate: payload =>
      /^[a-z][a-z0-9+.-]*:\/\//i.test(payload.url.trim())
        ? []
        : ['Enter an app link with a scheme, like myapp://path.'],
  },
];

export const qrGeneratorSections: QRGeneratorSection[] = [
  'Popular',
  'Communication',
  'Business',
  'Social',
  'Utility',
  'Barcodes',
];

export function getQRGeneratorDefinition(id: QRGeneratorId) {
  return qrGeneratorDefinitions.find(definition => definition.id === id);
}

function buildInitialContactPayload(): ContactPayload {
  return {
    alternativePhone: '',
    city: '',
    company: '',
    country: '',
    email: '',
    firstName: '',
    instagram: '',
    jobTitle: '',
    lastName: '',
    linkedIn: '',
    phone: '',
    postcode: '',
    region: '',
    street: '',
    website: '',
    whatsApp: '',
  };
}

function urlAlias(
  id: QRGeneratorId,
  label: string,
  sections: QRGeneratorSection[],
  placeholder = 'example.com',
): AnyQRGeneratorDefinition {
  return {
    buildInitialPayload: () => ({url: ''}),
    description: `Create a QR code for a ${label.toLowerCase()}.`,
    encode: encodeWebsite,
    fields: [{...urlField(), placeholder}],
    id,
    label,
    preview: payload => encodeWebsite(payload),
    searchTerms: [label, 'url', 'link'],
    sections,
    validate: payload => [...required(payload.url, 'URL'), ...urlErrors(payload.url)],
  };
}

function coordinateErrors(
  value: string,
  label: string,
  min: number,
  max: number,
) {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    return [`${label} must be between ${min} and ${max}.`];
  }

  return [];
}

function eventDateValue(date: string, time: string, allDay: boolean) {
  const dateErrorsResult = dateErrors(date, 'Date');

  if (dateErrorsResult.length) {
    return undefined;
  }

  if (allDay) {
    return new Date(`${date}T00:00:00`).getTime();
  }

  const normalizedTime = time.trim() || '00:00';

  if (timeErrors(normalizedTime, 'Time').length) {
    return undefined;
  }

  return new Date(`${date}T${normalizedTime}:00`).getTime();
}
