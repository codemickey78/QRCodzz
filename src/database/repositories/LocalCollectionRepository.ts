import {createEntityId} from '../../utils/id';
import {nowIso} from '../../utils/date';
import {LocalDatabase} from '../adapters/LocalDatabase';
import {Collection} from '../entities/Collection';
import {
  CollectionRepository,
  CreateCollectionInput,
  UpdateCollectionInput,
} from './CollectionRepository';
import {RepositoryQuery} from './Repository';

export class LocalCollectionRepository implements CollectionRepository {
  constructor(private readonly database: LocalDatabase) {}

  async addItem(collectionId: string, itemId: string) {
    const collection = await this.getById(collectionId);

    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    return this.update(collectionId, {
      itemIds: dedupeIds([...collection.itemIds, itemId]),
    });
  }

  async create(input: CreateCollectionInput) {
    const timestamp = nowIso();
    const collection: Collection = {
      ...input,
      id: createEntityId('collection'),
      itemIds: dedupeIds(input.itemIds),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      collections: [collection, ...(snapshot.collections ?? [])],
    }));

    return collection;
  }

  async delete(id: string) {
    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      collections: (snapshot.collections ?? []).filter(
        collection => collection.id !== id,
      ),
    }));
  }

  async getAll(query?: RepositoryQuery) {
    const {collections = []} = await this.database.getSnapshot();
    return this.applyQuery(collections, query);
  }

  async getById(id: string) {
    const {collections = []} = await this.database.getSnapshot();
    return collections.find(collection => collection.id === id);
  }

  async removeItem(collectionId: string, itemId: string) {
    const collection = await this.getById(collectionId);

    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    return this.update(collectionId, {
      itemIds: collection.itemIds.filter(id => id !== itemId),
    });
  }

  async search(query: RepositoryQuery) {
    return this.getAll(query);
  }

  async update(id: string, input: UpdateCollectionInput) {
    let updatedCollection: Collection | undefined;

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      collections: (snapshot.collections ?? []).map(collection => {
        if (collection.id !== id) {
          return collection;
        }

        updatedCollection = {
          ...collection,
          ...input,
          id,
          createdAt: collection.createdAt,
          itemIds: input.itemIds
            ? dedupeIds(input.itemIds)
            : collection.itemIds,
          updatedAt: nowIso(),
        };

        return updatedCollection;
      }),
    }));

    if (!updatedCollection) {
      throw new Error(`Collection not found: ${id}`);
    }

    return updatedCollection;
  }

  private applyQuery(collections: Collection[], query?: RepositoryQuery) {
    const search = query?.search?.trim().toLowerCase();
    const filtered = search
      ? collections.filter(collection =>
          [collection.title, collection.description ?? ''].some(value =>
            value.toLowerCase().includes(search),
          ),
        )
      : collections;
    const offset = query?.offset ?? 0;
    return filtered.slice(offset, offset + (query?.limit ?? filtered.length));
  }
}

function dedupeIds(ids: string[]) {
  return [...new Set(ids.filter(Boolean))];
}
