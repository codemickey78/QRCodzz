import {
  ContactPayload,
  EmailPayload,
  EventPayload,
  LocationPayload,
  SmsPayload,
  SocialPayload,
  WebsitePayload,
  WhatsAppPayload,
  WifiPayload,
} from './qrGeneratorTypes';

export function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export function encodeWebsite(payload: WebsitePayload) {
  return normalizeUrl(payload.url);
}

export function encodeText(payload: { text: string }) {
  return payload.text;
}

export function encodeWifi(payload: WifiPayload) {
  const security = payload.security === 'None' ? 'nopass' : payload.security;
  const fields = [
    `T:${escapeWifiValue(security)}`,
    `S:${escapeWifiValue(payload.ssid)}`,
    payload.security === 'None' ? '' : `P:${escapeWifiValue(payload.password)}`,
    payload.hidden ? 'H:true' : '',
  ].filter(Boolean);

  return `WIFI:${fields.join(';')};`;
}

export function encodeContact(payload: ContactPayload) {
  const fullName = [payload.firstName, payload.lastName]
    .filter(Boolean)
    .join(' ');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardValue(payload.lastName)};${escapeVCardValue(
      payload.firstName,
    )};;;`,
    `FN:${escapeVCardValue(fullName)}`,
    payload.company ? `ORG:${escapeVCardValue(payload.company)}` : '',
    payload.jobTitle ? `TITLE:${escapeVCardValue(payload.jobTitle)}` : '',
    payload.phone ? `TEL;TYPE=CELL:${escapeVCardValue(payload.phone)}` : '',
    payload.alternativePhone
      ? `TEL;TYPE=HOME:${escapeVCardValue(payload.alternativePhone)}`
      : '',
    payload.email ? `EMAIL:${escapeVCardValue(payload.email)}` : '',
    payload.website ? `URL:${normalizeUrl(payload.website)}` : '',
    payload.street ||
    payload.city ||
    payload.region ||
    payload.postcode ||
    payload.country
      ? `ADR:;;${escapeVCardValue(payload.street)};${escapeVCardValue(
          payload.city,
        )};${escapeVCardValue(payload.region)};${escapeVCardValue(
          payload.postcode,
        )};${escapeVCardValue(payload.country)}`
      : '',
    payload.linkedIn
      ? `X-SOCIALPROFILE;TYPE=linkedin:${escapeVCardValue(payload.linkedIn)}`
      : '',
    payload.instagram
      ? `X-SOCIALPROFILE;TYPE=instagram:${escapeVCardValue(payload.instagram)}`
      : '',
    payload.whatsApp ? `X-WHATSAPP:${escapeVCardValue(payload.whatsApp)}` : '',
    'END:VCARD',
  ].filter(Boolean);

  return lines.join('\n');
}

export function encodeEmail(payload: EmailPayload) {
  const params = new URLSearchParams();

  if (payload.subject) {
    params.set('subject', payload.subject);
  }

  if (payload.message) {
    params.set('body', payload.message);
  }

  const query = params.toString();
  return `mailto:${payload.email.trim()}${query ? `?${query}` : ''}`;
}

export function encodeSms(payload: SmsPayload) {
  const phone = payload.phone.trim();
  return payload.message
    ? `SMSTO:${phone}:${payload.message}`
    : `SMSTO:${phone}`;
}

export function encodePhone(payload: { phone: string }) {
  return `tel:${payload.phone.trim()}`;
}

export function encodeWhatsApp(payload: WhatsAppPayload) {
  const phone = payload.phone.replace(/\D/g, '');
  const query = payload.message
    ? `?text=${encodeURIComponent(payload.message)}`
    : '';
  return `https://wa.me/${phone}${query}`;
}

export function encodeLocation(payload: LocationPayload) {
  return `geo:${payload.latitude.trim()},${payload.longitude.trim()}`;
}

export function encodeEvent(payload: EventPayload) {
  const start = formatIcsDate(
    payload.startDate,
    payload.startTime,
    payload.allDay,
  );
  const end = formatIcsDate(payload.endDate, payload.endTime, payload.allDay);
  const timezone = payload.timezone.trim();
  const timeZoneParam =
    timezone && !payload.allDay ? `;TZID=${escapeIcs(timezone)}` : '';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QRCodzz//QR Generator//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeIcs(payload.title)}`,
    start
      ? `DTSTART${payload.allDay ? ';VALUE=DATE' : timeZoneParam}:${start}`
      : '',
    end ? `DTEND${payload.allDay ? ';VALUE=DATE' : timeZoneParam}:${end}` : '',
    payload.location ? `LOCATION:${escapeIcs(payload.location)}` : '',
    payload.description ? `DESCRIPTION:${escapeIcs(payload.description)}` : '',
    payload.organizer ? `ORGANIZER:${escapeIcs(payload.organizer)}` : '',
    payload.reminder.trim()
      ? `BEGIN:VALARM\nTRIGGER:-PT${payload.reminder.trim()}M\nACTION:DISPLAY\nDESCRIPTION:Reminder\nEND:VALARM`
      : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\n');
}

export function encodeSocialUrl(
  payload: SocialPayload,
  baseUrl: string,
  pathPrefix = '',
) {
  const value = payload.handleOrUrl.trim();

  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const handle = value.replace(/^@/, '');
  return `${baseUrl}${pathPrefix}${encodeURIComponent(handle)}`;
}

function escapeWifiValue(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:');
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function escapeVCardValue(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatIcsDate(date: string, time: string, allDay: boolean) {
  if (!date) {
    return '';
  }

  if (allDay) {
    return date.replace(/-/g, '');
  }

  const normalizedTime = time || '00:00';
  return `${date.replace(/-/g, '')}T${normalizedTime.replace(':', '')}00`;
}
