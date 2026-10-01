export type PermissionStatus = 'granted' | 'denied' | 'unavailable' | 'unknown';

export type RuntimePermission =
  | 'camera'
  | 'photos'
  | 'contacts'
  | 'location'
  | 'calendar';

export const PermissionService = {
  async getCameraStatus(): Promise<PermissionStatus> {
    return 'unknown';
  },

  async getStatus(_permission: RuntimePermission): Promise<PermissionStatus> {
    return 'unknown';
  },

  async request(_permission: RuntimePermission): Promise<PermissionStatus> {
    return 'unknown';
  },
};
