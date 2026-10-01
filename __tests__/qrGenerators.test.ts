import {
  encodeContact,
  encodeEmail,
  encodeEvent,
  encodeLocation,
  encodeSms,
  encodeWebsite,
  encodeWhatsApp,
  encodeWifi,
} from '../src/features/generator/qr/qrEncoders';
import { getQRGeneratorDefinition } from '../src/features/generator/qr/qrGeneratorDefinitions';

describe('QR generators', () => {
  test('normalizes website URLs', () => {
    expect(encodeWebsite({ url: 'example.com' })).toBe('https://example.com');
    expect(encodeWebsite({ url: 'https://example.com' })).toBe(
      'https://example.com',
    );
  });

  test('escapes Wi-Fi payload fields', () => {
    expect(
      encodeWifi({
        hidden: true,
        password: 'p:ass;word',
        security: 'WPA/WPA2/WPA3',
        ssid: 'Studio;Guest',
      }),
    ).toBe('WIFI:T:WPA/WPA2/WPA3;S:Studio\\;Guest;P:p\\:ass\\;word;H:true;');
  });

  test('generates vCard contact content', () => {
    const content = encodeContact({
      alternativePhone: '',
      city: 'Accra',
      company: 'Analytical Engine',
      country: 'GH',
      email: 'ada@example.com',
      firstName: 'Ada',
      instagram: 'ada',
      jobTitle: 'Programmer',
      lastName: 'Lovelace',
      linkedIn: 'ada-lovelace',
      phone: '+15551234567',
      postcode: '',
      region: '',
      street: '1 Loop St',
      website: 'example.com',
      whatsApp: '+15551234567',
    });

    expect(content).toContain('BEGIN:VCARD');
    expect(content).toContain('FN:Ada Lovelace');
    expect(content).toContain('URL:https://example.com');
    expect(content).toContain('END:VCARD');
  });

  test('escapes structured contact and calendar text fields', () => {
    const contact = encodeContact({
      alternativePhone: '',
      city: 'Accra',
      company: 'Ada; Labs',
      country: 'GH',
      email: 'ada@example.com',
      firstName: 'Ada',
      instagram: '',
      jobTitle: 'Founder, Research',
      lastName: 'Lovelace',
      linkedIn: '',
      phone: '+15551234567',
      postcode: '',
      region: '',
      street: 'Line 1\nLine 2',
      website: '',
      whatsApp: '',
    });

    expect(contact).toContain('ORG:Ada\\; Labs');
    expect(contact).toContain('TITLE:Founder\\, Research');
    expect(contact).toContain('ADR:;;Line 1\\nLine 2;Accra;;;GH');

    const event = encodeEvent({
      allDay: true,
      description: 'Bring notes; confirm venue',
      endDate: '2026-09-26',
      endTime: '',
      location: 'Studio, East',
      organizer: '',
      reminder: '',
      startDate: '2026-09-25',
      startTime: '',
      timezone: '',
      title: 'Planning, Round 2',
    });

    expect(event).toContain('SUMMARY:Planning\\, Round 2');
    expect(event).toContain('LOCATION:Studio\\, East');
    expect(event).toContain('DESCRIPTION:Bring notes\\; confirm venue');
  });

  test('generates communication payloads', () => {
    expect(
      encodeEmail({
        email: 'hello@example.com',
        message: 'Welcome',
        subject: 'Hi',
      }),
    ).toBe('mailto:hello@example.com?subject=Hi&body=Welcome');

    expect(encodeSms({ message: 'Ping', phone: '+15551234567' })).toBe(
      'SMSTO:+15551234567:Ping',
    );
    expect(
      encodeWhatsApp({ message: 'Hello there', phone: '+1 (555) 123-4567' }),
    ).toBe('https://wa.me/15551234567?text=Hello%20there');
  });

  test('generates location and calendar payloads', () => {
    expect(encodeLocation({ latitude: '5.56', longitude: '-0.2' })).toBe(
      'geo:5.56,-0.2',
    );

    const event = encodeEvent({
      allDay: false,
      description: 'Discuss launch',
      endDate: '2026-09-25',
      endTime: '10:00',
      location: 'Studio',
      organizer: 'team@example.com',
      reminder: '15',
      startDate: '2026-09-25',
      startTime: '09:00',
      timezone: 'Africa/Accra',
      title: 'Launch review',
    });

    expect(event).toContain('BEGIN:VCALENDAR');
    expect(event).toContain('SUMMARY:Launch review');
    expect(event).toContain('DTSTART;TZID=Africa/Accra:20260925T090000');
    expect(event).toContain('TRIGGER:-PT15M');
  });

  test('validates definitions and custom app links', () => {
    const website = getQRGeneratorDefinition('website');
    const appLink = getQRGeneratorDefinition('appLink');

    expect(website?.validate({ url: 'not-a-url' })).toContain(
      'Enter a valid URL.',
    );
    expect(website?.validate({ url: 'example.com' })).toEqual([]);
    expect(appLink?.validate({ url: 'myapp://scan/123' })).toEqual([]);
    expect(appLink?.validate({ url: 'example.com' })).toContain(
      'Enter an app link with a scheme, like myapp://path.',
    );
  });

  test('validates calendar event dates, times, and reminders', () => {
    const event = getQRGeneratorDefinition('event');
    const validPayload = {
      allDay: false,
      description: '',
      endDate: '2026-09-25',
      endTime: '10:00',
      location: '',
      organizer: '',
      reminder: '15',
      startDate: '2026-09-25',
      startTime: '09:00',
      timezone: 'Africa/Accra',
      title: 'Launch review',
    };

    expect(event?.validate(validPayload)).toEqual([]);
    expect(
      event?.validate({ ...validPayload, startDate: '2026-02-30' }),
    ).toContain('Start date must be a real date.');
    expect(event?.validate({ ...validPayload, startTime: '24:30' })).toContain(
      'Start time must use 24-hour HH:MM.',
    );
    expect(event?.validate({ ...validPayload, reminder: 'soon' })).toContain(
      'Reminder must be whole minutes.',
    );
    expect(event?.validate({ ...validPayload, endTime: '08:00' })).toContain(
      'End must be after start.',
    );
  });
});
