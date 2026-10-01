import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native';
import {
  Calendar03Icon,
  CallIcon,
  ContactIcon,
  Facebook01Icon,
  FavouriteIcon,
  Globe02Icon,
  InstagramIcon,
  Link02Icon,
  Location04Icon,
  Mail01Icon,
  Message01Icon,
  NewTwitterIcon,
  QrCode01Icon,
  StarIcon,
  TelegramIcon,
  TiktokIcon,
  WhatsappIcon,
  Wifi01Icon,
} from '@hugeicons/core-free-icons';

import { CodeItem } from '../../database/entities/CodeItem';
import { getCodePreviewText, getCodeTitleText } from '../../features/security';
import { Folder } from '../../database/entities/Folder';
import { useTheme } from '../../theme/useTheme';
import { Card } from './Card';

type CodeListItemProps = {
  folders?: Folder[];
  item: CodeItem;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

export const CodeListItem = memo(function CodeListItemComponent({
  folders = [],
  item,
  onPress,
  onToggleFavorite,
}: CodeListItemProps) {
  const { theme } = useTheme();
  const folder = folders.find(nextFolder => nextFolder.id === item.folderId);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: 15,
          minHeight: 75,
          padding: theme.spacing.md,
        },
        row: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing[12],
        },
        icon: {
          alignItems: 'center',
          backgroundColor: pastelForText(item.format).background,
          borderRadius: 15,
          height: 52,
          justifyContent: 'center',
          width: 52,
        },
        body: {
          flex: 1,
          gap: theme.spacing[4],
        },
        title: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 15,
          lineHeight: 21,
        },
        meta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 12,
          lineHeight: 17,
        },
        preview: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
        },
        favorite: {
          alignItems: 'center',
          backgroundColor: item.isFavorite
            ? theme.colors.black
            : theme.colors.surfaceMuted,
          borderRadius: 17,
          height: 34,
          justifyContent: 'center',
          width: 34,
        },
      }),
    [item.format, item.isFavorite, theme],
  );

  return (
    <Pressable
      accessibilityLabel={`Open ${getCodeTitleText(item) || titleForCode(item)}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <HugeiconsIcon
              color={pastelForText(item.format).text}
              icon={iconForCode(item)}
              size={24}
              strokeWidth={2.2}
            />
          </View>
          <View style={styles.body}>
            <Text numberOfLines={1} style={styles.title}>
              {getCodeTitleText(item) || titleForCode(item)}
            </Text>
            <Text style={styles.meta}>
              {item.source === 'generated' ? 'Created' : 'Scanned'} /{' '}
              {item.type === 'qr' ? 'QR' : 'Barcode'} / {item.format}
            </Text>
            <Text numberOfLines={1} style={styles.preview}>
              {getCodePreviewText(item)}
            </Text>
            <Text style={styles.meta}>
              {formatRelativeDate(item.createdAt)}
              {folder ? ` / ${folder.name}` : ''}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={
              item.isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
            accessibilityRole="button"
            onPress={event => {
              event.stopPropagation();
              onToggleFavorite?.();
            }}
            style={({pressed}) => [
              styles.favorite,
              pressed ? {opacity: 0.72, transform: [{scale: 0.94}]} : null,
            ]}
          >
            {item.isFavorite ? (
              <HugeiconsIcon
                color={theme.colors.yellow}
                icon={StarIcon}
                size={19}
                strokeWidth={2.4}
              />
            ) : (
              <HugeiconsIcon
                color={theme.colors.textSecondary}
                icon={FavouriteIcon}
                size={18}
                strokeWidth={2.1}
              />
            )}
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
});

function titleForCode(item: CodeItem) {
  if (/^https?:\/\//i.test(item.content)) {
    try {
      return new URL(item.content).hostname;
    } catch {
      return item.content;
    }
  }

  return item.content;
}

function iconForCode(item: CodeItem): IconSvgElement {
  const value = `${item.title ?? ''} ${item.content} ${item.format}`.toLowerCase();

  if (value.includes('instagram')) {
    return InstagramIcon;
  }
  if (value.includes('facebook')) {
    return Facebook01Icon;
  }
  if (value.includes('whatsapp') || value.startsWith('wa.me')) {
    return WhatsappIcon;
  }
  if (value.includes('telegram') || value.includes('t.me')) {
    return TelegramIcon;
  }
  if (value.includes('tiktok')) {
    return TiktokIcon;
  }
  if (value.includes('twitter') || value.includes('x.com')) {
    return NewTwitterIcon;
  }
  if (value.startsWith('wifi:') || value.includes('wi-fi') || value.includes('wifi')) {
    return Wifi01Icon;
  }
  if (value.startsWith('mailto:') || value.includes('@')) {
    return Mail01Icon;
  }
  if (value.startsWith('tel:')) {
    return CallIcon;
  }
  if (value.startsWith('sms:')) {
    return Message01Icon;
  }
  if (value.startsWith('geo:') || value.includes('maps')) {
    return Location04Icon;
  }
  if (value.startsWith('begin:vcard')) {
    return ContactIcon;
  }
  if (value.startsWith('begin:vevent')) {
    return Calendar03Icon;
  }
  if (/^https?:\/\//i.test(item.content)) {
    return Globe02Icon;
  }

  return item.type === 'qr' ? QrCode01Icon : Link02Icon;
}

const badgePalette = [
  {background: '#eaf2ff', text: '#2477e8'},
  {background: '#fff5e2', text: '#ff9f0a'},
  {background: '#e9fbf4', text: '#11a570'},
  {background: '#fff0f6', text: '#ef477a'},
  {background: '#f0edff', text: '#7b61ff'},
];

function pastelForText(value: string) {
  const total = value
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return badgePalette[total % badgePalette.length];
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) {
    return `Today / ${time}`;
  }

  if (isYesterday) {
    return `Yesterday / ${time}`;
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
