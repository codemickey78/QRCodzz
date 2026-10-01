import {useCallback, useEffect, useState} from 'react';

import {
  AppSettings,
  defaultAppSettings,
} from '../database/entities/AppSettings';
import {settingsService} from '../services/settings/settingsService';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    settingsService
      .getSettings()
      .then(nextSettings => {
        if (isMounted) {
          setSettings(nextSettings);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateAppearanceSettings = useCallback(
    async (input: Partial<AppSettings['appearance']>) => {
      const nextSettings = await settingsService.updateAppearanceSettings(input);
      setSettings(nextSettings);
      return nextSettings;
    },
    [],
  );

  const updateScannerSettings = useCallback(
    async (input: Partial<AppSettings['scanner']>) => {
      const nextSettings = await settingsService.updateScannerSettings(input);
      setSettings(nextSettings);
      return nextSettings;
    },
    [],
  );

  return {
    isLoading,
    settings,
    updateAppearanceSettings,
    updateScannerSettings,
  };
}
