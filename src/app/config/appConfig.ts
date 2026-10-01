export const appConfig = {
  ads: {
    // Toggle this back to true after recording demo videos.
    enabled: false,
    androidAppId: 'ca-app-pub-3483260765526128~4762332468',
    iosAppId: 'ca-app-pub-3483260765526128~7771639188',
    testMode: false,
    units: {
      android: {
        banner: 'ca-app-pub-3483260765526128/7647601825',
        interstitial: 'ca-app-pub-3483260765526128/2939124065',
        rewarded: 'ca-app-pub-3483260765526128/9890621787',
      },
      ios: {
        banner: 'ca-app-pub-3483260765526128/4582454785',
        interstitial: 'ca-app-pub-3483260765526128/5556539383',
        rewarded: 'ca-app-pub-3483260765526128/1873454402',
      },
    },
  },
  googleAnalytics: {
    apiSecret: '',
    endpoint: 'https://www.google-analytics.com/mp/collect',
    measurementId: '',
  },
  name: 'QRCodzz',
  tagline: 'Scan, create, design, organize, and export codes.',
  storageSchemaVersion: 3,
} as const;
