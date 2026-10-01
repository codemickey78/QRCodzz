import {createEntityId} from '../../utils/id';
import {nowIso} from '../../utils/date';
import {LocalDatabase} from '../adapters/LocalDatabase';
import {Folder} from '../entities/Folder';
import {
  CreateFolderInput,
  FolderRepository,
  UpdateFolderInput,
} from './FolderRepository';
import {RepositoryQuery} from './Repository';

export class LocalFolderRepository implements FolderRepository {
  constructor(private readonly database: LocalDatabase) {}

  async create(input: CreateFolderInput) {
    const timestamp = nowIso();
    const folder: Folder = {
      ...input,
      id: createEntityId('folder'),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      folders: [...snapshot.folders, folder],
    }));

    return folder;
  }

  async delete(id: string) {
    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      codes: snapshot.codes.map(code =>
        code.folderId === id ? {...code, folderId: undefined} : code,
      ),
      folders: snapshot.folders.filter(folder => folder.id !== id),
    }));
  }

  async getAll(query?: RepositoryQuery) {
    const {folders} = await this.database.getSnapshot();
    const search = query?.search?.toLowerCase();
    const filtered = search
      ? folders.filter(folder => folder.name.toLowerCase().includes(search))
      : folders;
    const offset = query?.offset ?? 0;
    return filtered.slice(offset, offset + (query?.limit ?? filtered.length));
  }

  async getById(id: string) {
    const {folders} = await this.database.getSnapshot();
    return folders.find(folder => folder.id === id);
  }

  async update(id: string, input: UpdateFolderInput) {
    let updatedFolder: Folder | undefined;

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      folders: snapshot.folders.map(folder => {
        if (folder.id !== id) {
          return folder;
        }

        updatedFolder = {
          ...folder,
          ...input,
          id,
          createdAt: folder.createdAt,
          updatedAt: nowIso(),
        };

        return updatedFolder;
      }),
    }));

    if (!updatedFolder) {
      throw new Error(`Folder not found: ${id}`);
    }

    return updatedFolder;
  }
}
