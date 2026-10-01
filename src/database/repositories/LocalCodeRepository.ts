import {createEntityId} from '../../utils/id';
import {nowIso} from '../../utils/date';
import {LocalDatabase} from '../adapters/LocalDatabase';
import {CodeItem} from '../entities/CodeItem';
import {CodeRepository, CreateCodeInput, UpdateCodeInput} from './CodeRepository';
import {RepositoryQuery} from './Repository';

export class LocalCodeRepository implements CodeRepository {
  constructor(private readonly database: LocalDatabase) {}

  async create(input: CreateCodeInput) {
    const timestamp = nowIso();
    const code: CodeItem = {
      ...input,
      id: createEntityId('code'),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      codes: [code, ...snapshot.codes],
    }));

    return code;
  }

  async delete(id: string) {
    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      codes: snapshot.codes.filter(code => code.id !== id),
    }));
  }

  async getAll(query?: RepositoryQuery) {
    const {codes} = await this.database.getSnapshot();
    return this.applyQuery(codes, query);
  }

  async getById(id: string) {
    const {codes} = await this.database.getSnapshot();
    return codes.find(code => code.id === id);
  }

  async search(query: RepositoryQuery) {
    return this.getAll(query);
  }

  async update(id: string, input: UpdateCodeInput) {
    let updatedCode: CodeItem | undefined;

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      codes: snapshot.codes.map(code => {
        if (code.id !== id) {
          return code;
        }

        updatedCode = {
          ...code,
          ...input,
          id,
          createdAt: code.createdAt,
          updatedAt: nowIso(),
        };

        return updatedCode;
      }),
    }));

    if (!updatedCode) {
      throw new Error(`Code not found: ${id}`);
    }

    return updatedCode;
  }

  private applyQuery(codes: CodeItem[], query?: RepositoryQuery) {
    const normalizedSearch = query?.search?.trim().toLowerCase();
    const filteredCodes = normalizedSearch
      ? codes.filter(code =>
          [code.title, code.description, code.content, code.format]
            .filter(Boolean)
            .some(value => value?.toLowerCase().includes(normalizedSearch)),
        )
      : codes;

    const offset = query?.offset ?? 0;
    const limit = query?.limit ?? filteredCodes.length;
    return filteredCodes.slice(offset, offset + limit);
  }
}
