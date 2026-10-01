/* global jest */
const mockStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    clear: jest.fn(() => {
      mockStorage.clear();
      return Promise.resolve();
    }),
    getItem: jest.fn(key => Promise.resolve(mockStorage.get(key) ?? null)),
    removeItem: jest.fn(key => {
      mockStorage.delete(key);
      return Promise.resolve();
    }),
    setItem: jest.fn((key, value) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
  },
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    GestureHandlerRootView: ({children, ...props}) =>
      React.createElement(View, props, children),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    BottomSheetBackdrop: props => React.createElement(View, props),
    BottomSheetModal: React.forwardRef(({children, ...props}, ref) =>
      React.createElement(View, {...props, ref}, children),
    ),
    BottomSheetModalProvider: ({children}) =>
      React.createElement(React.Fragment, null, children),
    BottomSheetScrollView: ({children, ...props}) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-google-mobile-ads', () => {
  const makeAd = () => ({
    addAdEventListener: jest.fn(() => jest.fn()),
    destroy: jest.fn(),
    load: jest.fn(),
    show: jest.fn(() => Promise.resolve()),
  });

  const mobileAds = jest.fn(() => ({
    initialize: jest.fn(() => Promise.resolve([])),
  }));

  return {
    __esModule: true,
    default: mobileAds,
    AdEventType: {
      CLOSED: 'closed',
      ERROR: 'error',
      LOADED: 'loaded',
      OPENED: 'opened',
    },
    BannerAd: props => {
      const React = require('react');
      const {View} = require('react-native');
      return React.createElement(View, props);
    },
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    InterstitialAd: {
      createForAdRequest: jest.fn(makeAd),
    },
    RewardedAd: {
      createForAdRequest: jest.fn(makeAd),
    },
    RewardedAdEventType: {
      EARNED_REWARD: 'earned_reward',
      LOADED: 'rewarded_loaded',
    },
    TestIds: {
      BANNER: 'test-banner',
      INTERSTITIAL: 'test-interstitial',
      REWARDED: 'test-rewarded',
    },
  };
});

jest.mock(
  '@react-native-firebase/analytics',
  () => ({
    __esModule: true,
    default: jest.fn(() => ({
      logEvent: jest.fn(() => Promise.resolve()),
    })),
  }),
  {virtual: true},
);

jest.mock('@tamagui/toast', () => {
  const React = require('react');
  const {Text, View} = require('react-native');

  return {
    Toast: Object.assign(
      ({children, ...props}) => React.createElement(View, props, children),
      {
        Description: ({children, ...props}) =>
          React.createElement(Text, props, children),
        Title: ({children, ...props}) =>
          React.createElement(Text, props, children),
      },
    ),
    ToastProvider: ({children}) => React.createElement(React.Fragment, null, children),
    ToastViewport: props => React.createElement(View, props),
    useToastController: () => ({
      hide: jest.fn(),
      show: jest.fn(),
    }),
    useToastState: () => null,
  };
});

jest.mock('@tamagui/core', () => {
  const React = require('react');

  return {
    TamaguiProvider: ({children}) =>
      React.createElement(React.Fragment, null, children),
    createTamagui: config => config,
  };
});

jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    Camera: props => React.createElement(View, props),
    useCameraDevice: () => ({id: 'test-camera', position: 'back'}),
    useCameraPermission: () => ({
      canRequestPermission: true,
      hasPermission: true,
      requestPermission: jest.fn(() => Promise.resolve(true)),
      status: 'authorized',
    }),
  };
});

jest.mock('react-native-vision-camera-barcode-scanner', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    CodeScanner: props => React.createElement(View, props),
    createBarcodeScanner: jest.fn(() => ({
      dispose: jest.fn(),
      scanCodesInImageAsync: jest.fn(() => Promise.resolve([])),
    })),
    useBarcodeScannerOutput: jest.fn(() => ({})),
  };
});

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({didCancel: true})),
}));

jest.mock('react-native-nitro-image', () => ({
  loadImage: jest.fn(() =>
    Promise.resolve({
      dispose: jest.fn(),
    }),
  ),
}));
