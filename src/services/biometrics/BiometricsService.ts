export type BiometricsAvailability = {
  available: boolean;
  biometryType?: 'face' | 'fingerprint' | 'generic';
  reason?: string;
};

export type BiometricsAuthenticationResult = {
  message?: string;
  success: boolean;
};

export const BiometricsService = {
  async authenticate(
    _reason: string,
  ): Promise<BiometricsAuthenticationResult> {
    return {
      message:
        'Device authentication is not connected in this local build yet.',
      success: false,
    };
  },

  async getAvailability(): Promise<BiometricsAvailability> {
    return {
      available: false,
      reason:
        'Device authentication is not connected in this local build yet.',
    };
  },

  async isAvailable() {
    const availability = await this.getAvailability();
    return availability.available;
  },
};
