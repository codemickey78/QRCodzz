import {Linking} from 'react-native';

type InAppBrowserModule = {
  isAvailable: () => Promise<boolean>;
  open: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
};

function getInAppBrowser(): InAppBrowserModule | undefined {
  try {
    const browser = require('react-native-inappbrowser-reborn');
    return (browser.default ?? browser) as InAppBrowserModule;
  } catch {
    return undefined;
  }
}

export async function openInAppBrowser(url: string) {
  const browser = getInAppBrowser();

  if (browser && (await browser.isAvailable())) {
    await browser.open(url, {
      dismissButtonStyle: 'close',
      enableDefaultShare: true,
      ephemeralWebSession: false,
      forceCloseOnRedirection: false,
      modalPresentationStyle: 'pageSheet',
      readerMode: false,
      showTitle: true,
    });
    return;
  }

  await Linking.openURL(url);
}
