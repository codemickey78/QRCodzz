import {
  getFeaturesForTier,
  premiumFeatureCatalog,
  premiumProductStructure,
} from '../src/features/premium';
import {
  PremiumProductId,
  UnavailablePurchaseService,
} from '../src/services/purchase/PurchaseService';

describe('rewarded access architecture', () => {
  test('keeps core scanner and creation features free', () => {
    expect(premiumFeatureCatalog.qrScanning.tier).toBe('free');
    expect(premiumFeatureCatalog.imageScanning.tier).toBe('free');
    expect(premiumFeatureCatalog.standardQRGeneration.tier).toBe('free');
    expect(premiumFeatureCatalog.basicBarcodeGeneration.tier).toBe('free');
    expect(premiumFeatureCatalog.history.tier).toBe('free');
    expect(premiumFeatureCatalog.favorites.tier).toBe('free');
    expect(premiumFeatureCatalog.pngExport.tier).toBe('free');
  });

  test('keeps advanced workspace tools free with rewarded ads', () => {
    expect(premiumFeatureCatalog.advancedQRStudio.tier).toBe('free');
    expect(premiumFeatureCatalog.batchGeneration.tier).toBe('free');
    expect(premiumFeatureCatalog.svgExport.tier).toBe('free');
    expect(premiumFeatureCatalog.pdfExport.tier).toBe('free');
    expect(premiumFeatureCatalog.backup.tier).toBe('free');
    expect(premiumFeatureCatalog.advancedQRStudio.adRequired).toBe(true);
    expect(premiumFeatureCatalog.batchGeneration.adRequired).toBe(true);
    expect(getFeaturesForTier('free')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ feature: 'batchGeneration' }),
        expect.objectContaining({ feature: 'printSheets' }),
      ]),
    );
  });

  test('supports monthly, annual, and lifetime product structure', () => {
    expect(premiumProductStructure.map(product => product.kind)).toEqual([
      'monthly',
      'annual',
      'lifetime',
    ]);
  });

  test('does not fake purchases when no provider is connected', async () => {
    const service = new UnavailablePurchaseService();
    const productId: PremiumProductId = 'premium-monthly';

    await expect(service.getProducts()).resolves.toEqual([]);
    await expect(service.hasProAccess()).resolves.toBe(false);
    await expect(service.purchase(productId)).resolves.toMatchObject({
      status: 'unavailable',
    });
    await expect(service.restore()).resolves.toMatchObject({
      status: 'unavailable',
    });
  });
});
