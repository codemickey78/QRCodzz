import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  PremiumProduct,
  PremiumProductId,
  PurchaseResult,
  PurchaseService,
  RewardedAccessReason,
  RewardedAccessResult,
  RestoreResult,
  purchaseService,
  rewardedAccessService,
} from '../../services/purchase/PurchaseService';
import { areAdsEnabled } from '../../services/ads/AdMobService';
import { useTheme } from '../../theme/useTheme';

export type PremiumTier = 'free' | 'pro';

export type PremiumFeature =
  | 'qrScanning'
  | 'imageScanning'
  | 'standardQRGeneration'
  | 'basicBarcodeGeneration'
  | 'history'
  | 'favorites'
  | 'basicColors'
  | 'pngExport'
  | 'limitedFolders'
  | 'removeAds'
  | 'advancedQRStudio'
  | 'gradients'
  | 'customEyes'
  | 'customModules'
  | 'logoSupport'
  | 'frames'
  | 'customCTA'
  | 'svgExport'
  | 'pdfExport'
  | 'batchGeneration'
  | 'batchScanning'
  | 'csvImport'
  | 'zipExport'
  | 'unlimitedFolders'
  | 'secureVault'
  | 'advancedBarcodeFormats'
  | 'premiumTemplates'
  | 'backup'
  | 'customSearchActions'
  | 'printSheets';

export type PremiumFeatureDefinition = {
  adRequired?: boolean;
  description: string;
  feature: PremiumFeature;
  title: string;
  tier: PremiumTier;
};

export const premiumProductStructure: Array<{
  id: PremiumProductId;
  kind: PremiumProduct['kind'];
  title: string;
}> = [
  { id: 'premium-monthly', kind: 'monthly', title: 'Monthly' },
  { id: 'premium-annual', kind: 'annual', title: 'Annual' },
  { id: 'premium-lifetime', kind: 'lifetime', title: 'Lifetime' },
];

export const premiumFeatureCatalog: Record<
  PremiumFeature,
  PremiumFeatureDefinition
> = {
  advancedBarcodeFormats: {
    adRequired: true,
    description: 'Use advanced barcode symbologies after a rewarded ad.',
    feature: 'advancedBarcodeFormats',
    tier: 'free',
    title: 'Advanced barcode formats',
  },
  advancedQRStudio: {
    adRequired: true,
    description: 'Use the full Studio for branded QR design controls after a rewarded ad.',
    feature: 'advancedQRStudio',
    tier: 'free',
    title: 'Advanced QR Studio',
  },
  backup: {
    adRequired: true,
    description: 'Export and restore complete workspace backups after a rewarded ad.',
    feature: 'backup',
    tier: 'free',
    title: 'Backup',
  },
  basicBarcodeGeneration: {
    description: 'Create common barcode formats.',
    feature: 'basicBarcodeGeneration',
    tier: 'free',
    title: 'Basic barcode generation',
  },
  basicColors: {
    description: 'Apply basic foreground and background colors.',
    feature: 'basicColors',
    tier: 'free',
    title: 'Basic colors',
  },
  batchGeneration: {
    adRequired: true,
    description: 'Generate many QR codes or barcodes from pasted data or imports after a rewarded ad.',
    feature: 'batchGeneration',
    tier: 'free',
    title: 'Batch generation',
  },
  batchScanning: {
    adRequired: true,
    description: 'Scan batches into organized review sessions after a rewarded ad.',
    feature: 'batchScanning',
    tier: 'free',
    title: 'Batch scanning',
  },
  csvImport: {
    adRequired: true,
    description: 'Import CSV data for batch creation after a rewarded ad.',
    feature: 'csvImport',
    tier: 'free',
    title: 'CSV import',
  },
  customCTA: {
    adRequired: true,
    description: 'Customize frame call-to-action text after a rewarded ad.',
    feature: 'customCTA',
    tier: 'free',
    title: 'Custom CTA',
  },
  customEyes: {
    adRequired: true,
    description: 'Customize QR eye frame and center styles after a rewarded ad.',
    feature: 'customEyes',
    tier: 'free',
    title: 'Custom eyes',
  },
  customModules: {
    adRequired: true,
    description: 'Customize QR module shapes after a rewarded ad.',
    feature: 'customModules',
    tier: 'free',
    title: 'Custom modules',
  },
  customSearchActions: {
    adRequired: true,
    description: 'Create custom scan result actions and search providers after a rewarded ad.',
    feature: 'customSearchActions',
    tier: 'free',
    title: 'Custom search actions',
  },
  favorites: {
    description: 'Mark important saved codes as favorites.',
    feature: 'favorites',
    tier: 'free',
    title: 'Favorites',
  },
  frames: {
    adRequired: true,
    description: 'Add scan-safe frames around QR codes after a rewarded ad.',
    feature: 'frames',
    tier: 'free',
    title: 'Frames',
  },
  gradients: {
    adRequired: true,
    description: 'Use linear and radial QR gradients after a rewarded ad.',
    feature: 'gradients',
    tier: 'free',
    title: 'Gradients',
  },
  history: {
    description: 'Keep local scan and creation history.',
    feature: 'history',
    tier: 'free',
    title: 'History',
  },
  imageScanning: {
    description: 'Scan QR codes and barcodes from images.',
    feature: 'imageScanning',
    tier: 'free',
    title: 'Scan image',
  },
  limitedFolders: {
    description: 'Organize saved codes with a limited number of folders.',
    feature: 'limitedFolders',
    tier: 'free',
    title: 'Limited folders',
  },
  logoSupport: {
    adRequired: true,
    description: 'Place scan-safe logos in QR codes after a rewarded ad.',
    feature: 'logoSupport',
    tier: 'free',
    title: 'Logo support',
  },
  pdfExport: {
    adRequired: true,
    description: 'Export print-ready PDFs after a rewarded ad.',
    feature: 'pdfExport',
    tier: 'free',
    title: 'PDF export',
  },
  pngExport: {
    description: 'Export PNG images.',
    feature: 'pngExport',
    tier: 'free',
    title: 'PNG export',
  },
  premiumTemplates: {
    adRequired: true,
    description: 'Use business, creator, and campaign templates after a rewarded ad.',
    feature: 'premiumTemplates',
    tier: 'free',
    title: 'Template packs',
  },
  printSheets: {
    adRequired: true,
    description: 'Create sheets for labels, flyers, and print runs after a rewarded ad.',
    feature: 'printSheets',
    tier: 'free',
    title: 'Print sheets',
  },
  qrScanning: {
    description: 'Scan unlimited QR codes.',
    feature: 'qrScanning',
    tier: 'free',
    title: 'Unlimited QR scanning',
  },
  removeAds: {
    description: 'Ads only appear before selected rewarded tools.',
    feature: 'removeAds',
    tier: 'free',
    title: 'Rewarded ads only',
  },
  secureVault: {
    adRequired: true,
    description: 'Protect sensitive codes with vault controls after a rewarded ad.',
    feature: 'secureVault',
    tier: 'free',
    title: 'Secure vault',
  },
  standardQRGeneration: {
    description: 'Create standard QR codes from structured payloads.',
    feature: 'standardQRGeneration',
    tier: 'free',
    title: 'Standard QR generation',
  },
  svgExport: {
    adRequired: true,
    description: 'Export scalable SVG files after a rewarded ad.',
    feature: 'svgExport',
    tier: 'free',
    title: 'SVG export',
  },
  unlimitedFolders: {
    adRequired: true,
    description: 'Create unlimited folders after a rewarded ad.',
    feature: 'unlimitedFolders',
    tier: 'free',
    title: 'Unlimited folders',
  },
  zipExport: {
    adRequired: true,
    description: 'Export batches as ZIP packages after a rewarded ad.',
    feature: 'zipExport',
    tier: 'free',
    title: 'ZIP export',
  },
};

type PremiumContextValue = {
  canUseFeature: (feature: PremiumFeature) => boolean;
  errorMessage?: string;
  hasProAccess: boolean;
  isLoading: boolean;
  products: PremiumProduct[];
  purchase: (productId: PremiumProductId) => Promise<PurchaseResult>;
  refresh: () => Promise<void>;
  requestRewardedAccess: (
    reason: RewardedAccessReason,
  ) => Promise<RewardedAccessResult>;
  restore: () => Promise<RestoreResult>;
  serviceAvailable: boolean;
};

const PremiumContext = createContext<PremiumContextValue | undefined>(
  undefined,
);

type PremiumProviderProps = PropsWithChildren<{
  service?: PurchaseService;
}>;

export function PremiumProvider({
  children,
  service = purchaseService,
}: PremiumProviderProps) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [hasProAccess, setHasProAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<PremiumProduct[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const [nextProducts, nextHasProAccess] = await Promise.all([
        service.getProducts(),
        service.hasProAccess(),
      ]);
      setProducts(nextProducts);
      setHasProAccess(nextHasProAccess);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Rewarded access status could not be loaded.',
      );
      setProducts([]);
      setHasProAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchase = useCallback(
    async (productId: PremiumProductId) => {
      const result = await service.purchase(productId);

      if (result.status === 'success') {
        await refresh();
      }

      return result;
    },
    [refresh, service],
  );

  const restore = useCallback(async () => {
    const result = await service.restore();

    if (result.status === 'restored') {
      await refresh();
    }

    return result;
  }, [refresh, service]);

  const canUseFeature = useCallback((_feature: PremiumFeature) => true, []);

  const requestRewardedAccess = useCallback(
    async (reason: RewardedAccessReason) => {
      const result = await rewardedAccessService.requestAccess(reason);
      if (result.status === 'earned') {
        return result;
      }
      return result;
    },
    [],
  );

  const value = useMemo(
    () => ({
      canUseFeature,
      errorMessage,
      hasProAccess,
      isLoading,
      products,
      purchase,
      refresh,
      requestRewardedAccess,
      restore,
      serviceAvailable: products.length > 0,
    }),
    [
      canUseFeature,
      errorMessage,
      hasProAccess,
      isLoading,
      products,
      purchase,
      refresh,
      requestRewardedAccess,
      restore,
    ],
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);

  if (!context) {
    throw new Error('usePremium must be used inside PremiumProvider');
  }

  return context;
}

type FeatureGateProps = PropsWithChildren<{
  fallback?: React.ReactNode;
  feature: PremiumFeature;
}>;

export function FeatureGate({ children, fallback, feature }: FeatureGateProps) {
  const { canUseFeature } = usePremium();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}

export function PremiumBadge({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.accent,
          borderRadius: theme.radii.sm,
          paddingHorizontal: compact ? theme.spacing[8] : theme.spacing[12],
          paddingVertical: theme.spacing[4],
        },
        label: {
          color: '#FFFFFF',
          fontFamily: theme.fonts.gb,
          fontSize: compact ? 11 : 12,
          letterSpacing: 0,
        },
      }),
    [compact, theme],
  );

  if (!areAdsEnabled) {
    return null;
  }

  return (
    <View accessibilityLabel="Rewarded feature" style={styles.badge}>
      <Text style={styles.label}>AD</Text>
    </View>
  );
}

export function getFeaturesForTier(tier: PremiumTier) {
  return Object.values(premiumFeatureCatalog).filter(
    feature => feature.tier === tier,
  );
}
