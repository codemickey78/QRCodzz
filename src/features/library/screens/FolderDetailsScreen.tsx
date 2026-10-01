import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HugeiconsIcon} from '@hugeicons/react-native';
import {
  Delete02Icon,
  FolderLibraryIcon,
  MoreHorizontalIcon,
  Sorting01Icon,
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
import {FilterChip} from '../../../components/ui/FilterChip';
import {SectionHeader} from '../../../components/ui/SectionHeader';
import {databaseClient} from '../../../database/databaseClient';
import {CodeItem} from '../../../database/entities/CodeItem';
import {Folder} from '../../../database/entities/Folder';
import {useTheme} from '../../../theme/useTheme';

type FolderDetailsNavigation = NativeStackNavigationProp<
  LibraryStackParamList,
  'FolderDetails'
>;
type FolderDetailsRoute = RouteProp<LibraryStackParamList, 'FolderDetails'>;

export function FolderDetailsScreen() {
  const navigation = useNavigation<FolderDetailsNavigation>();
  const route = useRoute<FolderDetailsRoute>();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const showToast = useAppToast();
  const [folder, setFolder] = useState<Folder | undefined>();
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [name, setName] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'name'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityLabel="Folder actions"
          accessibilityRole="button"
          onPress={() => setActionsVisible(true)}
          style={({pressed}) => [
            headerStyles.action,
            pressed ? {opacity: 0.72, transform: [{scale: 0.96}]} : null,
          ]}>
          <HugeiconsIcon
            color={theme.colors.textPrimary}
            icon={MoreHorizontalIcon}
            size={24}
            strokeWidth={2.2}
          />
        </Pressable>
      ),
    });
  }, [navigation, theme.colors.textPrimary]);

  const loadFolder = useCallback(async () => {
    const [nextFolder, nextCodes] = await Promise.all([
      databaseClient.repositories.folders.getById(route.params.folderId),
      databaseClient.repositories.codes.getAll(),
    ]);
    setFolder(nextFolder);
    setName(nextFolder?.name ?? '');
    setCodes(nextCodes.filter(code => code.folderId === route.params.folderId));
  }, [route.params.folderId]);

  useEffect(() => {
    let isMounted = true;

    loadFolder().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadFolder]);

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
        hero: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
        },
        heroIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 20,
          height: 56,
          justifyContent: 'center',
          width: 56,
        },
        heroCopy: {
          flex: 1,
          gap: theme.spacing[4],
        },
        heroTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.gb,
          fontSize: 22,
          lineHeight: 28,
        },
        heroMeta: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        sortRow: {
          alignItems: 'center',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        listTitleRow: {
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          justifyContent: 'space-between',
        },
        sortLabel: {
          color: theme.colors.textSecondary,
          ...theme.typography.caption,
        },
        sheetTitle: {
          color: theme.colors.textPrimary,
          ...theme.typography.heading,
        },
        sheetSection: {
          gap: theme.spacing.md,
          marginTop: theme.spacing.lg,
        },
        actionItem: {
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          flexDirection: 'row',
          gap: theme.spacing.md,
          minHeight: 56,
          paddingHorizontal: theme.spacing.md,
        },
        actionIcon: {
          alignItems: 'center',
          backgroundColor: theme.colors.primarySoft,
          borderRadius: 16,
          height: 36,
          justifyContent: 'center',
          width: 36,
        },
        dangerIcon: {
          backgroundColor: theme.colors.dangerSoft,
        },
        actionText: {
          color: theme.colors.textPrimary,
          ...theme.typography.bodyStrong,
        },
        dangerText: {
          color: theme.colors.danger,
        },
        actionRow: {
          flexDirection: 'row',
          gap: theme.spacing[12],
          marginTop: theme.spacing.lg,
        },
        actionButton: {
          flex: 1,
        },
      }),
    [insets.bottom, theme],
  );

  const sortedCodes = useMemo(() => {
    return [...codes].sort((first, second) => {
      if (sortMode === 'name') {
        return (first.title || first.content).localeCompare(
          second.title || second.content,
        );
      }

      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });
  }, [codes, sortMode]);

  const renameFolder = useCallback(async () => {
    if (!folder || !name.trim()) {
      showToast('Name required', 'Enter a folder name.');
      return;
    }

    const updated = await databaseClient.repositories.folders.update(folder.id, {
      name: name.trim(),
    });
    setFolder(updated);
    setName(updated.name);
    setActionsVisible(false);
    showToast('Folder updated', 'The folder name was saved.');
  }, [folder, name, showToast]);

  const deleteFolder = useCallback(async () => {
    if (!folder) {
      return;
    }

    if (!deleteArmed) {
      setDeleteArmed(true);
      showToast(
        'Delete folder?',
        'Tap Delete again. Saved codes will move to Uncategorized.',
      );
      return;
    }

    await databaseClient.repositories.folders.delete(folder.id);
    setActionsVisible(false);
    navigation.goBack();
  }, [deleteArmed, folder, navigation, showToast]);

  const removeFromFolder = useCallback(async (item: CodeItem) => {
    const updated = await databaseClient.repositories.codes.update(item.id, {
      folderId: undefined,
    });
    setCodes(current => current.filter(code => code.id !== updated.id));
  }, []);

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

  if (!folder) {
    return (
      <View style={styles.root}>
        <EmptyState
          message="This folder may have been deleted."
          title="Folder not found"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.content}
        data={sortedCodes}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Move saved codes into this folder from their detail screen."
            title="No codes in this folder"
          />
        }
        ListHeaderComponent={
          <View style={styles.stack}>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <HugeiconsIcon
                  color={theme.colors.primary}
                  icon={FolderLibraryIcon}
                  size={28}
                  strokeWidth={2.2}
                />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{folder.name}</Text>
                <Text style={styles.heroMeta}>
                  {codes.length} {codes.length === 1 ? 'code' : 'codes'} saved here
                </Text>
              </View>
            </View>
            <AdBanner />
            <View style={styles.sortRow}>
              <HugeiconsIcon
                color={theme.colors.textSecondary}
                icon={Sorting01Icon}
                size={18}
                strokeWidth={2.1}
              />
              <Text style={styles.sortLabel}>Sort by</Text>
              <FilterChip
                label="Newest"
                onPress={() => setSortMode('newest')}
                selected={sortMode === 'newest'}
              />
              <FilterChip
                label="Name"
                onPress={() => setSortMode('name')}
                selected={sortMode === 'name'}
              />
            </View>
            <View style={styles.listTitleRow}>
              <SectionHeader title="Codes" />
            </View>
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.stack}>
            <CodeListItem
              folders={[folder]}
              item={item}
              onPress={() =>
                navigation.navigate('CodeDetails', {codeId: item.id})
              }
              onToggleFavorite={() => toggleFavorite(item)}
            />
            <SecondaryButton
              accessibilityLabel="Move code to uncategorized"
              onPress={() => removeFromFolder(item)}>
              Move to Uncategorized
            </SecondaryButton>
          </View>
        )}
        ItemSeparatorComponent={Separator}
      />
      <BottomSheet
        onDismiss={() => {
          setActionsVisible(false);
          setDeleteArmed(false);
          setName(folder.name);
        }}
        snapPoints={['56%']}
        visible={actionsVisible}>
        <Text style={styles.sheetTitle}>Folder options</Text>
        <View style={styles.sheetSection}>
          <FormField
            accessibilityLabel="Folder name"
            label="Name"
            onChangeText={setName}
            value={name}
          />
          <View style={styles.actionRow}>
            <PrimaryButton
              accessibilityLabel="Rename folder"
              onPress={renameFolder}
              style={styles.actionButton}>
              Rename
            </PrimaryButton>
            <SecondaryButton
              accessibilityLabel="Cancel folder rename"
              onPress={() => {
                setName(folder.name);
                setActionsVisible(false);
                setDeleteArmed(false);
              }}
              style={styles.actionButton}>
              Cancel
            </SecondaryButton>
          </View>
          <Pressable
            accessibilityLabel="Delete folder"
            accessibilityRole="button"
            onPress={deleteFolder}
            style={({pressed}) => [
              styles.actionItem,
              pressed ? {opacity: 0.72, transform: [{scale: 0.98}]} : null,
            ]}>
            <View style={[styles.actionIcon, styles.dangerIcon]}>
              <HugeiconsIcon
                color={theme.colors.danger}
                icon={Delete02Icon}
                size={20}
                strokeWidth={2.2}
              />
            </View>
            <Text style={[styles.actionText, styles.dangerText]}>
              {deleteArmed ? 'Confirm delete' : 'Delete folder'}
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

function Separator() {
  return <View style={separatorStyles.separator} />;
}

const headerStyles = StyleSheet.create({
  action: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});

const separatorStyles = StyleSheet.create({
  separator: {
    height: 12,
  },
});
