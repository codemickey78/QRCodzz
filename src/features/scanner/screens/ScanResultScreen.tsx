import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Linking, Pressable, Share, StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  Bookmark02Icon,
  Copy01Icon,
  Globe02Icon,
  PackageIcon,
  Search01Icon,
  Share08Icon,
} from '@hugeicons/core-free-icons';

import {ScanStackParamList} from '../../../app/navigation/navigationTypes';
import {AdBanner} from '../../../components/ads/AdBanner';
import {EmptyState} from '../../../components/feedback/EmptyState';
import {useAppToast} from '../../../components/feedback/AppToast';
import {LoadingState} from '../../../components/feedback/LoadingState';
import {AppScreen} from '../../../components/layout/AppScreen';
import {SecondaryButton} from '../../../components/ui/Button';
import {Card} from '../../../components/ui/Card';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {
  ParsedScanAction,
  UrlSafetyCheck,
} from '../../../services/scanner/ScanResultParser';
import {scannerService} from '../../../services/scanner/scannerService';
import {openInAppBrowser} from '../../../services/browser/openInAppBrowser';
import {useTheme} from '../../../theme/useTheme';

type ScanResultNavigation = NativeStackNavigationProp<
  ScanStackParamList,
  'ScanResult'
>;
type ScanResultRoute = RouteProp<ScanStackParamList, 'ScanResult'>;

type LoadedResult = Awaited<ReturnType<typeof scannerService.getScanResult>>;

export function ScanResultScreen() {
  const navigation = useNavigation<ScanResultNavigation>();
  const route = useRoute<ScanResultRoute>();
  const {theme} = useTheme();
  const showToast = useAppToast();
  const [result, setResult] = useState<LoadedResult>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    scannerService
      .getScanResult(route.params.codeId)
      .then(nextResult => {
        if (isMounted) {
          setResult(nextResult);
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
        heroCard: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing.xs,
          padding: theme.spacing.lg,
        },
        heroValue: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 22,
          lineHeight: 28,
        },
        summary: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 15,
          lineHeight: 22,
        },
        metadataRow: {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing[4],
          paddingVertical: theme.spacing[12],
        },
        metadataKey: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gb,
          fontSize: 12,
          textTransform: 'uppercase',
        },
        metadataValue: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gr,
          fontSize: 15,
          lineHeight: 21,
        },
        checks: {
          gap: theme.spacing[8],
        },
        check: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        checkWarning: {
          color: theme.colors.danger,
        },
        actionGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        },
        actionCard: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing.sm,
          minHeight: 98,
          padding: theme.spacing.md,
          width: '47%',
        },
        actionIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 16,
          height: 36,
          justifyContent: 'center',
          width: 36,
        },
        actionTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 13,
          lineHeight: 17,
        },
      }),
    [theme],
  );

  const runAction = useCallback(async (action: ParsedScanAction) => {
    const value = action.value ?? result?.code.content ?? '';

    switch (action.kind) {
      case 'openWebsite':
      case 'openMaps':
      case 'directions':
      case 'composeEmail':
      case 'call':
      case 'sms':
      case 'whatsapp':
      case 'search':
      case 'searchWeb':
      case 'searchProduct':
      case 'openApp':
        await openAction(action.kind, value, showToast);
        return;
      case 'share':
        await Share.share({message: value});
        return;
      case 'copy':
      case 'copyCoordinates':
      case 'copyPassword':
      case 'copySsid':
        showToast('Copy', 'Clipboard support needs the Clipboard package to be installed.');
        return;
      case 'save':
        showToast('Saved', 'This scan is already saved in your Library.');
        return;
      case 'connectWifi':
        showToast('Wi-Fi', 'Connect where supported by the operating system.');
        return;
      case 'addCalendar':
      case 'addContact':
        showToast(action.label, 'This action will be connected to native services in a later phase.');
        return;
      default:
        showToast(action.label, value);
    }
  }, [result?.code.content, showToast]);

  if (isLoading) {
    return (
      <AppScreen topSafeArea>
        <LoadingState />
      </AppScreen>
    );
  }

  if (!result) {
    return (
      <AppScreen topSafeArea>
        <EmptyState
          message="The scanned item could not be found in the local library."
          title="Scan not found"
        />
        <SecondaryButton
          accessibilityLabel="Go back to scanner"
          onPress={() => navigation.goBack()}>
          Back
        </SecondaryButton>
      </AppScreen>
    );
  }

  const parsed = result.parsedResult;
  const primaryAction = parsed.actions[0];
  const secondaryActions = parsed.actions.slice(1);

  return (
    <AppScreen>
      <View style={styles.stack}>
        <View style={styles.heroCard}>
          <Text selectable style={styles.heroValue}>
            {parsed.displayValue}
          </Text>
          {parsed.summary ? (
            <Text style={styles.summary}>{parsed.summary}</Text>
          ) : null}
        </View>

        <AdBanner />

        {parsed.urlSafetyChecks ? (
          <>
            <SectionHeader title="Link checks" />
            <Card style={styles.checks}>
              {parsed.urlSafetyChecks.map(check => (
                <SafetyCheckRow key={check.key} check={check} />
              ))}
            </Card>
          </>
        ) : null}

        <SectionHeader title="Details" />
        <Card>
          {Object.entries(parsed.metadata).map(([key, value]) =>
            value ? (
              <View key={key} style={styles.metadataRow}>
                <Text style={styles.metadataKey}>{formatMetadataKey(key)}</Text>
                <Text selectable style={styles.metadataValue}>
                  {String(value)}
                </Text>
              </View>
            ) : null,
          )}
        </Card>

        <SectionHeader title="Actions" />
        <View style={styles.actionGrid}>
          {[primaryAction, ...secondaryActions].filter(Boolean).map(action => (
            <ActionCard
              action={action as ParsedScanAction}
              key={`${action?.kind}-${action?.label}`}
              onPress={() => runAction(action as ParsedScanAction)}
              styles={styles}
            />
          ))}
        </View>
      </View>
    </AppScreen>
  );
}

function ActionCard({
  action,
  onPress,
  styles,
}: {
  action: ParsedScanAction;
  onPress: () => void;
  styles: Record<string, object>;
}) {
  const {theme} = useTheme();
  return (
    <Pressable
      accessibilityLabel={action.label}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.actionCard,
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}>
      <View style={styles.actionIcon}>
        <HugeiconsIcon
          color={theme.colors.primary}
          icon={iconForAction(action.kind)}
          size={20}
          strokeWidth={2.2}
        />
      </View>
      <Text style={styles.actionTitle}>{action.label}</Text>
    </Pressable>
  );
}

function iconForAction(kind: ParsedScanAction['kind']): IconSvgElement {
  switch (kind) {
    case 'searchProduct':
      return PackageIcon;
    case 'search':
    case 'searchWeb':
      return Search01Icon;
    case 'openWebsite':
    case 'openMaps':
    case 'directions':
    case 'openApp':
      return Globe02Icon;
    case 'copy':
    case 'copyCoordinates':
    case 'copyPassword':
    case 'copySsid':
      return Copy01Icon;
    case 'share':
      return Share08Icon;
    default:
      return Bookmark02Icon;
  }
}

function SafetyCheckRow({check}: {check: UrlSafetyCheck}) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        check: {
          color:
            check.level === 'warning'
              ? theme.colors.danger
              : theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
      }),
    [check.level, theme],
  );

  return <Text style={styles.check}>{check.message}</Text>;
}

function formatMetadataKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, value => value.toUpperCase());
}

async function openAction(
  kind: ParsedScanAction['kind'],
  value: string,
  showToast: (title: string, message?: string) => void,
) {
  const encodedValue = encodeURIComponent(value);
  const urlByKind: Partial<Record<ParsedScanAction['kind'], string>> = {
    call: `tel:${value}`,
    composeEmail: `mailto:${value}`,
    directions: `https://maps.google.com/?daddr=${encodedValue}`,
    openApp: value,
    openMaps: `https://maps.google.com/?q=${encodedValue}`,
    openWebsite: value,
    search: `https://www.google.com/search?q=${encodedValue}`,
    searchProduct: `https://www.google.com/search?tbm=shop&q=${encodedValue}`,
    searchWeb: `https://www.google.com/search?q=${encodedValue}`,
    sms: `sms:${value}`,
    whatsapp: `https://wa.me/${value.replace(/\D/g, '')}`,
  };
  const url = urlByKind[kind];

  if (!url) {
    showToast('Action unavailable', value);
    return;
  }

  if (kind === 'search' || kind === 'searchWeb' || kind === 'searchProduct') {
    await openInAppBrowser(url);
    return;
  }

  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  showToast('Unable to open', url);
}
