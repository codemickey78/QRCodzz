import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Share, StyleSheet, Text, View } from 'react-native';

import { CreateStackParamList } from '../../../app/navigation/navigationTypes';
import { databaseClient } from '../../../database/databaseClient';
import { CodeItem } from '../../../database/entities/CodeItem';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AppScreen } from '../../../components/layout/AppScreen';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import {createCodePngDataUri, saveCodePngForExport} from '../../export';
import { QRDesignPreview } from '../../qrStudio/components/QRDesignPreview';
import { parseQRDesignConfig } from '../../qrStudio/qrDesignValidation';
import {SharingService} from '../../../services/sharing/SharingService';
import {analyticsService} from '../../../services/analytics/PrivacySafeAnalyticsService';
import {useAppToast} from '../../../components/feedback/AppToast';
import { useTheme } from '../../../theme/useTheme';
import {usePremium} from '../../premium';

type PreviewNavigation = NativeStackNavigationProp<
  CreateStackParamList,
  'QRPreview'
>;
type PreviewRoute = RouteProp<CreateStackParamList, 'QRPreview'>;

export function QRPreviewScreen() {
  const navigation = useNavigation<PreviewNavigation>();
  const route = useRoute<PreviewRoute>();
  const { theme } = useTheme();
  const showToast = useAppToast();
  const {requestRewardedAccess} = usePremium();
  const [code, setCode] = useState<CodeItem | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    databaseClient.repositories.codes
      .getById(route.params.codeId)
      .then(nextCode => {
        if (isMounted) {
          setCode(nextCode);
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
  }, [route.params.codeId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        previewFrame: {
          alignItems: 'center',
          aspectRatio: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radii.md,
          justifyContent: 'center',
          padding: theme.spacing[16],
        },
        payload: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        actionRow: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        actionButton: {
          flex: 1,
        },
      }),
    [theme],
  );

  const exportPng = useCallback(async () => {
    if (!code || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const access = await requestRewardedAccess('export');
      if (access.status !== 'earned') {
        showToast(
          'Reward required',
          access.message ?? 'Watch a rewarded ad to export this QR code.',
        );
        return;
      }

      const image = await createCodePngDataUri(code, {
        backgroundTransparent: Boolean(code.designConfig?.backgroundTransparent),
        format: 'png',
        resolution: 1024,
      });
      const exportFile = await saveCodePngForExport(image);
      await SharingService.shareFile(exportFile.filePath, image.filename);
      void analyticsService.track('qr_exported', {
        format: code.format,
        type: code.type,
      });
      showToast(
        'PNG ready',
        exportFile.savedToGallery
          ? `${image.filename} was saved to Photos and opened for sharing.`
          : `${image.filename} was generated for sharing.`,
      );
    } catch (error) {
      showToast(
        'Export failed',
        error instanceof Error
          ? error.message
          : 'The QR image could not be exported. Try again.',
      );
    } finally {
      setIsExporting(false);
    }
  }, [code, isExporting, requestRewardedAccess, showToast]);

  if (isLoading) {
    return (
      <AppScreen>
        <LoadingState />
      </AppScreen>
    );
  }

  if (!code) {
    return (
      <AppScreen>
        <EmptyState
          message="The generated QR code could not be found in the local library."
          title="QR not found"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.stack}>
        <Card>
          <View style={styles.previewFrame}>
            <QRDesignPreview
              config={parseQRDesignConfig(code.designConfig)}
              content={code.content}
            />
          </View>
        </Card>

        <SectionHeader title="Payload" />
        <Card>
          <Text numberOfLines={8} selectable style={styles.payload}>
            {code.content}
          </Text>
        </Card>

        <PrimaryButton
          accessibilityLabel="Open QR Studio"
          onPress={() => navigation.navigate('QRStudio', { codeId: code.id })}
        >
          Open QR Studio
        </PrimaryButton>
        <View style={styles.actionRow}>
          <SecondaryButton
            accessibilityLabel="Share generated QR payload"
            onPress={() => Share.share({ message: code.content })}
            style={styles.actionButton}
          >
            Share
          </SecondaryButton>
          <SecondaryButton
            accessibilityLabel="Export generated QR as PNG"
            disabled={isExporting}
            onPress={exportPng}
            style={styles.actionButton}
          >
            PNG
          </SecondaryButton>
          <SecondaryButton
            accessibilityLabel="Go back to generator"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Edit
          </SecondaryButton>
        </View>
      </View>
    </AppScreen>
  );
}
