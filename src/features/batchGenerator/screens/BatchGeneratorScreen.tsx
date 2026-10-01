import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Share, StyleSheet, Text, View } from 'react-native';

import { useAppToast } from '../../../components/feedback/AppToast';
import { databaseClient } from '../../../database/databaseClient';
import {adMobService} from '../../../services/ads/AdMobService';
import { FormField } from '../../../components/forms/FormField';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { FilterChip } from '../../../components/ui/FilterChip';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { useTheme } from '../../../theme/useTheme';
import { PremiumBadge, usePremium } from '../../premium';
import { defaultQRDesignConfig } from '../../qrStudio/qrDesignTypes';
import {
  BatchDraftRow,
  BatchInputMethod,
  BatchOutputFormat,
  BatchSequenceInput,
  BatchValidatedRow,
  batchOutputFormats,
  buildSequenceRows,
  parseBatchInput,
  summarizeBatch,
  validateBatchRows,
} from '../batchGeneratorUtils';

const inputMethods: Array<{ label: string; value: BatchInputMethod }> = [
  { label: 'Paste', value: 'paste' },
  { label: 'CSV', value: 'csv' },
  { label: 'TXT', value: 'txt' },
  { label: 'JSON', value: 'json' },
  { label: 'Sequence', value: 'sequence' },
];

export function BatchGeneratorScreen() {
  const { theme } = useTheme();
  const showToast = useAppToast();
  const {requestRewardedAccess} = usePremium();
  const [hasRewardedAccess, setHasRewardedAccess] = useState(false);
  const [method, setMethod] = useState<BatchInputMethod>('paste');
  const [format, setFormat] = useState<BatchOutputFormat>('QR');
  const [rawInput, setRawInput] = useState(
    'https://example.com\nPRODUCT-00001',
  );
  const [sequence, setSequence] = useState<BatchSequenceInput>({
    end: '100',
    padding: '5',
    prefix: 'PRODUCT-',
    start: '1',
    suffix: '',
  });
  const [rows, setRows] = useState<BatchDraftRow[]>(() =>
    parseBatchInput('paste', rawInput, 'QR'),
  );
  const [progress, setProgress] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: theme.colors.background,
          flex: 1,
        },
        content: {
          gap: theme.spacing[12],
          padding: theme.spacing[20],
        },
        stack: {
          gap: theme.spacing[12],
        },
        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        actionRow: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        actionButton: {
          flex: 1,
        },
        statGrid: {
          flexDirection: 'row',
          gap: theme.spacing[8],
        },
        stat: {
          flex: 1,
        },
        statValue: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 24,
        },
        statLabel: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gb,
          fontSize: 12,
          textTransform: 'uppercase',
        },
        rowTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 16,
        },
        rowMeta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        rowError: {
          color: theme.colors.danger,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 19,
        },
      }),
    [theme],
  );

  const validatedRows = useMemo(
    () => validateBatchRows(rows, format),
    [format, rows],
  );
  const summary = useMemo(() => summarizeBatch(validatedRows), [validatedRows]);

  const loadRows = useCallback(() => {
    const nextRows =
      method === 'sequence'
        ? buildSequenceRows(sequence, format)
        : parseBatchInput(method, rawInput, format);

    setRows(nextRows);
    setProgress(`${nextRows.length} rows loaded`);
  }, [format, method, rawInput, sequence]);

  const updateRow = useCallback((index: number, value: string) => {
    setRows(current =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, value } : row,
      ),
    );
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows(current => current.filter((_, rowIndex) => rowIndex !== index));
  }, []);

  const removeInvalid = useCallback(() => {
    setRows(current =>
      validateBatchRows(current, format)
        .filter(row => row.valid)
        .map(row => ({ format: row.format, value: row.encodedContent })),
    );
  }, [format]);

  const saveValidRows = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const validRows = validatedRows.filter(row => row.valid);

    if (!validRows.length) {
      showToast('No valid rows', 'Fix or remove invalid rows before saving.');
      return;
    }

    setIsSaving(true);
    try {
      setProgress(`Saving 0 / ${validRows.length}`);
      await saveRowsInChunks(validRows, progressValue => {
        setProgress(`Saving ${progressValue} / ${validRows.length}`);
      });
      setProgress(`Saved ${validRows.length} items to Library`);
      void adMobService.showInterstitial();
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, showToast, validatedRows]);

  const shareManifest = useCallback(async () => {
    const validRows = validatedRows.filter(row => row.valid);
    const manifest = validRows
      .map(row => `${row.filename},${row.format},${row.encodedContent}`)
      .join('\n');

    await Share.share({
      message: `Batch export manifest\nfilename,format,value\n${manifest}`,
    });
  }, [validatedRows]);

  const unlockBatch = useCallback(async () => {
    if (isUnlocking) {
      return;
    }

    setIsUnlocking(true);
    try {
      const result = await requestRewardedAccess('batchGeneration');
      if (result.status === 'earned') {
        setHasRewardedAccess(true);
        return;
      }
      showToast(
        'Reward unavailable',
        result.message ?? 'Try again when the rewarded ad is ready.',
      );
    } finally {
      setIsUnlocking(false);
    }
  }, [isUnlocking, requestRewardedAccess, showToast]);

  if (!hasRewardedAccess) {
    return <RewardedBatchGate disabled={isUnlocking} onUnlock={unlockBatch} />;
  }

  return (
      <View style={styles.root}>
        <FlatList
        contentContainerStyle={styles.content}
        data={validatedRows}
        keyExtractor={item => `${item.index}-${item.filename}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.stack}>
            <SectionHeader title="Input Method" />
            <Card style={styles.stack}>
              <View style={styles.row}>
                {inputMethods.map(item => (
                  <FilterChip
                    key={item.value}
                    label={item.label}
                    onPress={() => setMethod(item.value)}
                    selected={method === item.value}
                  />
                ))}
              </View>
              <Text style={styles.rowMeta}>
                CSV rows use value, format. JSON accepts an array or an object
                with an items array.
              </Text>
            </Card>

            <SectionHeader title="Output" />
            <Card style={styles.stack}>
              <View style={styles.row}>
                {batchOutputFormats.map(nextFormat => (
                  <FilterChip
                    key={nextFormat}
                    label={nextFormat}
                    onPress={() => setFormat(nextFormat)}
                    selected={format === nextFormat}
                  />
                ))}
              </View>
            </Card>

            <SectionHeader title="Source" />
            <Card style={styles.stack}>
              {method === 'sequence' ? (
                <>
                  <FormField
                    accessibilityLabel="Sequence prefix"
                    label="Prefix"
                    onChangeText={value =>
                      setSequence(current => ({ ...current, prefix: value }))
                    }
                    value={sequence.prefix}
                  />
                  <View style={styles.actionRow}>
                    <FormField
                      accessibilityLabel="Sequence start"
                      keyboardType="numeric"
                      label="Start"
                      onChangeText={value =>
                        setSequence(current => ({ ...current, start: value }))
                      }
                      style={styles.actionButton}
                      value={sequence.start}
                    />
                    <FormField
                      accessibilityLabel="Sequence end"
                      keyboardType="numeric"
                      label="End"
                      onChangeText={value =>
                        setSequence(current => ({ ...current, end: value }))
                      }
                      style={styles.actionButton}
                      value={sequence.end}
                    />
                  </View>
                  <View style={styles.actionRow}>
                    <FormField
                      accessibilityLabel="Sequence padding"
                      keyboardType="numeric"
                      label="Padding"
                      onChangeText={value =>
                        setSequence(current => ({ ...current, padding: value }))
                      }
                      style={styles.actionButton}
                      value={sequence.padding}
                    />
                    <FormField
                      accessibilityLabel="Sequence suffix"
                      label="Suffix"
                      onChangeText={value =>
                        setSequence(current => ({ ...current, suffix: value }))
                      }
                      style={styles.actionButton}
                      value={sequence.suffix}
                    />
                  </View>
                </>
              ) : (
                <FormField
                  accessibilityLabel="Batch source values"
                  label="Values"
                  multiline
                  onChangeText={setRawInput}
                  placeholder="Paste values, CSV, TXT, or JSON"
                  textAlignVertical="top"
                  value={rawInput}
                />
              )}
              <PrimaryButton
                accessibilityLabel="Validate batch rows"
                onPress={loadRows}
              >
                Validate Batch
              </PrimaryButton>
            </Card>

            <SectionHeader title="Batch Styling" />
            <Card style={styles.stack}>
              <Text style={styles.rowMeta}>
                QR batches use the default scan-safe Studio design. Barcode
                batches use dark foreground on a solid light background.
              </Text>
            </Card>

            <SectionHeader title="Validation" />
            <View style={styles.statGrid}>
              <StatCard label="Total" value={summary.total} />
              <StatCard label="Valid" value={summary.valid} />
              <StatCard label="Invalid" value={summary.invalid} />
            </View>
            {progress ? <Text style={styles.rowMeta}>{progress}</Text> : null}

            <View style={styles.actionRow}>
              <SecondaryButton
                accessibilityLabel="Remove invalid batch rows"
                onPress={removeInvalid}
                style={styles.actionButton}
              >
                Remove Invalid
              </SecondaryButton>
              <SecondaryButton
                accessibilityLabel="Generate valid batch rows only"
                disabled={isSaving}
                onPress={saveValidRows}
                style={styles.actionButton}
              >
                Generate Valid
              </SecondaryButton>
            </View>
            <View style={styles.actionRow}>
              <PrimaryButton
                accessibilityLabel="Save all valid batch rows"
                disabled={isSaving}
                onPress={saveValidRows}
                style={styles.actionButton}
              >
                Save All
              </PrimaryButton>
              <SecondaryButton
                accessibilityLabel="Share batch ZIP manifest"
                onPress={shareManifest}
                style={styles.actionButton}
              >
                Share ZIP
              </SecondaryButton>
            </View>

            <SectionHeader title="Preview" />
          </View>
        }
        ListEmptyComponent={
          <Card>
            <Text style={styles.rowMeta}>
              Load rows from pasted values, imports, or a sequence to preview
              the batch.
            </Text>
          </Card>
        }
        renderItem={({ item, index }) => (
          <BatchRowCard
            item={item}
            onChange={value => updateRow(index, value)}
            onRemove={() => removeRow(index)}
          />
        )}
        ItemSeparatorComponent={Separator}
        />
      </View>
  );
}

function RewardedBatchGate({
  disabled,
  onUnlock,
}: {
  disabled?: boolean;
  onUnlock: () => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: theme.colors.background,
          flex: 1,
          padding: theme.spacing[20],
        },
        stack: {
          gap: theme.spacing[16],
        },
        card: {
          gap: theme.spacing[12],
        },
        title: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 20,
          lineHeight: 26,
        },
        body: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        unlock: {
          marginTop: theme.spacing[4],
        },
      }),
    [theme],
  );

  return (
    <View style={styles.root}>
      <View style={styles.stack}>
        <Card style={styles.card}>
          <PremiumBadge />
          <Text style={styles.title}>Unlock batch generation</Text>
          <Text style={styles.body}>
            Generate many QR codes or barcodes from pasted data, CSV, TXT, JSON,
            or sequences after a rewarded ad.
          </Text>
          <PrimaryButton
            accessibilityLabel="Watch rewarded ad to unlock batch generation"
            disabled={disabled}
            onPress={onUnlock}
            style={styles.unlock}>
            Watch ad to continue
          </PrimaryButton>
        </Card>
      </View>
    </View>
  );
}

function BatchRowCard({
  item,
  onChange,
  onRemove,
}: {
  item: BatchValidatedRow;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          gap: theme.spacing[12],
        },
        title: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 16,
        },
        meta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        error: {
          color: theme.colors.danger,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 19,
        },
      }),
    [theme],
  );

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>
        {item.index}. {item.value || 'Empty row'}
      </Text>
      <Text style={styles.meta}>
        {item.format} / {item.valid ? 'Valid' : 'Invalid'} / {item.filename}
      </Text>
      {item.message ? (
        <Text style={item.valid ? styles.meta : styles.error}>
          {item.message}
        </Text>
      ) : null}
      <FormField
        accessibilityLabel={`Edit batch row ${item.index}`}
        label="Value"
        onChangeText={onChange}
        value={item.value}
      />
      <SecondaryButton
        accessibilityLabel={`Remove batch row ${item.index}`}
        onPress={onRemove}
      >
        Remove row
      </SecondaryButton>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
        },
        value: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 24,
        },
        label: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gb,
          fontSize: 12,
          textTransform: 'uppercase',
        },
      }),
    [theme],
  );

  return (
    <Card style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

function Separator() {
  return <View style={separatorStyles.separator} />;
}

const separatorStyles = StyleSheet.create({
  separator: {
    height: 12,
  },
});

async function saveRowsInChunks(
  rows: BatchValidatedRow[],
  onProgress: (savedCount: number) => void,
) {
  let saved = 0;

  for (let index = 0; index < rows.length; index += 25) {
    const chunk = rows.slice(index, index + 25);
    await Promise.all(
      chunk.map(row =>
        databaseClient.repositories.codes.create({
          content: row.encodedContent,
          designConfig: row.format === 'QR' ? defaultQRDesignConfig : undefined,
          format: row.format === 'QR' ? 'qr-code' : row.format,
          isFavorite: false,
          metadata: {
            batchFilename: row.filename,
            batchIndex: row.index,
            generatorMode: 'batch',
          },
          source: 'generated',
          title: row.value,
          type: row.format === 'QR' ? 'qr' : 'barcode',
        }),
      ),
    );
    saved += chunk.length;
    onProgress(saved);
    await waitForNextTick();
  }
}

function waitForNextTick() {
  return new Promise<void>(resolve => setTimeout(resolve, 0));
}
