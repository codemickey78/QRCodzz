declare module '@react-native-firebase/analytics' {
  export type FirebaseAnalyticsTypes = {
    Module: {
      logEvent(name: string, params?: Record<string, unknown>): Promise<void>;
    };
  };

  export default function analytics(): FirebaseAnalyticsTypes['Module'];
}
