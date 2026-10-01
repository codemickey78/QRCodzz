import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native';
import {
  AddressBookIcon,
  BarCode01Icon,
  Briefcase05Icon,
  BrushIcon,
  Calendar03Icon,
  CallIcon,
  ContactIcon,
  DocumentCodeIcon,
  Facebook01Icon,
  Fire03Icon,
  Globe02Icon,
  GoogleIcon,
  InstagramIcon,
  Link02Icon,
  Linkedin01Icon,
  Location04Icon,
  Mail01Icon,
  MenuRestaurantIcon,
  MessageMultiple02Icon,
  MessengerIcon,
  PackageIcon,
  Payment02Icon,
  QrCode01Icon,
  QrCodeIcon,
  Settings03Icon,
  SmsCodeIcon,
  SnapchatIcon,
  SpotifyIcon,
  TelegramIcon,
  TextSquareIcon,
  ThreadsIcon,
  TiktokIcon,
  TwitterIcon,
  WhatsappIcon,
  Wifi01Icon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons';

import { CreateStackParamList } from '../../../app/navigation/navigationTypes';
import { SearchInput } from '../../../components/forms/SearchInput';
import {AdBanner} from '../../../components/ads/AdBanner';
import { AppScreen } from '../../../components/layout/AppScreen';
import { Card } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { builtInTemplates } from '../../../database/defaultTemplates';
import { Template } from '../../../database/entities/Template';
import { barcodeGeneratorDefinitions } from '../../barcodeGenerator/barcode/barcodeGeneratorDefinitions';
import {
  qrGeneratorDefinitions,
  qrGeneratorSections,
} from '../qr/qrGeneratorDefinitions';
import {
  AnyQRGeneratorDefinition,
  QRGeneratorSection,
} from '../qr/qrGeneratorTypes';
import { useTheme } from '../../../theme/useTheme';

type CreateNavigation = NativeStackNavigationProp<
  CreateStackParamList,
  'CreateHome'
>;

export function CreateHomeScreen() {
  const navigation = useNavigation<CreateNavigation>();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [generationMode, setGenerationMode] = useState<'qr' | 'barcode'>('qr');
  const normalizedSearch = search.trim().toLowerCase();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing.lg,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        },
        quickStack: {
          gap: theme.spacing.sm,
        },
        modeRow: {
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radii.xl,
          flexDirection: 'row',
          gap: theme.spacing.xs,
          padding: 5,
        },
        modeButton: {
          alignItems: 'center',
          borderRadius: theme.radii.lg,
          flex: 1,
          flexDirection: 'row',
          gap: theme.spacing.sm,
          justifyContent: 'center',
          minHeight: 46,
        },
        modeButtonActive: {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.black,
          shadowOffset: {height: 4, width: 0},
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        modeText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gs,
          fontSize: 13,
          lineHeight: 18,
        },
        modeTextActive: {
          color: theme.colors.white,
        },
        batchCard: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          elevation: 2,
          flexDirection: 'row',
          gap: theme.spacing.md,
          minHeight: 74,
          padding: theme.spacing.md,
          shadowColor: theme.colors.black,
          shadowOffset: {height: 8, width: 0},
          shadowOpacity: 0.04,
          shadowRadius: 18,
        },
        batchCopy: {
          flex: 1,
          gap: theme.spacing.xs,
        },
        batchTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
        batchText: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        batchIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 17,
          height: 40,
          justifyContent: 'center',
          width: 40,
        },
        typeButton: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          elevation: 2,
          gap: theme.spacing.sm,
          minHeight: 120,
          padding: 14,
          shadowColor: theme.colors.black,
          shadowOffset: {height: 6, width: 0},
          shadowOpacity: 0.04,
          shadowRadius: 14,
          width: '47%',
        },
        typeTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
        typeDescription: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        templateButton: {
          borderColor: 'transparent',
          borderRadius: theme.radii.lg,
          borderWidth: 0,
          gap: theme.spacing.sm,
          minHeight: 128,
          padding: 14,
          width: '47%',
        },
        templateIcon: {
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.22)',
          borderRadius: 14,
          height: 40,
          justifyContent: 'center',
          width: 40,
        },
        templateTitle: {
          color: theme.colors.white,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
        templateMeta: {
          color: 'rgba(255,255,255,0.82)',
          fontFamily: theme.fonts.gs,
          fontSize: 12,
          lineHeight: 17,
        },
        typeIcon: {
          alignItems: 'center',
          borderRadius: 14,
          height: 40,
          justifyContent: 'center',
          width: 40,
        },
        empty: {
          color: theme.colors.textSecondary,
          ...theme.typography.body,
        },
      }),
    [theme],
  );

  const matchesSearch = (definition: AnyQRGeneratorDefinition) =>
    !normalizedSearch ||
    [definition.label, definition.description, ...definition.searchTerms]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);

  return (
    <AppScreen>
      <View style={styles.stack}>
        <SearchInput
          accessibilityLabel="Search QR types"
          placeholder={`Search ${generationMode === 'qr' ? 'QR' : 'barcode'} types`}
          onChangeText={setSearch}
          value={search}
        />
        <View style={styles.modeRow}>
          <ModeButton
            active={generationMode === 'qr'}
            icon={QrCode01Icon}
            label="QR Codes"
            onPress={() => setGenerationMode('qr')}
            styles={styles}
          />
          <ModeButton
            active={generationMode === 'barcode'}
            icon={BarCode01Icon}
            label="Barcodes"
            onPress={() => setGenerationMode('barcode')}
            styles={styles}
          />
        </View>
        <AdBanner />
        <View style={styles.quickStack}>
          <Pressable
            accessibilityLabel="Open batch generator"
            accessibilityRole="button"
            onPress={() => navigation.navigate('BatchGenerator')}
            style={({pressed}) => [
              styles.batchCard,
              pressed ? {opacity: 0.78, transform: [{scale: 0.985}]} : null,
            ]}
          >
            <View style={styles.batchIcon}>
              <HugeiconsIcon
                color="#7C3AED"
                icon={DocumentCodeIcon}
                size={22}
                strokeWidth={2.4}
              />
            </View>
            <View style={styles.batchCopy}>
              <Text style={styles.batchTitle}>Batch Generate</Text>
              <Text style={styles.batchText}>Create multiple codes.</Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityLabel="Open QR Studio"
            accessibilityRole="button"
            onPress={() => navigation.navigate('QRStudio', {})}
            style={({pressed}) => [
              styles.batchCard,
              pressed
                ? {opacity: 0.78, transform: [{scale: 0.985}]}
                : null,
            ]}
          >
            <View style={styles.batchIcon}>
              <HugeiconsIcon
                color="#0EA5E9"
                icon={BrushIcon}
                size={22}
                strokeWidth={2.4}
              />
            </View>
            <View style={styles.batchCopy}>
              <Text style={styles.batchTitle}>QR Studio</Text>
              <Text style={styles.batchText}>Design a branded QR.</Text>
            </View>
          </Pressable>
        </View>
        {generationMode === 'qr' ? (
        <View style={styles.stack}>
          <SectionHeader icon={QrCodeIcon} title="Templates" />
          <View style={styles.grid}>
            {builtInTemplates
              .filter(templateMatchesSearch(normalizedSearch))
              .map(template => (
                <TemplateButton
                  key={template.id}
                  onPress={() =>
                    navigation.navigate('GeneratorForm', {
                      generatorId: String(
                        readTemplateConfig(template).generatorId,
                      ),
                      initialPayload: readTemplateConfig(template)
                        .defaultPayload,
                      mode: 'qr',
                      templateName: template.name,
                    })
                  }
                  style={styles.templateButton}
                  template={template}
                  styles={styles}
                />
              ))}
          </View>
        </View>
        ) : null}
        {(generationMode === 'qr'
          ? qrGeneratorSections.filter(section => section !== 'Barcodes')
          : (['Barcodes'] as QRGeneratorSection[])
        ).map(section => {
          const definitions =
            getDefinitionsForSection(section).filter(matchesSearch);

          if (!definitions.length && normalizedSearch) {
            return null;
          }

          return (
            <View key={section} style={styles.stack}>
              <SectionHeader icon={sectionVisuals[section].icon} title={section} />
              {definitions.length ? (
                <View style={styles.grid}>
                  {definitions.map(definition => (
                    <GeneratorTypeButton
                      definition={definition}
                      key={`${section}-${definition.id}`}
                      mode={section === 'Barcodes' ? 'barcode' : 'qr'}
                      onPress={() =>
                        navigation.navigate('GeneratorForm', {
                          generatorId: definition.id,
                          mode: section === 'Barcodes' ? 'barcode' : 'qr',
                        })
                      }
                      style={styles.typeButton}
                      styles={styles}
                    />
                  ))}
                </View>
              ) : (
                <Card>
                  <Text style={styles.empty}>No matching generators.</Text>
                </Card>
              )}
            </View>
          );
        })}
      </View>
    </AppScreen>
  );
}

type ModeButtonProps = {
  active: boolean;
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  styles: {
    modeButton: object;
    modeButtonActive: object;
    modeText: object;
    modeTextActive: object;
  };
};

function ModeButton({active, icon, label, onPress, styles}: ModeButtonProps) {
  return (
    <Pressable
      accessibilityLabel={`Show ${label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.modeButton,
        active ? styles.modeButtonActive : null,
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}>
      <HugeiconsIcon
        color={active ? '#ffffff' : '#707887'}
        icon={icon}
        size={19}
        strokeWidth={2.2}
      />
      <Text style={[styles.modeText, active ? styles.modeTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function templateMatchesSearch(search: string) {
  return (template: Template) => {
    if (!search) {
      return true;
    }

    const config = readTemplateConfig(template);
    return [
      template.name,
      template.category,
      String(config.pack ?? ''),
      ...config.tags,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search);
  };
}

function readTemplateConfig(template: Template) {
  return template.configuration as {
    defaultPayload: Record<string, unknown>;
    generatorId: string;
    pack?: string;
    tags: string[];
  };
}

type GeneratorVisual = {
  color: string;
  icon: IconSvgElement;
};

const sectionVisuals: Record<QRGeneratorSection, GeneratorVisual> = {
  Popular: {color: '#6E53F9', icon: Fire03Icon},
  Communication: {color: '#0EA5E9', icon: MessageMultiple02Icon},
  Business: {color: '#111827', icon: Briefcase05Icon},
  Social: {color: '#E1306C', icon: AddressBookIcon},
  Utility: {color: '#10B981', icon: Settings03Icon},
  Barcodes: {color: '#334155', icon: BarCode01Icon},
};

const generatorVisuals: Record<string, GeneratorVisual> = {
  appLink: {color: '#0EA5E9', icon: Link02Icon},
  appUrl: {color: '#2563EB', icon: Link02Icon},
  businessCard: {color: '#111827', icon: Briefcase05Icon},
  contact: {color: '#14B8A6', icon: ContactIcon},
  email: {color: '#EA4335', icon: Mail01Icon},
  event: {color: '#F59E0B', icon: Calendar03Icon},
  facebook: {color: '#1877F2', icon: Facebook01Icon},
  googleReviewUrl: {color: '#4285F4', icon: GoogleIcon},
  instagram: {color: '#E1306C', icon: InstagramIcon},
  linkedin: {color: '#0A66C2', icon: Linkedin01Icon},
  location: {color: '#34A853', icon: Location04Icon},
  menuUrl: {color: '#FF6B35', icon: MenuRestaurantIcon},
  messenger: {color: '#0084FF', icon: MessengerIcon},
  paymentUrl: {color: '#635BFF', icon: Payment02Icon},
  phone: {color: '#16A34A', icon: CallIcon},
  productUrl: {color: '#8B5CF6', icon: PackageIcon},
  sms: {color: '#22C55E', icon: SmsCodeIcon},
  snapchat: {color: '#FFFC00', icon: SnapchatIcon},
  spotify: {color: '#1DB954', icon: SpotifyIcon},
  telegram: {color: '#24A1DE', icon: TelegramIcon},
  text: {color: '#64748B', icon: TextSquareIcon},
  threads: {color: '#000000', icon: ThreadsIcon},
  tiktok: {color: '#000000', icon: TiktokIcon},
  website: {color: '#2563EB', icon: Globe02Icon},
  whatsapp: {color: '#25D366', icon: WhatsappIcon},
  wifi: {color: '#0EA5E9', icon: Wifi01Icon},
  x: {color: '#111111', icon: TwitterIcon},
  youtube: {color: '#FF0000', icon: YoutubeIcon},
  ean13: {color: '#475569', icon: BarCode01Icon},
  ean8: {color: '#64748B', icon: BarCode01Icon},
  upca: {color: '#334155', icon: BarCode01Icon},
  upce: {color: '#475569', icon: BarCode01Icon},
  code128: {color: '#0F766E', icon: BarCode01Icon},
  code39: {color: '#7C3AED', icon: BarCode01Icon},
  code93: {color: '#9333EA', icon: BarCode01Icon},
  codabar: {color: '#B45309', icon: BarCode01Icon},
  itf: {color: '#0369A1', icon: BarCode01Icon},
  dataMatrix: {color: '#0F172A', icon: QrCode01Icon},
  pdf417: {color: '#4F46E5', icon: DocumentCodeIcon},
  aztec: {color: '#BE123C', icon: QrCodeIcon},
};

function visualForGenerator(id: string): GeneratorVisual {
  return generatorVisuals[id] ?? {color: '#6E53F9', icon: QrCode01Icon};
}

function getDefinitionsForSection(section: QRGeneratorSection) {
  return section === 'Barcodes'
    ? barcodeGeneratorDefinitions
    : qrGeneratorDefinitions.filter(definition =>
        definition.sections.includes(section),
      );
}

type GeneratorTypeButtonProps = {
  definition: AnyQRGeneratorDefinition;
  mode: 'qr' | 'barcode';
  onPress: () => void;
  style: object;
  styles: {
    typeDescription: object;
    typeIcon: object;
    typeTitle: object;
  };
};

function GeneratorTypeButton({
  definition,
  mode,
  onPress,
  style,
  styles,
}: GeneratorTypeButtonProps) {
  const visual = visualForGenerator(definition.id);
  return (
    <Pressable
      accessibilityLabel={`Create ${definition.label} ${mode}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        style,
        {
          backgroundColor: `${visual.color}0F`,
          borderColor: `${visual.color}30`,
        },
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}
    >
      <View style={[styles.typeIcon, {backgroundColor: `${visual.color}18`}]}>
        <HugeiconsIcon
          color={visual.color}
          icon={mode === 'qr' ? visual.icon : BarCode01Icon}
          size={22}
          strokeWidth={2.2}
        />
      </View>
      <Text style={[styles.typeTitle, {color: visual.color}]}>
        {definition.label}
      </Text>
      <Text numberOfLines={2} style={styles.typeDescription}>
        {definition.description}
      </Text>
    </Pressable>
  );
}

type TemplateButtonProps = {
  onPress: () => void;
  style: object;
  styles: {
    templateIcon: object;
    templateMeta: object;
    templateTitle: object;
  };
  template: Template;
};

function TemplateButton({
  onPress,
  style,
  styles,
  template,
}: TemplateButtonProps) {
  const config = readTemplateConfig(template);
  const visual = visualForGenerator(String(config.generatorId));
  return (
    <Pressable
      accessibilityLabel={`Use ${template.name} template`}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        style,
        {backgroundColor: visual.color},
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}
    >
      <View style={styles.templateIcon}>
        <HugeiconsIcon
          color="#ffffff"
          icon={visual.icon}
          size={22}
          strokeWidth={2.3}
        />
      </View>
      <Text style={styles.templateTitle}>{template.name}</Text>
      <Text numberOfLines={2} style={styles.templateMeta}>
        {config.pack ?? template.category}
      </Text>
    </Pressable>
  );
}
