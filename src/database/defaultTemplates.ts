import {Template} from './entities/Template';

export const templateCategories = [
  'Restaurant',
  'Business',
  'Event',
  'Creator',
  'Personal',
] as const;

export type TemplateCategory = (typeof templateCategories)[number];

export type TemplateConfiguration = {
  defaultPayload: Record<string, unknown>;
  generatorId: string;
  pack?: string;
  tags: string[];
  titleHint: string;
};

export const builtInTemplates: Template[] = [
  restaurantTemplate('restaurant-menu', 'Menu QR', 'menuUrl', {
    tags: ['restaurant', 'menu', 'starter'],
    titleHint: 'Menu',
  }),
  restaurantTemplate('restaurant-wifi', 'Wi-Fi QR', 'wifi', {
    defaultPayload: {
      hidden: false,
      password: '',
      security: 'WPA/WPA2/WPA3',
      ssid: '',
    },
    tags: ['restaurant', 'wifi', 'guest'],
    titleHint: 'Guest Wi-Fi',
  }),
  restaurantTemplate('restaurant-google-review', 'Google Review QR', 'googleReviewUrl', {
    tags: ['restaurant', 'review', 'google'],
    titleHint: 'Google Review',
  }),
  restaurantTemplate('restaurant-instagram', 'Instagram QR', 'instagram', {
    defaultPayload: {handleOrUrl: ''},
    tags: ['restaurant', 'instagram', 'social'],
    titleHint: 'Instagram',
  }),
  restaurantTemplate('restaurant-location', 'Location QR', 'location', {
    defaultPayload: {latitude: '', longitude: ''},
    tags: ['restaurant', 'location', 'maps'],
    titleHint: 'Location',
  }),
  creatorTemplate('creator-instagram', 'Instagram', 'instagram'),
  creatorTemplate('creator-tiktok', 'TikTok', 'tiktok'),
  creatorTemplate('creator-youtube', 'YouTube', 'youtube'),
  creatorTemplate('creator-spotify', 'Spotify', 'spotify'),
  businessTemplate('business-website', 'Website', 'website'),
  businessTemplate('business-whatsapp', 'WhatsApp', 'whatsapp', {
    defaultPayload: {message: '', phone: ''},
    tags: ['business', 'whatsapp', 'chat'],
    titleHint: 'WhatsApp',
  }),
  businessTemplate('business-contact', 'Contact', 'contact', {
    defaultPayload: {
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
    },
    tags: ['business', 'contact', 'vcard'],
    titleHint: 'Contact',
  }),
  businessTemplate('business-review', 'Review', 'googleReviewUrl', {
    tags: ['business', 'review', 'google'],
    titleHint: 'Review',
  }),
  businessTemplate('business-payment', 'Payment', 'paymentUrl', {
    tags: ['business', 'payment', 'checkout'],
    titleHint: 'Payment',
  }),
  eventTemplate('event-invitation', 'Event Invitation', 'event', {
    defaultPayload: {
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
    },
    tags: ['event', 'calendar', 'invitation'],
    titleHint: 'Event',
  }),
  personalTemplate('personal-website', 'Personal Website', 'website'),
  personalTemplate('personal-text-note', 'Text Note', 'text', {
    defaultPayload: {text: ''},
    tags: ['personal', 'text', 'note'],
    titleHint: 'Note',
  }),
];

export function mergeBuiltInTemplates(templates: Template[]) {
  const existingIds = new Set(templates.map(template => template.id));
  return [
    ...templates,
    ...builtInTemplates.filter(template => !existingIds.has(template.id)),
  ];
}

function restaurantTemplate(
  id: string,
  name: string,
  generatorId: string,
  overrides: Partial<TemplateConfiguration> = {},
) {
  return createTemplate(id, name, 'Restaurant', 'Restaurant Starter Pack', generatorId, overrides);
}

function creatorTemplate(
  id: string,
  name: string,
  generatorId: string,
  overrides: Partial<TemplateConfiguration> = {},
) {
  return createTemplate(id, name, 'Creator', 'Creator Pack', generatorId, {
    defaultPayload: {handleOrUrl: ''},
    tags: ['creator', name.toLowerCase(), 'social'],
    titleHint: name,
    ...overrides,
  });
}

function businessTemplate(
  id: string,
  name: string,
  generatorId: string,
  overrides: Partial<TemplateConfiguration> = {},
) {
  return createTemplate(id, name, 'Business', 'Business Pack', generatorId, overrides);
}

function eventTemplate(
  id: string,
  name: string,
  generatorId: string,
  overrides: Partial<TemplateConfiguration> = {},
) {
  return createTemplate(id, name, 'Event', undefined, generatorId, overrides);
}

function personalTemplate(
  id: string,
  name: string,
  generatorId: string,
  overrides: Partial<TemplateConfiguration> = {},
) {
  return createTemplate(id, name, 'Personal', undefined, generatorId, overrides);
}

function createTemplate(
  id: string,
  name: string,
  category: TemplateCategory,
  pack: string | undefined,
  generatorId: string,
  overrides: Partial<TemplateConfiguration> = {},
): Template {
  const configuration: TemplateConfiguration = {
    defaultPayload: {url: ''},
    generatorId,
    pack,
    tags: [category.toLowerCase(), name.toLowerCase()],
    titleHint: name.replace(/\s+QR$/, ''),
    ...overrides,
  };

  return {
    category,
    configuration,
    id,
    isBuiltIn: true,
    name,
  };
}
