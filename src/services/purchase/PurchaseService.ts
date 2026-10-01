import {adMobService, areAdsEnabled} from '../ads/AdMobService';

export type PremiumProductId = 'premium-monthly' | 'premium-annual' | 'premium-lifetime';

export type PremiumProductKind = 'monthly' | 'annual' | 'lifetime';

export type PremiumProduct = {
  description: string;
  id: PremiumProductId;
  kind: PremiumProductKind;
  title: string;
};

export type PurchaseResult =
  | { status: 'success'; productId: PremiumProductId }
  | { message: string; status: 'cancelled' | 'unavailable' };

export type RestoreResult =
  | { status: 'restored' }
  | { message: string; status: 'notFound' | 'unavailable' };

export interface PurchaseService {
  getProducts(): Promise<PremiumProduct[]>;
  hasProAccess(): Promise<boolean>;
  purchase(productId: PremiumProductId): Promise<PurchaseResult>;
  restore(): Promise<RestoreResult>;
}

const billingUnavailableMessage =
  'Purchases are not available until a billing provider is connected.';

export class UnavailablePurchaseService implements PurchaseService {
  async getProducts() {
    return [];
  }

  async hasProAccess() {
    return false;
  }

  async purchase(_productId: PremiumProductId): Promise<PurchaseResult> {
    return {
      message: billingUnavailableMessage,
      status: 'unavailable',
    };
  }

  async restore(): Promise<RestoreResult> {
    return {
      message: billingUnavailableMessage,
      status: 'unavailable',
    };
  }
}

export const purchaseService: PurchaseService = new UnavailablePurchaseService();

export type RewardedAccessReason =
  | 'advancedQRStudio'
  | 'batchGeneration'
  | 'export'
  | 'generation'
  | 'secureVault'
  | 'template';

export type RewardedAccessResult =
  | {status: 'earned'; reason: RewardedAccessReason}
  | {message: string; status: 'cancelled' | 'unavailable'};

export interface RewardedAccessService {
  requestAccess(reason: RewardedAccessReason): Promise<RewardedAccessResult>;
}

export class PlaceholderRewardedAccessService implements RewardedAccessService {
  async requestAccess(reason: RewardedAccessReason): Promise<RewardedAccessResult> {
    if (!areAdsEnabled) {
      return {reason, status: 'earned'};
    }

    const result = await adMobService.showRewardedAd();

    if (result.status === 'earned') {
      return {reason, status: 'earned'};
    }

    return result;
  }
}

export const rewardedAccessService: RewardedAccessService =
  new PlaceholderRewardedAccessService();
