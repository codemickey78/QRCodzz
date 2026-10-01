import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {
  BubbleChatQuestionIcon,
  CustomerSupportIcon,
  HelpCircleIcon,
} from '@hugeicons/core-free-icons';

import {AppScreen} from '../../../components/layout/AppScreen';
import {Card} from '../../../components/ui/Card';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {useTheme} from '../../../theme/useTheme';

const faqs = [
  {
    answer:
      'Open Scan, point the camera at a QR code or barcode, then confirm or save the result based on your scanner settings.',
    question: 'How do I scan a code?',
  },
  {
    answer:
      'Open Create, choose a QR or barcode type, fill in the fields, then save the preview to your Library.',
    question: 'How do I create a new code?',
  },
  {
    answer:
      'Open a generated QR from the Library and tap Edit design, or open QR Studio from Create to test a design.',
    question: 'Where is QR Studio?',
  },
  {
    answer:
      'QR Studio options update the preview immediately. Tap a tool, choose an option from the bottom sheet, and the design changes on screen.',
    question: 'How do Studio edits work?',
  },
  {
    answer:
      'Some heavier tools ask you to watch a rewarded ad first. After the reward is earned, the feature opens normally.',
    question: 'Why do some tools show an ad first?',
  },
  {
    answer:
      'Open Settings, then Scanner. You can set manual confirmation, duplicate handling, feedback, camera preference, and default scan mode.',
    question: 'How do I change scanner behavior?',
  },
  {
    answer:
      'Saved scans and generated codes live in the Library. You can rename, favorite, duplicate, export, move, or protect them.',
    question: 'Where are saved codes stored?',
  },
  {
    answer:
      'Secure Vault hides previews for sensitive or protected entries until device authentication succeeds.',
    question: 'What does Secure Vault do?',
  },
  {
    answer:
      'Open Settings, then Privacy & security to see why each permission is requested and when it is used.',
    question: 'Why does the app request permissions?',
  },
  {
    answer:
      'Open a code details page and use Export PNG or Share. Additional export formats can require a rewarded ad before use.',
    question: 'How do I export or share a code?',
  },
  {
    answer:
      'Use Batch Generate from Create, watch the rewarded ad when prompted, paste or import rows, validate them, then save valid items.',
    question: 'How do I generate many codes?',
  },
  {
    answer:
      'Try stronger contrast, a solid background, and fewer decorative changes. QR Studio warns when a design may be harder to scan.',
    question: 'What if my QR design will not scan?',
  },
] as const;

export function HelpSupportScreen() {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          gap: theme.spacing[16],
        },
        hero: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing[12],
          padding: theme.spacing[16],
        },
        heroIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 18,
          height: 42,
          justifyContent: 'center',
          width: 42,
        },
        heroCopy: {
          flex: 1,
          gap: theme.spacing[4],
        },
        heroTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 18,
          lineHeight: 24,
        },
        heroText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
        faqCard: {
          gap: theme.spacing[8],
        },
        question: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 20,
        },
        answer: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 19,
        },
      }),
    [theme],
  );

  return (
    <AppScreen>
      <View style={styles.stack}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <HugeiconsIcon
              color={theme.colors.primary}
              icon={CustomerSupportIcon}
              size={23}
              strokeWidth={2.3}
            />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Help & support</Text>
            <Text style={styles.heroText}>
              Fast answers for scanning, generation, Studio, Library, privacy,
              and rewarded unlocks.
            </Text>
          </View>
        </View>

        <SectionHeader icon={BubbleChatQuestionIcon} title="FAQs" />
        {faqs.map(faq => (
          <Card key={faq.question} style={styles.faqCard}>
            <View>
              <HugeiconsIcon
                color={theme.colors.primary}
                icon={HelpCircleIcon}
                size={18}
                strokeWidth={2.3}
              />
            </View>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
