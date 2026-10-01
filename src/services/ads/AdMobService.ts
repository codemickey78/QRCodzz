import {Platform} from 'react-native';
import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import {appConfig} from '../../app/config/appConfig';

export type FullscreenAdResult =
  | {status: 'shown'}
  | {message: string; status: 'cancelled' | 'unavailable'};

export type RewardedAdResult =
  | {status: 'earned'}
  | {message: string; status: 'cancelled' | 'unavailable'};

type Unsubscribe = () => void;

const adLoadTimeoutMs = 15000;

export const areAdsEnabled = appConfig.ads.enabled;

export const adUnitIds = {
  banner: resolveAdUnitId('banner'),
  interstitial: resolveAdUnitId('interstitial'),
  rewarded: resolveAdUnitId('rewarded'),
};

class AdMobService {
  private initializePromise?: Promise<unknown>;
  private lastInterstitialShownAt = 0;
  private interstitialPromise?: Promise<FullscreenAdResult>;
  private rewardedPromise?: Promise<RewardedAdResult>;

  initialize() {
    if (!areAdsEnabled) {
      return Promise.resolve();
    }

    if (!this.initializePromise) {
      this.initializePromise = mobileAds().initialize();
    }

    return this.initializePromise;
  }

  async showInterstitial(): Promise<FullscreenAdResult> {
    if (this.interstitialPromise) {
      return {message: 'Interstitial already loading.', status: 'cancelled'};
    }

    if (!this.canRequestAds()) {
      return {message: 'Interstitial ads are not configured.', status: 'unavailable'};
    }

    const now = Date.now();
    if (now - this.lastInterstitialShownAt < 90000) {
      return {message: 'Interstitial skipped by frequency cap.', status: 'cancelled'};
    }

    await this.initialize();

    this.interstitialPromise = new Promise(resolve => {
      const interstitial = InterstitialAd.createForAdRequest(adUnitIds.interstitial, {
        requestNonPersonalizedAdsOnly: true,
      });
      const cleanupFns: Unsubscribe[] = [];
      let didResolve = false;
      let didOpen = false;

      const cleanup = () => {
        cleanupFns.forEach(unsubscribe => unsubscribe());
        interstitial.destroy();
      };
      const finish = (result: FullscreenAdResult) => {
        if (didResolve) {
          return;
        }
        didResolve = true;
        this.interstitialPromise = undefined;
        cleanup();
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish({message: 'The interstitial ad was not ready.', status: 'unavailable'});
      }, adLoadTimeoutMs);
      cleanupFns.push(() => clearTimeout(timeout));
      cleanupFns.push(
        interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show().catch(error => {
            finish({
              message:
                error instanceof Error ? error.message : 'The interstitial ad could not be shown.',
              status: 'unavailable',
            });
          });
        }) as unknown as Unsubscribe,
      );
      cleanupFns.push(
        interstitial.addAdEventListener(AdEventType.OPENED, () => {
          didOpen = true;
          this.lastInterstitialShownAt = Date.now();
        }) as unknown as Unsubscribe,
      );
      cleanupFns.push(
        interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          finish(didOpen ? {status: 'shown'} : {message: 'Ad closed.', status: 'cancelled'});
        }) as unknown as Unsubscribe,
      );
      cleanupFns.push(
        interstitial.addAdEventListener(AdEventType.ERROR, error => {
          finish({
            message:
              error instanceof Error ? error.message : 'The interstitial ad could not load.',
            status: 'unavailable',
          });
        }) as unknown as Unsubscribe,
      );

      interstitial.load();
    });

    return this.interstitialPromise;
  }

  async showRewardedAd(): Promise<RewardedAdResult> {
    if (this.rewardedPromise) {
      return {message: 'Rewarded ad already loading.', status: 'cancelled'};
    }

    if (!this.canRequestAds()) {
      return {message: 'Rewarded ads are not configured.', status: 'unavailable'};
    }

    await this.initialize();

    this.rewardedPromise = new Promise(resolve => {
      const rewarded = RewardedAd.createForAdRequest(adUnitIds.rewarded, {
        requestNonPersonalizedAdsOnly: true,
      });
      const cleanupFns: Unsubscribe[] = [];
      let didResolve = false;
      let didEarnReward = false;

      const cleanup = () => {
        cleanupFns.forEach(unsubscribe => unsubscribe());
        rewarded.destroy();
      };
      const finish = (result: RewardedAdResult) => {
        if (didResolve) {
          return;
        }
        didResolve = true;
        this.rewardedPromise = undefined;
        cleanup();
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish({message: 'The rewarded ad was not ready.', status: 'unavailable'});
      }, adLoadTimeoutMs);
      cleanupFns.push(() => clearTimeout(timeout));
      cleanupFns.push(
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          rewarded.show().catch(error => {
            finish({
              message:
                error instanceof Error ? error.message : 'The rewarded ad could not be shown.',
              status: 'unavailable',
            });
          });
        }) as unknown as Unsubscribe,
      );
      cleanupFns.push(
        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          didEarnReward = true;
        }) as unknown as Unsubscribe,
      );
      cleanupFns.push(
        rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          finish(
            didEarnReward
              ? {status: 'earned'}
              : {message: 'Watch the full rewarded ad to unlock this feature.', status: 'cancelled'},
          );
        }) as unknown as Unsubscribe,
      );
      cleanupFns.push(
        rewarded.addAdEventListener(AdEventType.ERROR, error => {
          finish({
            message:
              error instanceof Error ? error.message : 'The rewarded ad could not load.',
            status: 'unavailable',
          });
        }) as unknown as Unsubscribe,
      );

      rewarded.load();
    });

    return this.rewardedPromise;
  }

  private canRequestAds() {
    return Boolean(
      areAdsEnabled &&
        adUnitIds.banner &&
        adUnitIds.interstitial &&
        adUnitIds.rewarded,
    );
  }
}

function resolveAdUnitId(kind: 'banner' | 'interstitial' | 'rewarded') {
  if (!areAdsEnabled) {
    return '';
  }

  if (appConfig.ads.testMode) {
    return {
      banner: TestIds.BANNER,
      interstitial: TestIds.INTERSTITIAL,
      rewarded: TestIds.REWARDED,
    }[kind];
  }

  const platformUnits =
    Platform.OS === 'ios' ? appConfig.ads.units.ios : appConfig.ads.units.android;
  return platformUnits[kind];
}

export const adMobService = new AdMobService();
