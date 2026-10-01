export type QRCodePayload = {
  content: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
};

export const QRCodeService = {
  validatePayload(payload: QRCodePayload) {
    return payload.content.trim().length > 0;
  },
};
