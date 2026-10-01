import {
  AnalyticsEventName,
  createAnalyticsEvent,
} from '../../features/security';
export type AnalyticsSink = {
  track: (event: ReturnType<typeof createAnalyticsEvent>) => Promise<void> | void;
};

export class PrivacySafeAnalyticsService {
  constructor(private readonly sink?: AnalyticsSink) {}

  async track(
    name: AnalyticsEventName,
    properties: Record<string, unknown> = {},
  ) {
    const event = createAnalyticsEvent(name, properties);
    try {
      await this.sink?.track(event);
    } catch {
      // Analytics must never block local-first app actions.
    }
    return event;
  }
}

type FirebaseAnalyticsModule = {
  default?: () => {
    logEvent: (
      name: string,
      params?: Record<string, unknown>,
    ) => Promise<void>;
  };
};

class FirebaseAnalyticsSink implements AnalyticsSink {
  async track(event: ReturnType<typeof createAnalyticsEvent>) {
    const analyticsModule = (await import(
      '@react-native-firebase/analytics'
    )) as FirebaseAnalyticsModule;
    const analytics = analyticsModule.default?.();
    await analytics?.logEvent(event.name, event.properties ?? {});
  }
}

export const analyticsService = new PrivacySafeAnalyticsService(
  new FirebaseAnalyticsSink(),
);
