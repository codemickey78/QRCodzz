import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { databaseClient } from '../../../database/databaseClient';
import {
  createBackup,
  createBackupFileName,
  createPrintSheetManifest,
  mergeBackupIntoSnapshot,
  serializeBackup,
  validateBackupJson,
} from '../../export';
import { FormField } from '../../../components/forms/FormField';
import { useAppToast } from '../../../components/feedback/AppToast';
import { AppScreen } from '../../../components/layout/AppScreen';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { SharingService } from '../../../services/sharing/SharingService';
import { useTheme } from '../../../theme/useTheme';

export function DataManagementScreen() {
  const { theme } = useTheme();
  const showToast = useAppToast();
  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        card: {
          gap: theme.spacing[12],
        },
        body: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 14,
          lineHeight: 20,
        },
        status: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
          lineHeight: 20,
        },
        row: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        button: {
          flex: 1,
        },
      }),
    [theme],
  );

  const exportBackup = useCallback(async () => {
    const snapshot = await databaseClient.database.getSnapshot();
    const backup = createBackup(snapshot);
    const filename = createBackupFileName(new Date(backup.exportedAt));
    await SharingService.shareText(filename, serializeBackup(backup));
    setStatus(`Prepared ${filename}`);
  }, []);

  const validateImport = useCallback(() => {
    const result = validateBackupJson(importJson);

    if (!result.valid) {
      setStatus(result.errors.join('\n'));
      return undefined;
    }

    setStatus(
      `Backup is valid: ${result.backup.codes.length} codes, ${result.backup.folders.length} folders.`,
    );
    return result.backup;
  }, [importJson]);

  const importBackup = useCallback(async () => {
    const backup = validateImport();

    if (!backup) {
      return;
    }

    const result = await databaseClient.database.updateSnapshot(snapshot => {
      const merge = mergeBackupIntoSnapshot(snapshot, backup);
      setStatus(
        `Imported ${merge.importedCodes} codes, ${merge.importedFolders} folders. Skipped ${merge.duplicateIds.length} duplicate IDs.`,
      );
      return merge.snapshot;
    });

    if (!result) {
      showToast('Import failed', 'Unable to update local database.');
    }
  }, [showToast, validateImport]);

  const sharePrintManifest = useCallback(async () => {
    const snapshot = await databaseClient.database.getSnapshot();
    const manifest = createPrintSheetManifest(snapshot.codes, {
      barcodeSize: 180,
      columns: 2,
      margin: 24,
      paperSize: 'A4',
      qrSize: 180,
      rows: 5,
      showCodeValue: true,
      showTitle: true,
    });
    await SharingService.shareText(
      manifest.fileName,
      JSON.stringify(manifest, null, 2),
    );
    setStatus(`Prepared ${manifest.fileName}`);
  }, []);

  return (
    <AppScreen>
      <View style={styles.stack}>
        <SectionHeader title="Backup" />
        <Card style={styles.card}>
          <Text style={styles.body}>
            Backup includes codes, folders, favorites, settings, templates, and
            QR design configs. Runtime caches are omitted.
          </Text>
          <PrimaryButton
            accessibilityLabel="Export application backup"
            onPress={exportBackup}
          >
            Export Backup JSON
          </PrimaryButton>
        </Card>

        <SectionHeader title="Import" />
        <Card style={styles.card}>
          <FormField
            accessibilityLabel="Import backup JSON"
            label="Backup JSON"
            multiline
            onChangeText={setImportJson}
            placeholder="Paste backup JSON"
            textAlignVertical="top"
            value={importJson}
          />
          <View style={styles.row}>
            <SecondaryButton
              accessibilityLabel="Validate backup import"
              onPress={validateImport}
              style={styles.button}
            >
              Validate
            </SecondaryButton>
            <PrimaryButton
              accessibilityLabel="Import valid backup"
              onPress={importBackup}
              style={styles.button}
            >
              Import
            </PrimaryButton>
          </View>
        </Card>

        <SectionHeader title="Print Sheets" />
        <Card style={styles.card}>
          <Text style={styles.body}>
            A4 print manifests reserve QR quiet zones and include label layout
            settings for the future PDF renderer.
          </Text>
          <SecondaryButton
            accessibilityLabel="Prepare print sheet PDF manifest"
            onPress={sharePrintManifest}
          >
            Prepare A4 Sheet
          </SecondaryButton>
        </Card>

        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </AppScreen>
  );
}
