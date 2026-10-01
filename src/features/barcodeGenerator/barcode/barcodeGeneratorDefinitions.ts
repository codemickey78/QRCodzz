import {
  BarcodeFormat,
  BarcodeService,
  normalizeBarcodeContent,
} from '../../../services/barcode/BarcodeService';
import {bwipBarcodeCatalog} from '../../../services/barcode/bwipBarcodeCatalog';
import {
  AnyQRGeneratorDefinition,
  QRGeneratorField,
  QRGeneratorId,
} from '../../generator/qr/qrGeneratorTypes';

type BarcodePayload = {
  altText: string;
  content: string;
  options: string;
};

const contentField = (
  definition: (typeof bwipBarcodeCatalog)[number],
): QRGeneratorField => ({
  id: 'content',
  label: 'Content',
  multiline: definition.multiline,
  placeholder: definition.placeholder,
  type: definition.multiline ? 'textarea' : 'text',
});

function barcodeDefinition(
  definition: (typeof bwipBarcodeCatalog)[number],
): AnyQRGeneratorDefinition {
  const label = definition.label as BarcodeFormat;

  return {
    buildInitialPayload: (): BarcodePayload => ({
      altText: '',
      content: '',
      options: '',
    }),
    description: definition.description,
    encode: payload =>
      normalizeBarcodeContent(label, payload.content).content ?? '',
    fields: [
      contentField(definition),
      {
        id: 'altText',
        label: 'Alt text',
        placeholder: 'Optional human-readable label',
        type: 'text',
      },
      {
        id: 'options',
        label: 'BWIP options',
        multiline: true,
        placeholder: 'Optional, e.g. includetext scale=3 height=12',
        type: 'textarea',
      },
    ],
    helperText: payload => {
      const result = BarcodeService.validateRenderablePayload({
        content: payload.content,
        format: label,
        options: payload.options,
      });
      return result.valid ? result.message : undefined;
    },
    id: definition.id as QRGeneratorId,
    label,
    preview: payload =>
      normalizeBarcodeContent(label, payload.content).content ??
      payload.content,
    searchTerms: [label, definition.bcid, 'barcode', ...definition.searchTerms],
    sections: ['Barcodes'],
    validate: payload => {
      const result = BarcodeService.validateRenderablePayload({
        content: payload.content,
        format: label,
        options: payload.options,
      });
      return result.valid ? [] : [result.message ?? 'Invalid barcode content.'];
    },
  };
}

export const barcodeGeneratorDefinitions: AnyQRGeneratorDefinition[] =
  bwipBarcodeCatalog.map(barcodeDefinition);

export function getBarcodeGeneratorDefinition(id: string) {
  return barcodeGeneratorDefinitions.find(definition => definition.id === id);
}
