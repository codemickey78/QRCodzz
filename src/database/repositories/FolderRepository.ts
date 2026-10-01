import {Folder} from '../entities/Folder';
import {Repository} from './Repository';

export type CreateFolderInput = Omit<Folder, 'createdAt' | 'id' | 'updatedAt'>;
export type UpdateFolderInput = Partial<Omit<Folder, 'createdAt' | 'id'>>;

export interface FolderRepository
  extends Repository<Folder, CreateFolderInput, UpdateFolderInput> {}
