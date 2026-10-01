import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  AddCircleIcon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  Share08Icon,
} from '@hugeicons/core-free-icons';

import {LibraryStackParamList} from '../../../app/navigation/navigationTypes';
import {AdBanner} from '../../../components/ads/AdBanner';
import {useAppToast} from '../../../components/feedback/AppToast';
import {EmptyState} from '../../../components/feedback/EmptyState';
import {LoadingState} from '../../../components/feedback/LoadingState';
import {FormField} from '../../../components/forms/FormField';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import {CodeListItem} from '../../../components/ui/CodeListItem';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {databaseClient} from '../../../database/databaseClient';
import {CodeItem} from '../../../database/entities/CodeItem';
import {Collection} from '../../../database/entities/Collection';
import {
  createCollectionExportFileName,
  createCollectionExportPayload,
  createCollectionShareItems,
  serializeCollectionExport,
} from '../../export';
import {SharingService} from '../../../services/sharing/SharingService';
import {useTheme} from '../../../theme/useTheme';

type CollectionDetailsNavigation = NativeStackNavigationProp<
  LibraryStackParamList,
  'CollectionDetails'
>;
type CollectionDetailsRoute = RouteProp<
  LibraryStackParamList,
  'CollectionDetails'
>;

export function CollectionDetailsScreen() {
  const navigation = useNavigation<CollectionDetailsNavigation>();
  const route = useRoute<CollectionDetailsRoute>();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const showToast = useAppToast();
  const [collection, setCollection] = useState<Collection | undefined>();
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<string[]>([]);

  const loadCollection = useCallback(async () => {
    const [nextCollection, nextCodes] = await Promise.all([
      databaseClient.repositories.collections.getById(
        route.params.collectionId,
      ),
      databaseClient.repositories.codes.getAll(),
    ]);
    setCollection(nextCollection);
    setCodes(nextCodes);
    setDescription(nextCollection?.description ?? '');
    setTitle(nextCollection?.title ?? '');
  }, [route.params.collectionId]);

  useEffect(() => {
    let isMounted = true;

    loadCollection().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadCollection]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: theme.colors.background,
          flex: 1,
        },
        content: {
          gap: theme.spacing[12],
          paddingBottom: insets.bottom + theme.spacing[24],
          paddingHorizontal: theme.spacing[20],
          paddingTop: theme.spacing[16],
        },
        stack: {
          gap: theme.spacing[12],
        },
        heroCard: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
        },
        heroTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 22,
          lineHeight: 28,
        },
        heroMeta: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.gr,
          fontSize: 13,
          lineHeight: 18,
        },
        actionStrip: {
          flexDirection: 'row',
          gap: theme.spacing[8],
        },
        actionPill: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          flex: 1,
          gap: theme.spacing[4],
          minHeight: 70,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing[8],
          paddingVertical: theme.spacing[8],
        },
        actionIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 14,
          height: 32,
          justifyContent: 'center',
          width: 32,
        },
        dangerIcon: {
          backgroundColor: theme.colors.dangerSoft,
        },
        actionTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 11,
          lineHeight: 14,
          textAlign: 'center',
        },
        dangerText: {
          color: theme.colors.danger,
        },
        sheetTitle: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
        },
        sheetSection: {
          gap: theme.spacing.md,
          marginTop: theme.spacing.lg,
        },
        helperText: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        pickerItem: {
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          overflow: 'hidden',
        },
        pickerItemSelected: {
          borderColor: theme.colors.primary,
          borderWidth: 2,
        },
        pickerFooter: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.lg,
        },
        pickerButton: {
          flex: 1,
        },
        selectedBadge: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: theme.radii.full,
          flexDirection: 'row',
          gap: theme.spacing.xs,
          margin: theme.spacing.sm,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          alignSelf: 'flex-start',
        },
        selectedText: {
          color: theme.colors.primary,
          ...theme.typography.caption,
        },
      }),
    [insets.bottom, theme],
  );

  const collectionCodes = useMemo(() => {
    if (!collection) {
      return [];
    }

    const codesById = new Map(codes.map(code => [code.id, code]));
    return collection.itemIds
      .map(itemId => codesById.get(itemId))
      .filter((code): code is CodeItem => Boolean(code));
  }, [codes, collection]);

  const addableCodes = useMemo(() => {
    if (!collection) {
      return [];
    }

    return codes.filter(code => !collection.itemIds.includes(code.id));
  }, [codes, collection]);

  const renameCollection = useCallback(async () => {
    if (!collection || !title.trim()) {
      showToast('Title required', 'Enter a collection title.');
      return;
    }

    const updated = await databaseClient.repositories.collections.update(
      collection.id,
      {
        description: description.trim() || undefined,
        title: title.trim(),
      },
    );
    setCollection(updated);
    setDescription(updated.description ?? '');
    setTitle(updated.title);
    setEditSheetVisible(false);
    showToast('Collection updated', 'Your changes were saved.');
  }, [collection, description, showToast, title]);

  const togglePendingItem = useCallback((itemId: string) => {
    setPendingItemIds(current =>
      current.includes(itemId)
        ? current.filter(nextId => nextId !== itemId)
        : [...current, itemId],
    );
  }, []);

  const addSelectedItems = useCallback(async () => {
    if (!collection || pendingItemIds.length === 0) {
      showToast('Choose items', 'Select at least one code to add.');
      return;
    }

    const updated = await databaseClient.repositories.collections.update(
      collection.id,
      {
        itemIds: [...collection.itemIds, ...pendingItemIds],
      },
    );
    setCollection(updated);
    setPendingItemIds([]);
    setAddSheetVisible(false);
    showToast('Items added', 'The selected codes were added to this collection.');
  }, [collection, pendingItemIds, showToast]);

  const removeItem = useCallback(
    async (item: CodeItem) => {
      if (!collection) {
        return;
      }

      const updated = await databaseClient.repositories.collections.removeItem(
        collection.id,
        item.id,
      );
      setCollection(updated);
    },
    [collection],
  );

  const shareCollection = useCallback(async () => {
    if (!collection) {
      return;
    }

    const shareItems = createCollectionShareItems(collection, codes);

    if (shareItems.length === 0) {
      showToast('Nothing to share', 'Add at least one code first.');
      return;
    }

    await SharingService.shareText(
      collection.title,
      shareItems
        .map(item => `${item.title || item.format}: ${item.content}`)
        .join('\n'),
    );
  }, [codes, collection, showToast]);

  const exportCollection = useCallback(async () => {
    if (!collection) {
      return;
    }

    const payload = createCollectionExportPayload(collection, codes);

    if (payload.items.length === 0) {
      showToast('Nothing to export', 'Add at least one code first.');
      return;
    }

    await SharingService.shareText(
      createCollectionExportFileName(collection),
      serializeCollectionExport(payload),
    );
  }, [codes, collection, showToast]);

  const deleteCollection = useCallback(async () => {
    if (!collection) {
      return;
    }

    if (!deleteArmed) {
      setDeleteArmed(true);
      showToast(
        'Delete collection?',
        'Tap Delete again. Saved codes stay in Library.',
      );
      return;
    }

    await databaseClient.repositories.collections.delete(collection.id);
    navigation.goBack();
  }, [collection, deleteArmed, navigation, showToast]);

  const toggleFavorite = useCallback(async (item: CodeItem) => {
    const updated = await databaseClient.repositories.codes.update(item.id, {
      isFavorite: !item.isFavorite,
    });
    setCodes(current =>
      current.map(code => (code.id === updated.id ? updated : code)),
    );
  }, []);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <LoadingState />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.root}>
        <EmptyState
          message="This collection may have been deleted."
          title="Collection not found"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.content}
        data={collectionCodes}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Use Add item to choose saved Library codes for this collection."
            title="No codes in this collection"
          />
        }
        ListHeaderComponent={
          <View style={styles.stack}>
            <SectionHeader title="Collection" />
            <View style={styles.heroCard}>
              <View>
                <Text style={styles.heroTitle}>{collection.title}</Text>
                <Text style={styles.heroMeta}>
                  {collectionCodes.length}{' '}
                  {collectionCodes.length === 1 ? 'code' : 'codes'}
                </Text>
              </View>
              {collection.description ? (
                <Text style={styles.heroMeta}>{collection.description}</Text>
              ) : null}
            </View>
            <AdBanner />
            <View style={styles.actionStrip}>
              <CollectionActionCard
                icon={Edit02Icon}
                label="Rename"
                onPress={() => setEditSheetVisible(true)}
                styles={styles}
              />
              <CollectionActionCard
                icon={AddCircleIcon}
                label="Add item"
                onPress={() => setAddSheetVisible(true)}
                styles={styles}
              />
              <CollectionActionCard
                icon={Share08Icon}
                label="Share"
                onPress={shareCollection}
                styles={styles}
              />
              <CollectionActionCard
                icon={Download01Icon}
                label="Export"
                onPress={exportCollection}
                styles={styles}
              />
              <CollectionActionCard
                icon={Delete02Icon}
                label={deleteArmed ? 'Confirm delete' : 'Delete'}
                onPress={deleteCollection}
                styles={styles}
                variant="danger"
              />
            </View>
            <SectionHeader title="Codes" />
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.stack}>
            <CodeListItem
              folders={[]}
              item={item}
              onPress={() =>
                navigation.navigate('CodeDetails', {codeId: item.id})
              }
              onToggleFavorite={() => toggleFavorite(item)}
            />
            <SecondaryButton
              accessibilityLabel="Remove from collection"
              onPress={() => removeItem(item)}>
              Remove from collection
            </SecondaryButton>
          </View>
        )}
        ItemSeparatorComponent={Separator}
      />
      <BottomSheet
        onDismiss={() => {
          setEditSheetVisible(false);
          setTitle(collection.title);
          setDescription(collection.description ?? '');
          setDeleteArmed(false);
        }}
        snapPoints={['56%']}
        visible={editSheetVisible}>
        <Text style={styles.sheetTitle}>Rename collection</Text>
        <View style={styles.sheetSection}>
          <FormField
            accessibilityLabel="Collection title"
            label="Title"
            onChangeText={setTitle}
            value={title}
          />
          <FormField
            accessibilityLabel="Collection description"
            label="Description"
            multiline
            onChangeText={setDescription}
            value={description}
          />
          <View style={styles.pickerFooter}>
            <SecondaryButton
              accessibilityLabel="Cancel renaming collection"
              onPress={() => {
                setTitle(collection.title);
                setDescription(collection.description ?? '');
                setEditSheetVisible(false);
                setDeleteArmed(false);
              }}
              style={styles.pickerButton}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              accessibilityLabel="Save collection changes"
              onPress={renameCollection}
              style={styles.pickerButton}>
              Save
            </PrimaryButton>
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        onDismiss={() => {
          setAddSheetVisible(false);
          setPendingItemIds([]);
        }}
        snapPoints={['72%']}
        visible={addSheetVisible}>
        <Text style={styles.sheetTitle}>Add saved codes</Text>
        <View style={styles.sheetSection}>
          {addableCodes.length === 0 ? (
            <Text style={styles.helperText}>
              Every saved code is already in this collection.
            </Text>
          ) : (
            addableCodes.map(item => {
              const selected = pendingItemIds.includes(item.id);

              return (
                <Pressable
                  accessibilityLabel={`Select ${item.title || item.content}`}
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => togglePendingItem(item.id)}
                  style={[
                    styles.pickerItem,
                    selected ? styles.pickerItemSelected : null,
                  ]}>
                  {selected ? (
                    <View style={styles.selectedBadge}>
                      <HugeiconsIcon
                        color={theme.colors.primary}
                        icon={CheckmarkCircle01Icon}
                        size={15}
                        strokeWidth={2.2}
                      />
                      <Text style={styles.selectedText}>Selected</Text>
                    </View>
                  ) : null}
                  <CodeListItem
                    folders={[]}
                    item={item}
                    onPress={() => togglePendingItem(item.id)}
                    onToggleFavorite={() => toggleFavorite(item)}
                  />
                </Pressable>
              );
            })
          )}
        </View>
        <View style={styles.pickerFooter}>
          <SecondaryButton
            accessibilityLabel="Cancel adding collection items"
            onPress={() => {
              setAddSheetVisible(false);
              setPendingItemIds([]);
            }}
            style={styles.pickerButton}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            accessibilityLabel="Add selected collection items"
            disabled={pendingItemIds.length === 0}
            onPress={addSelectedItems}
            style={styles.pickerButton}>
            Add {pendingItemIds.length || ''}
          </PrimaryButton>
        </View>
      </BottomSheet>
    </View>
  );
}

function CollectionActionCard({
  icon,
  label,
  onPress,
  styles,
  variant,
}: {
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  styles: Record<string, object>;
  variant?: 'danger';
}) {
  const {theme} = useTheme();
  const isDanger = variant === 'danger';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.actionPill,
        pressed ? {opacity: 0.78, transform: [{scale: 0.98}]} : null,
      ]}>
      <View style={[styles.actionIcon, isDanger ? styles.dangerIcon : null]}>
        <HugeiconsIcon
          color={isDanger ? theme.colors.danger : theme.colors.primary}
          icon={icon}
          size={20}
          strokeWidth={2.2}
        />
      </View>
      <Text style={[styles.actionTitle, isDanger ? styles.dangerText : null]}>
        {label}
      </Text>
    </Pressable>
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
