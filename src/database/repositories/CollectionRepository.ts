import {Collection} from '../entities/Collection';
import {Repository, RepositoryQuery} from './Repository';

export type CreateCollectionInput = Omit<
  Collection,
  'createdAt' | 'id' | 'updatedAt'
>;
export type UpdateCollectionInput = Partial<
  Omit<Collection, 'createdAt' | 'id'>
>;

export interface CollectionRepository
  extends Repository<Collection, CreateCollectionInput, UpdateCollectionInput> {
  addItem(collectionId: string, itemId: string): Promise<Collection>;
  removeItem(collectionId: string, itemId: string): Promise<Collection>;
  search(query: RepositoryQuery): Promise<Collection[]>;
}
