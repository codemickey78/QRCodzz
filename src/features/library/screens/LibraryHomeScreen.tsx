import React, {useCallback, useMemo, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react-native';
import {
  AddCircleIcon,
  FilterHorizontalIcon,
  FolderLibraryIcon,
  LibraryIcon,
} from '@hugeicons/core-free-icons';

import {LibraryStackParamList} from '../../../app/navigation/navigationTypes';
import {useAppToast} from '../../../components/feedback/AppToast';
import {EmptyState} from '../../../components/feedback/EmptyState';
import {FormField} from '../../../components/forms/FormField';
import {SearchInput} from '../../../components/forms/SearchInput';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {PrimaryButton, SecondaryButton} from '../../../components/ui/Button';
import {Card} from '../../../components/ui/Card';
import {CodeListItem} from '../../../components/ui/CodeListItem';
import {FilterChip} from '../../../components/ui/FilterChip';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {databaseClient} from '../../../database/databaseClient';
import {CodeItem} from '../../../database/entities/CodeItem';
import {Collection} from '../../../database/entities/Collection';
import {Folder} from '../../../database/entities/Folder';
import {useTheme} from '../../../theme/useTheme';

type LibraryNavigation = NativeStackNavigationProp<
  LibraryStackParamList,
  'LibraryHome'
>;
type TopFilter = 'All' | 'Scanned' | 'Created' | 'Favorites';
type DetailFilter =
  | 'Today'
  | 'This week'
  | 'This month'
  | 'QR'
  | 'Barcode'
  | 'Scanned'
  | 'Generated';

const topFilters: TopFilter[] = ['All', 'Scanned', 'Created', 'Favorites'];
const detailFilters: DetailFilter[] = [
  'Today',
  'This week',
  'This month',
  'QR',
  'Barcode',
  'Scanned',
  'Generated',
];

export function LibraryHomeScreen() {
  const navigation = useNavigation<LibraryNavigation>();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const showToast = useAppToast();
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState('');
  const [topFilter, setTopFilter] = useState<TopFilter>('All');
  const [detailFilter, setDetailFilter] = useState<DetailFilter | undefined>();
  const [folderFilterId, setFolderFilterId] = useState<string | undefined>();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [collectionSheetVisible, setCollectionSheetVisible] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const loadLibrary = useCallback(async () => {
    const [nextCodes, nextCollections, nextFolders] = await Promise.all([
      databaseClient.repositories.codes.getAll(),
      databaseClient.repositories.collections.getAll(),
      databaseClient.repositories.folders.getAll(),
    ]);
    setCodes(nextCodes);
    setCollections(nextCollections);
    setFolders(nextFolders);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary]),
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: theme.colors.background,
          flex: 1,
        },
        content: {
          gap: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xxxl,
          paddingHorizontal: 18,
          paddingTop: theme.spacing.lg,
        },
        headerBlock: {
          gap: theme.spacing.lg,
        },
        searchRow: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.md,
        },
        searchWrap: {
          flex: 1,
        },
        filterButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: 26,
          height: 52,
          justifyContent: 'center',
          width: 52,
        },
        activeDot: {
          backgroundColor: theme.colors.black,
          borderColor: theme.colors.white,
          borderRadius: 5,
          borderWidth: 1.5,
          height: 10,
          position: 'absolute',
          right: 9,
          top: 9,
          width: 10,
        },
        statCard: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          justifyContent: 'space-between',
        },
        statBlock: {
          borderRadius: theme.radii.lg,
          flex: 1,
          gap: theme.spacing.xs,
          padding: theme.spacing.md,
        },
        statValue: {
          color: theme.colors.textPrimary,
          ...theme.typography.title,
        },
        statLabel: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        sectionTitleRow: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        sectionActionText: {
          color: theme.colors.primary,
          ...theme.typography.caption,
        },
        rail: {
          gap: theme.spacing.sm,
          paddingRight: theme.spacing.xl,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        libraryCardWide: {
          flexBasis: '48%',
          flexGrow: 1,
        },
        chips: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        sheetHeader: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        sheetTitle: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
        },
        clearText: {
          color: theme.colors.primary,
          ...theme.typography.bodyStrong,
        },
        sheetSection: {
          gap: theme.spacing.sm,
          marginTop: theme.spacing.lg,
        },
        helperText: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        sheetActions: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.lg,
        },
        sheetButton: {
          flex: 1,
        },
      }),
    [insets.bottom, theme],
  );

  const filteredCodes = useMemo(
    () =>
      filterCodes(
        codes,
        folders,
        search,
        topFilter,
        detailFilter,
        folderFilterId,
      ),
    [codes, detailFilter, folderFilterId, folders, search, topFilter],
  );

  const sortedFolders = useMemo(() => [...folders].sort(sortFolders), [folders]);
  const sortedCollections = useMemo(
    () =>
      [...collections].sort((first, second) =>
        first.title.localeCompare(second.title),
      ),
    [collections],
  );
  const visibleFolders = showAllFolders
    ? sortedFolders
    : sortedFolders.slice(0, 10);
  const visibleCollections = showAllCollections
    ? sortedCollections
    : sortedCollections.slice(0, 10);

  const clearFilters = useCallback(() => {
    setTopFilter('All');
    setDetailFilter(undefined);
    setFolderFilterId(undefined);
  }, []);

  const createFolder = useCallback(async () => {
    if (isCreatingFolder) {
      return;
    }

    const nextName = folderName.trim();

    if (!nextName) {
      showToast('Name required', 'Enter a folder name.');
      return;
    }

    if (
      folders.some(folder => folder.name.toLowerCase() === nextName.toLowerCase())
    ) {
      showToast('Folder exists', 'Choose a different folder name.');
      return;
    }

    setIsCreatingFolder(true);
    try {
      const folder = await databaseClient.repositories.folders.create({
        icon: 'folder',
        name: nextName,
      });
      setFolders(current => [...current, folder].sort(sortFolders));
      setFolderName('');
      setFolderSheetVisible(false);
    } finally {
      setIsCreatingFolder(false);
    }
  }, [folderName, folders, isCreatingFolder, showToast]);

  const createCollection = useCallback(async () => {
    if (isCreatingCollection) {
      return;
    }

    const nextTitle = collectionTitle.trim();

    if (!nextTitle) {
      showToast('Title required', 'Enter a collection name.');
      return;
    }

    if (
      collections.some(
        collection => collection.title.toLowerCase() === nextTitle.toLowerCase(),
      )
    ) {
      showToast('Collection exists', 'Choose a different collection name.');
      return;
    }

    setIsCreatingCollection(true);
    try {
      const collection = await databaseClient.repositories.collections.create({
        description: collectionDescription.trim() || undefined,
        itemIds: [],
        title: nextTitle,
      });
      setCollections(current => [collection, ...current]);
      setCollectionTitle('');
      setCollectionDescription('');
      setCollectionSheetVisible(false);
      navigation.navigate('CollectionDetails', {collectionId: collection.id});
    } finally {
      setIsCreatingCollection(false);
    }
  }, [
    collectionDescription,
    collectionTitle,
    collections,
    isCreatingCollection,
    navigation,
    showToast,
  ]);

  const toggleFavorite = useCallback(async (item: CodeItem) => {
    const updated = await databaseClient.repositories.codes.update(item.id, {
      isFavorite: !item.isFavorite,
    });
    setCodes(current =>
      current.map(code => (code.id === updated.id ? updated : code)),
    );
  }, []);

  const renderItem = useCallback(
    ({item}: {item: CodeItem}) => (
      <CodeListItem
        folders={folders}
        item={item}
        onPress={() => navigation.navigate('CodeDetails', {codeId: item.id})}
        onToggleFavorite={() => toggleFavorite(item)}
      />
    ),
    [folders, navigation, toggleFavorite],
  );

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredCodes}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            message={
              topFilter === 'Favorites'
                ? 'Favorite codes from the list or detail screen to collect them here.'
                : 'Your scanned and created codes will appear here.'
            }
            title={topFilter === 'Favorites' ? 'No favorites yet' : 'No codes yet'}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.searchRow}>
              <View style={styles.searchWrap}>
                <SearchInput
                  accessibilityLabel="Search codes"
                  onChangeText={setSearch}
                  placeholder="Search codes..."
                  value={search}
                />
              </View>
              <Pressable
                accessibilityLabel="Open filters"
                accessibilityRole="button"
                onPress={() => setFiltersVisible(true)}
                style={({pressed}) => [
                  styles.filterButton,
                  pressed ? {opacity: 0.72, transform: [{scale: 0.96}]} : null,
                ]}>
                <HugeiconsIcon
                  color={theme.colors.textPrimary}
                  icon={FilterHorizontalIcon}
                  size={22}
                  strokeWidth={2}
                />
                {topFilter !== 'All' || detailFilter || folderFilterId ? (
                  <View style={styles.activeDot} />
                ) : null}
              </Pressable>
            </View>
            <Card radius="dashboard" style={styles.statCard}>
              <View style={[styles.statBlock, {backgroundColor: '#EEF7FF'}]}>
                <Text style={styles.statValue}>{codes.length}</Text>
                <Text style={styles.statLabel}>Total codes</Text>
              </View>
              <View style={[styles.statBlock, {backgroundColor: '#F0F8EF'}]}>
                <Text style={styles.statValue}>{filteredCodes.length}</Text>
                <Text style={styles.statLabel}>In view</Text>
              </View>
              <View style={[styles.statBlock, {backgroundColor: '#FFF5E2'}]}>
                <Text style={styles.statValue}>{folders.length}</Text>
                <Text style={styles.statLabel}>Folders</Text>
              </View>
            </Card>
            <View style={styles.sectionTitleRow}>
              <SectionHeader title="Folders" />
              {sortedFolders.length > 10 ? (
                <Pressable
                  accessibilityLabel={
                    showAllFolders ? 'Show fewer folders' : 'Show all folders'
                  }
                  accessibilityRole="button"
                  onPress={() => setShowAllFolders(current => !current)}>
                  <Text style={styles.sectionActionText}>
                    {showAllFolders ? 'Show less' : 'See all'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView
              contentContainerStyle={showAllFolders ? styles.grid : styles.rail}
              horizontal={!showAllFolders}
              showsHorizontalScrollIndicator={false}>
              <LibraryCard
                icon={AddCircleIcon}
                meta="Organize saved codes"
                onPress={() => setFolderSheetVisible(true)}
                style={showAllFolders ? styles.libraryCardWide : null}
                title="New folder"
              />
              {visibleFolders.map(folder => {
                const selected = folderFilterId === folder.id;
                const codeCount = codes.filter(code => code.folderId === folder.id).length;

                return (
                  <LibraryCard
                    action="Open folder"
                    icon={FolderLibraryIcon}
                    key={folder.id}
                    meta={`${codeCount} ${codeCount === 1 ? 'code' : 'codes'}`}
                    onActionPress={() =>
                      navigation.navigate('FolderDetails', {folderId: folder.id})
                    }
                    onPress={() =>
                      setFolderFilterId(current =>
                        current === folder.id ? undefined : folder.id,
                      )
                    }
                    selected={selected}
                    style={showAllFolders ? styles.libraryCardWide : null}
                    title={folder.name}
                  />
                );
              })}
            </ScrollView>
            <View style={styles.sectionTitleRow}>
              <SectionHeader title="Collections" />
              {sortedCollections.length > 10 ? (
                <Pressable
                  accessibilityLabel={
                    showAllCollections
                      ? 'Show fewer collections'
                      : 'Show all collections'
                  }
                  accessibilityRole="button"
                  onPress={() => setShowAllCollections(current => !current)}>
                  <Text style={styles.sectionActionText}>
                    {showAllCollections ? 'Show less' : 'See all'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView
              contentContainerStyle={
                showAllCollections ? styles.grid : styles.rail
              }
              horizontal={!showAllCollections}
              showsHorizontalScrollIndicator={false}>
              <LibraryCard
                icon={AddCircleIcon}
                meta="Choose items after setup"
                onPress={() => setCollectionSheetVisible(true)}
                style={showAllCollections ? styles.libraryCardWide : null}
                title="New collection"
              />
              {visibleCollections.map(collection => (
                <LibraryCard
                  icon={LibraryIcon}
                  key={collection.id}
                  meta={`${collection.itemIds.length} ${
                    collection.itemIds.length === 1 ? 'item' : 'items'
                  }`}
                  onPress={() =>
                    navigation.navigate('CollectionDetails', {
                      collectionId: collection.id,
                    })
                  }
                  style={showAllCollections ? styles.libraryCardWide : null}
                  title={collection.title}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
      />
      <BottomSheet
        onDismiss={() => setFiltersVisible(false)}
        snapPoints={['58%', '82%']}
        visible={filtersVisible}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <Pressable
            accessibilityLabel="Clear library filters"
            accessibilityRole="button"
            onPress={clearFilters}>
            <Text style={styles.clearText}>Clear filters</Text>
          </Pressable>
        </View>
        <View style={styles.sheetSection}>
          <SectionHeader title="Source" />
          <View style={styles.chips}>
            {topFilters.map(filter => (
              <FilterChip
                key={filter}
                label={filter}
                onPress={() => setTopFilter(filter)}
                selected={topFilter === filter}
              />
            ))}
          </View>
        </View>
        <View style={styles.sheetSection}>
          <SectionHeader title="Details" />
          <View style={styles.chips}>
            {detailFilters.map(filter => (
              <FilterChip
                key={filter}
                label={filter}
                onPress={() =>
                  setDetailFilter(current =>
                    current === filter ? undefined : filter,
                  )
                }
                selected={detailFilter === filter}
              />
            ))}
          </View>
        </View>
        <View style={styles.sheetSection}>
          <SectionHeader title="Folders" />
          <View style={styles.chips}>
            {sortedFolders.map(folder => (
              <FilterChip
                key={folder.id}
                label={folder.name}
                onPress={() =>
                  setFolderFilterId(current =>
                    current === folder.id ? undefined : folder.id,
                  )
                }
                selected={folderFilterId === folder.id}
              />
            ))}
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        onDismiss={() => setFolderSheetVisible(false)}
        snapPoints={['42%']}
        visible={folderSheetVisible}>
        <Text style={styles.sheetTitle}>New folder</Text>
        <View style={styles.sheetSection}>
          <FormField
            accessibilityLabel="Folder name"
            label="Folder name"
            onChangeText={setFolderName}
            placeholder="Clients, Events, Products..."
            value={folderName}
          />
        </View>
        <View style={styles.sheetActions}>
          <SecondaryButton
            accessibilityLabel="Cancel folder creation"
            onPress={() => setFolderSheetVisible(false)}
            style={styles.sheetButton}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            accessibilityLabel="Create folder"
            disabled={isCreatingFolder}
            onPress={createFolder}
            style={styles.sheetButton}>
            Create
          </PrimaryButton>
        </View>
      </BottomSheet>
      <BottomSheet
        onDismiss={() => setCollectionSheetVisible(false)}
        snapPoints={['48%']}
        visible={collectionSheetVisible}>
        <Text style={styles.sheetTitle}>New collection</Text>
        <View style={styles.sheetSection}>
          <FormField
            accessibilityLabel="Collection title"
            label="Collection title"
            onChangeText={setCollectionTitle}
            placeholder="Restaurant launch, Client pack..."
            value={collectionTitle}
          />
          <FormField
            accessibilityLabel="Collection description"
            label="Description"
            multiline
            onChangeText={setCollectionDescription}
            placeholder="Optional note"
            value={collectionDescription}
          />
          <Text style={styles.helperText}>
            Collections start empty. Add specific saved codes from the collection screen.
          </Text>
        </View>
        <View style={styles.sheetActions}>
          <SecondaryButton
            accessibilityLabel="Cancel collection creation"
            onPress={() => setCollectionSheetVisible(false)}
            style={styles.sheetButton}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            accessibilityLabel="Create collection"
            disabled={isCreatingCollection}
            onPress={createCollection}
            style={styles.sheetButton}>
            Create
          </PrimaryButton>
        </View>
      </BottomSheet>
    </View>
  );
}

type LibraryCardProps = {
  action?: string;
  icon: IconSvgElement;
  meta: string;
  onActionPress?: () => void;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  title: string;
};

function LibraryCard({
  action,
  icon,
  meta,
  onActionPress,
  onPress,
  selected,
  style,
  title,
}: LibraryCardProps) {
  const {theme} = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        libraryCard: {
          alignItems: 'flex-start',
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          gap: theme.spacing.xs,
          justifyContent: 'center',
          minHeight: 78,
          minWidth: 158,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
        cardTop: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          maxWidth: '100%',
        },
        cardTitle: {
          color: selected ? theme.colors.white : theme.colors.textPrimary,
          flexShrink: 1,
          ...theme.typography.bodyStrong,
        },
        cardMeta: {
          color: selected ? theme.colors.white : theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        cardAction: {
          color: selected ? theme.colors.white : theme.colors.primary,
          ...theme.typography.caption,
        },
      }),
    [selected, theme],
  );

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.libraryCard,
        style,
        pressed ? {opacity: 0.74, transform: [{scale: 0.98}]} : null,
      ]}>
      <View style={styles.cardTop}>
        <HugeiconsIcon
          color={selected ? theme.colors.white : theme.colors.textSecondary}
          icon={icon}
          size={19}
          strokeWidth={2.1}
        />
        <Text numberOfLines={1} style={styles.cardTitle}>
          {title}
        </Text>
      </View>
      <Text style={styles.cardMeta}>{meta}</Text>
      {action && onActionPress ? (
        <Pressable
          accessibilityLabel={action}
          accessibilityRole="button"
          onPress={event => {
            event.stopPropagation();
            onActionPress();
          }}>
          <Text style={styles.cardAction}>{action}</Text>
        </Pressable>
      ) : null}
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

function filterCodes(
  codes: CodeItem[],
  folders: Folder[],
  search: string,
  topFilter: TopFilter,
  detailFilter?: DetailFilter,
  folderFilterId?: string,
) {
  const normalizedSearch = search.trim().toLowerCase();
  return codes.filter(code => {
    if (topFilter === 'Scanned' && code.source !== 'scanned') {
      return false;
    }
    if (topFilter === 'Created' && code.source !== 'generated') {
      return false;
    }
    if (topFilter === 'Favorites' && !code.isFavorite) {
      return false;
    }
    if (folderFilterId && code.folderId !== folderFilterId) {
      return false;
    }
    if (detailFilter && !matchesDetailFilter(code, detailFilter)) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }

    const folderName = folders.find(folder => folder.id === code.folderId)?.name;
    return [code.title, code.content, code.format, code.description, folderName]
      .filter(Boolean)
      .some(value => value?.toLowerCase().includes(normalizedSearch));
  });
}

function matchesDetailFilter(code: CodeItem, filter: DetailFilter) {
  switch (filter) {
    case 'Today':
      return isWithinDays(code.createdAt, 1);
    case 'This week':
      return isWithinDays(code.createdAt, 7);
    case 'This month':
      return isWithinDays(code.createdAt, 31);
    case 'QR':
      return code.type === 'qr';
    case 'Barcode':
      return code.type === 'barcode';
    case 'Scanned':
      return code.source === 'scanned';
    case 'Generated':
      return code.source === 'generated';
    default:
      return true;
  }
}

function isWithinDays(value: string, days: number) {
  const timestamp = new Date(value).getTime();
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

function sortFolders(first: Folder, second: Folder) {
  return first.name.localeCompare(second.name);
}
