import { Platform, Share } from 'react-native';

export const SharingService = {
  async shareFile(path: string, title?: string) {
    const url = path.startsWith('file://') ? path : `file://${path}`;

    if (Platform.OS === 'ios') {
      return Share.share({ title, url });
    }

    return Share.share({ message: url, title });
  },

  async shareText(title: string, message: string) {
    return Share.share({ message, title });
  },
};
