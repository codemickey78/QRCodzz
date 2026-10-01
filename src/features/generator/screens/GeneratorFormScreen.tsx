import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInputProps,
  View,
} from 'react-native';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  BrushIcon,
  Calendar03Icon,
  Clock01Icon,
  FloppyDiskIcon,
  Share08Icon,
} from '@hugeicons/core-free-icons';

import { CreateStackParamList } from '../../../app/navigation/navigationTypes';
import {AdBanner} from '../../../components/ads/AdBanner';
import { useAppToast } from '../../../components/feedback/AppToast';
import { databaseClient } from '../../../database/databaseClient';
import { barcodeGeneratorDefinitions } from '../../barcodeGenerator/barcode/barcodeGeneratorDefinitions';
import { FormField } from '../../../components/forms/FormField';
import {SearchInput} from '../../../components/forms/SearchInput';
import { AppScreen } from '../../../components/layout/AppScreen';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import { FilterChip } from '../../../components/ui/FilterChip';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import {analyticsService} from '../../../services/analytics/PrivacySafeAnalyticsService';
import {
  getQRGeneratorDefinition,
  qrGeneratorDefinitions,
} from '../qr/qrGeneratorDefinitions';
import {
  AnyQRGeneratorDefinition,
  QRGeneratorField,
  QRGeneratorId,
} from '../qr/qrGeneratorTypes';
import { useTheme } from '../../../theme/useTheme';
import { permissionExplanations } from '../../security';
import {usePremium} from '../../premium';

type GeneratorNavigation = NativeStackNavigationProp<
  CreateStackParamList,
  'GeneratorForm'
>;
type GeneratorRoute = RouteProp<CreateStackParamList, 'GeneratorForm'>;

export function GeneratorFormScreen() {
  const navigation = useNavigation<GeneratorNavigation>();
  const route = useRoute<GeneratorRoute>();
  const { theme } = useTheme();
  const showToast = useAppToast();
  const {requestRewardedAccess} = usePremium();
  const mode = route.params?.mode ?? 'qr';
  const generatorDefinitions =
    mode === 'barcode' ? barcodeGeneratorDefinitions : qrGeneratorDefinitions;
  const initialGeneratorId = (route.params?.generatorId ??
    generatorDefinitions[0].id) as QRGeneratorId;
  const initialDefinition =
    mode === 'barcode'
      ? generatorDefinitions.find(
          nextDefinition => nextDefinition.id === initialGeneratorId,
        ) ?? generatorDefinitions[0]
      : getQRGeneratorDefinition(initialGeneratorId) ?? generatorDefinitions[0];
  const [definition] = useState<AnyQRGeneratorDefinition>(initialDefinition);
  const [payload, setPayload] = useState<Record<string, unknown>>(
    createInitialPayload(definition, route.params?.initialPayload),
  );
  const [savedCodeId, setSavedCodeId] = useState<string | undefined>();
  const [editedFields, setEditedFields] = useState<Set<string>>(() => new Set());
  const [blurredFields, setBlurredFields] = useState<Set<string>>(() => new Set());
  const [pickerField, setPickerField] = useState<QRGeneratorField | undefined>();
  const [busyAction, setBusyAction] = useState<'generate' | 'studio'>();

  const encodedContent = definition.encode(payload);
  const validationErrors = definition.validate(payload);
  const showInlineErrors = definition.fields.some(
    field => editedFields.has(field.id) && blurredFields.has(field.id),
  );
  const helperText = definition.helperText?.(payload);
  const canGenerate = validationErrors.length === 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        typeRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        formCard: {
          gap: theme.spacing[12],
        },
        switchRow: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: 48,
        },
        label: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
        },
        previewValue: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gr,
          fontSize: 15,
          lineHeight: 21,
        },
        encodedValue: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 12,
          lineHeight: 18,
          marginTop: theme.spacing[8],
        },
        error: {
          color: theme.colors.danger,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 19,
        },
        info: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        actionGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[12],
        },
        actionButton: {
          alignItems: 'center',
          borderRadius: theme.radii.xl,
          flexDirection: 'row',
          gap: theme.spacing[8],
          justifyContent: 'center',
          minHeight: 58,
          paddingHorizontal: theme.spacing[16],
          paddingVertical: theme.spacing[12],
        },
        actionWide: {
          width: '100%',
        },
        actionHalf: {
          flex: 1,
          minWidth: '46%',
        },
        actionLabel: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
      }),
    [theme],
  );

  const updatePayload = useCallback((key: string, value: unknown) => {
    setPayload(current => ({ ...current, [key]: value }));
    setEditedFields(current => new Set(current).add(key));
    setSavedCodeId(undefined);
  }, []);

  const markBlurred = useCallback((key: string) => {
    setBlurredFields(current => new Set(current).add(key));
  }, []);

  const saveGeneratedCode = useCallback(async () => {
    if (!canGenerate) {
      showToast('Check the form', validationErrors[0]);
      return undefined;
    }

    const code = await databaseClient.repositories.codes.create({
      content: encodedContent,
      format: mode === 'barcode' ? definition.label : 'qr-code',
      isFavorite: false,
      metadata: {
        generatorId: definition.id,
        generatorMode: mode,
        payload,
      },
      source: 'generated',
      title: definition.preview(payload) || definition.label,
      type: mode,
    });

    void analyticsService.track(mode === 'barcode' ? 'barcode_created' : 'qr_created', {
      format: mode === 'barcode' ? definition.label : 'qr-code',
      generatorId: definition.id,
      mode,
    });

    setSavedCodeId(code.id);
    return code.id;
  }, [
    canGenerate,
    definition,
    encodedContent,
    mode,
    payload,
    showToast,
    validationErrors,
  ]);

  const saveAndPreview = useCallback(async () => {
    if (busyAction) {
      return;
    }

    setBusyAction('generate');
    try {
      const access = await requestRewardedAccess('generation');
      if (access.status !== 'earned') {
        showToast(
          'Reward required',
          access.message ?? 'Watch a rewarded ad to generate this code.',
        );
        return;
      }

      const codeId = savedCodeId ?? (await saveGeneratedCode());

      if (codeId) {
        navigation.navigate(mode === 'barcode' ? 'BarcodePreview' : 'QRPreview', {
          codeId,
        });
      }
    } catch (error) {
      showToast(
        'Preview unavailable',
        error instanceof Error
          ? error.message
          : 'The generated code could not be saved for preview.',
      );
    } finally {
      setBusyAction(undefined);
    }
  }, [busyAction, mode, navigation, requestRewardedAccess, saveGeneratedCode, savedCodeId, showToast]);

  const shareGeneratedCode = useCallback(async () => {
    if (!canGenerate) {
      showToast('Check the form', validationErrors[0]);
      return;
    }

    await Share.share({ message: encodedContent });
  }, [canGenerate, encodedContent, showToast, validationErrors]);

  const openStudio = useCallback(async () => {
    if (busyAction) {
      return;
    }

    setBusyAction('studio');
    try {
      const codeId = savedCodeId ?? (await saveGeneratedCode());

      if (codeId) {
        navigation.navigate('QRStudio', { codeId });
      }
    } finally {
      setBusyAction(undefined);
    }
  }, [busyAction, navigation, saveGeneratedCode, savedCodeId]);

  return (
    <AppScreen>
      <View style={styles.stack}>
        <SectionHeader title="Details" />
        <Card style={styles.formCard}>
          {definition.id === 'contact' ? (
            <SecondaryButton
              accessibilityLabel="Import from contacts"
              onPress={() =>
                showToast(
                  'Contacts',
                  permissionExplanations.importContact,
                )
              }
            >
              Import from Contacts
            </SecondaryButton>
          ) : null}
          {definition.id === 'location' ? (
            <SecondaryButton
              accessibilityLabel="Use current location"
              onPress={() =>
                showToast(
                  'Location',
                  permissionExplanations.currentLocation,
                )
              }
            >
              Use Current Location
            </SecondaryButton>
          ) : null}
          {definition.fields.map(field => (
            <GeneratorFieldInput
              field={field}
              key={field.id}
              onBlur={() => markBlurred(field.id)}
              onChange={value => updatePayload(field.id, value)}
              onOpenPicker={() => setPickerField(field)}
              value={payload[field.id]}
            />
          ))}
          {showInlineErrors
            ? validationErrors.map(error => (
                <Text key={error} style={styles.error}>
                  {error}
                </Text>
              ))
            : null}
          {helperText ? <Text style={styles.info}>{helperText}</Text> : null}
        </Card>

        <SectionHeader title="Preview" />
        <Card>
          <Text selectable style={styles.previewValue}>
            {definition.preview(payload) || 'Complete the form to preview.'}
          </Text>
          {encodedContent ? (
            <Text numberOfLines={6} selectable style={styles.encodedValue}>
              {encodedContent}
            </Text>
          ) : null}
        </Card>

        <AdBanner />

        <View style={styles.actionGrid}>
          <GeneratorActionButton
            accessibilityLabel={`Save and preview ${mode}`}
            icon={FloppyDiskIcon}
            label="Save and Preview"
            disabled={Boolean(busyAction)}
            onPress={saveAndPreview}
            primary
            style={[styles.actionButton, styles.actionWide]}
            textStyle={styles.actionLabel}
          />
          <GeneratorActionButton
            accessibilityLabel={`Share generated ${mode} payload`}
            icon={Share08Icon}
            label="Share"
            onPress={shareGeneratedCode}
            style={[styles.actionButton, styles.actionHalf]}
            textStyle={styles.actionLabel}
          />
          {mode === 'qr' ? (
            <GeneratorActionButton
              accessibilityLabel="Open generated QR in QR Studio"
              icon={BrushIcon}
              label="QR Studio"
              disabled={Boolean(busyAction)}
              onPress={openStudio}
              style={[styles.actionButton, styles.actionHalf]}
              textStyle={styles.actionLabel}
            />
          ) : null}
        </View>
      </View>
      <DateTimePickerSheet
        field={pickerField}
        onChange={value => {
          if (!pickerField) {
            return;
          }

          updatePayload(pickerField.id, value);
          markBlurred(pickerField.id);
          if (pickerField.type === 'date' || pickerField.type === 'timezone') {
            setPickerField(undefined);
          }
        }}
        onDismiss={() => setPickerField(undefined)}
        value={pickerField ? String(payload[pickerField.id] ?? '') : ''}
      />
    </AppScreen>
  );
}

function GeneratorActionButton({
  accessibilityLabel,
  disabled,
  icon,
  label,
  onPress,
  primary = false,
  style,
  textStyle,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  primary?: boolean;
  style: object | object[];
  textStyle?: object;
}) {
  const {theme} = useTheme();
  const backgroundColor = primary ? theme.colors.primary : theme.colors.surfaceMuted;
  const foregroundColor = primary ? theme.colors.white : theme.colors.textPrimary;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        style,
        {backgroundColor},
        disabled
          ? {opacity: 0.58}
          : pressed
          ? {opacity: 0.78, transform: [{scale: 0.985}]}
          : null,
      ]}>
      <HugeiconsIcon color={foregroundColor} icon={icon} size={21} strokeWidth={2.4} />
      <Text style={[textStyle, {color: foregroundColor}]}>{label}</Text>
    </Pressable>
  );
}

function createInitialPayload(
  definition: AnyQRGeneratorDefinition,
  initialPayload?: Record<string, unknown>,
) {
  return {
    ...definition.buildInitialPayload(),
    ...(initialPayload ?? {}),
  };
}

type GeneratorFieldInputProps = {
  field: QRGeneratorField;
  onBlur: () => void;
  onChange: (value: unknown) => void;
  onOpenPicker: () => void;
  value: unknown;
};

function GeneratorFieldInput({
  field,
  onBlur,
  onChange,
  onOpenPicker,
  value,
}: GeneratorFieldInputProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        switchRow: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: 48,
        },
        label: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 14,
        },
        selectRow: {
          gap: theme.spacing[8],
        },
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        pickerButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing[8],
          minHeight: 54,
          paddingHorizontal: theme.spacing[16],
        },
        pickerCopy: {
          flex: 1,
          gap: theme.spacing[4],
        },
        pickerLabel: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 12,
          lineHeight: 16,
        },
        pickerValue: {
          color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
      }),
    [theme, value],
  );

  if (field.type === 'toggle') {
    return (
      <View style={styles.switchRow}>
        <Text style={styles.label}>{field.label}</Text>
        <Switch
          onValueChange={nextValue => {
            onChange(nextValue);
            onBlur();
          }}
          value={Boolean(value)}
        />
      </View>
    );
  }

  if (field.type === 'select') {
    return (
      <View style={styles.selectRow}>
        <Text style={styles.label}>{field.label}</Text>
        <View style={styles.chipRow}>
          {field.options?.map(option => (
            <FilterChip
              key={option}
              label={option}
              onPress={() => {
                onChange(option);
                onBlur();
              }}
              selected={value === option}
            />
          ))}
        </View>
      </View>
    );
  }

  if (field.type === 'date' || field.type === 'time' || field.type === 'timezone') {
    const icon = field.type === 'date' ? Calendar03Icon : Clock01Icon;

    return (
      <Pressable
        accessibilityLabel={field.label}
        accessibilityRole="button"
        onPress={onOpenPicker}
        style={({pressed}) => [
          styles.pickerButton,
          pressed ? {opacity: 0.78, transform: [{scale: 0.99}]} : null,
        ]}>
        <HugeiconsIcon
          color={theme.colors.textSecondary}
          icon={icon}
          size={20}
          strokeWidth={2.2}
        />
        <View style={styles.pickerCopy}>
          <Text style={styles.pickerLabel}>{field.label}</Text>
          <Text style={styles.pickerValue}>
            {String(value || field.placeholder || 'Select')}
          </Text>
        </View>
      </Pressable>
    );
  }

  const inputProps: Partial<TextInputProps> = {
    autoCapitalize:
      field.type === 'email' || field.type === 'url' ? 'none' : 'sentences',
    keyboardType:
      field.type === 'email'
        ? 'email-address'
        : field.type === 'phone'
        ? 'phone-pad'
        : field.type === 'number'
        ? 'numeric'
        : field.type === 'url'
        ? 'url'
        : 'default',
    multiline: field.multiline || field.type === 'textarea',
    textAlignVertical:
      field.multiline || field.type === 'textarea' ? 'top' : 'center',
  };

  return (
    <FormField
      accessibilityLabel={field.label}
      label={field.label}
      onBlur={onBlur}
      onChangeText={onChange}
      placeholder={field.placeholder}
      value={String(value ?? '')}
      {...inputProps}
    />
  );
}

function DateTimePickerSheet({
  field,
  onChange,
  onDismiss,
  value,
}: {
  field?: QRGeneratorField;
  onChange: (value: string) => void;
  onDismiss: () => void;
  value: string;
}) {
  const {theme} = useTheme();
  const [draftDate, setDraftDate] = useState(() => parsePickerDate(value));
  const [draftTime, setDraftTime] = useState(() => parsePickerTime(value));
  const [timezoneSearch, setTimezoneSearch] = useState('');

  useEffect(() => {
    setDraftDate(parsePickerDate(value));
    setDraftTime(parsePickerTime(value));
    setTimezoneSearch('');
  }, [field?.id, value]);

  const timezones = useMemo(() => {
    const query = timezoneSearch.trim().toLowerCase();
    const zones = getSupportedTimeZones();

    if (!query) {
      return zones;
    }

    return zones.filter(zone => zone.toLowerCase().includes(query));
  }, [timezoneSearch]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
        },
        sheetStack: {
          gap: theme.spacing[12],
          marginTop: theme.spacing[16],
        },
        helper: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        monthHeader: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        monthTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 16,
          lineHeight: 22,
        },
        navButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radii.full,
          height: 44,
          justifyContent: 'center',
          width: 44,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing[8],
        },
        dayButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          height: 40,
          justifyContent: 'center',
          width: 40,
        },
        dayButtonActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        dayButtonBlank: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        dayText: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gs,
          fontSize: 14,
        },
        dayTextActive: {
          color: theme.colors.white,
        },
        weekDayText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 12,
          lineHeight: 16,
          textAlign: 'center',
          width: 40,
        },
        timeDisplay: {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 42,
          lineHeight: 50,
          overflow: 'hidden',
          paddingVertical: theme.spacing[20],
          textAlign: 'center',
        },
        stepGrid: {
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        stepColumn: {
          flex: 1,
          gap: theme.spacing[8],
        },
        stepLabel: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 12,
          lineHeight: 16,
          textAlign: 'center',
        },
      }),
    [theme],
  );

  if (!field || (field.type !== 'date' && field.type !== 'time' && field.type !== 'timezone')) {
    return null;
  }

  if (field.type === 'timezone') {
    return (
      <BottomSheet
        onDismiss={onDismiss}
        snapPoints={['78%', '94%']}
        visible>
        <View style={styles.sheetStack}>
          <Text style={styles.title}>{field.label}</Text>
          <Text style={styles.helper}>
            Select the calendar timezone used for this event.
          </Text>
          <SearchInput
            accessibilityLabel="Search timezones"
            onChangeText={setTimezoneSearch}
            placeholder="Search timezones"
            value={timezoneSearch}
          />
          <View style={styles.grid}>
            {timezones.map(zone => (
              <FilterChip
                key={zone}
                label={zone}
                onPress={() => onChange(zone)}
                selected={value === zone}
              />
            ))}
          </View>
        </View>
      </BottomSheet>
    );
  }

  const daysInMonth = new Date(
    draftDate.getFullYear(),
    draftDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOffset = new Date(
    draftDate.getFullYear(),
    draftDate.getMonth(),
    1,
  ).getDay();
  const monthTitle = draftDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <BottomSheet
      onDismiss={onDismiss}
      snapPoints={[field.type === 'date' ? '62%' : '44%']}
      visible={Boolean(field)}>
      <View style={styles.sheetStack}>
        <Text style={styles.title}>
          {field.label}
        </Text>
        {field.type === 'date' ? (
          <>
            <View style={styles.monthHeader}>
              <Pressable
                accessibilityLabel="Previous month"
                accessibilityRole="button"
                onPress={() =>
                  setDraftDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                }
                style={styles.navButton}>
                <Text style={styles.dayText}>{'<'}</Text>
              </Pressable>
              <Text style={styles.monthTitle}>{monthTitle}</Text>
              <Pressable
                accessibilityLabel="Next month"
                accessibilityRole="button"
                onPress={() =>
                  setDraftDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                }
                style={styles.navButton}>
                <Text style={styles.dayText}>{'>'}</Text>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
              {Array.from({length: firstDayOffset}, (_, index) => (
                <View
                  key={`blank-${index}`}
                  style={[styles.dayButton, styles.dayButtonBlank]}
                />
              ))}
              {Array.from({length: daysInMonth}, (_, index) => index + 1).map(day => {
                const selected = draftDate.getDate() === day;
                return (
                  <Pressable
                    accessibilityLabel={`Select day ${day}`}
                    accessibilityRole="button"
                    key={day}
                    onPress={() => {
                      const nextDate = new Date(draftDate);
                      nextDate.setDate(day);
                      setDraftDate(nextDate);
                      onChange(toDateInputValue(nextDate));
                    }}
                    style={[styles.dayButton, selected ? styles.dayButtonActive : null]}>
                    <Text style={[styles.dayText, selected ? styles.dayTextActive : null]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.timeDisplay}>{toTimeInputValue(draftTime)}</Text>
            <View style={styles.stepGrid}>
              <TimeStepper
                label="Hour"
                onChange={nextDate => {
                  setDraftTime(nextDate);
                  onChange(toTimeInputValue(nextDate));
                }}
                part="hour"
                value={draftTime}
                styles={styles}
              />
              <TimeStepper
                label="Minute"
                onChange={nextDate => {
                  setDraftTime(nextDate);
                  onChange(toTimeInputValue(nextDate));
                }}
                part="minute"
                value={draftTime}
                styles={styles}
              />
            </View>
          </>
        )}
        <PrimaryButton
          accessibilityLabel={`Done selecting ${field.type}`}
          onPress={onDismiss}>
          Done
        </PrimaryButton>
      </View>
    </BottomSheet>
  );
}

function TimeStepper({
  label,
  onChange,
  part,
  styles,
  value,
}: {
  label: string;
  onChange: (value: Date) => void;
  part: 'hour' | 'minute';
  styles: Record<string, object>;
  value: Date;
}) {
  const increment = part === 'hour' ? 1 : 5;
  const update = (direction: 1 | -1) => {
    const nextDate = new Date(value);
    if (part === 'hour') {
      nextDate.setHours((nextDate.getHours() + direction + 24) % 24);
    } else {
      nextDate.setMinutes((nextDate.getMinutes() + direction * increment + 60) % 60);
    }
    onChange(nextDate);
  };

  return (
    <View style={styles.stepColumn}>
      <Text style={styles.stepLabel}>{label}</Text>
      <SecondaryButton
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        onPress={() => update(1)}>
        +
      </SecondaryButton>
      <SecondaryButton
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        onPress={() => update(-1)}>
        -
      </SecondaryButton>
    </View>
  );
}

function parsePickerDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (year && month && day) {
    return new Date(year, month - 1, day);
  }

  return new Date();
}

function toDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function parsePickerTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  const date = new Date();

  date.setHours(Number(match?.[1] ?? '09'), Number(match?.[2] ?? '00'), 0, 0);
  return date;
}

function toTimeInputValue(date: Date) {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
}

function getSupportedTimeZones() {
  const intlWithTimeZones = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[];
  };

  return (
    intlWithTimeZones.supportedValuesOf?.('timeZone') ?? fallbackTimeZones
  );
}

const fallbackTimeZones = [
  'Africa/Abidjan',
  'Africa/Accra',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'UTC',
];
