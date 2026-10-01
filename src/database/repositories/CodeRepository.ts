import {CodeItem} from '../entities/CodeItem';
import {Repository, RepositoryQuery} from './Repository';

export type CreateCodeInput = Omit<CodeItem, 'createdAt' | 'id' | 'updatedAt'>;
export type UpdateCodeInput = Partial<Omit<CodeItem, 'createdAt' | 'id'>>;

export interface CodeRepository
  extends Repository<CodeItem, CreateCodeInput, UpdateCodeInput> {
  search(query: RepositoryQuery): Promise<CodeItem[]>;
}
