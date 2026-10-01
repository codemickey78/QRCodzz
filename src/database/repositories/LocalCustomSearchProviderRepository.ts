import {createEntityId} from '../../utils/id';
import {LocalDatabase} from '../adapters/LocalDatabase';
import {CustomSearchProvider} from '../entities/CustomSearchProvider';
import {
  CreateCustomSearchProviderInput,
  CustomSearchProviderRepository,
  UpdateCustomSearchProviderInput,
} from './CustomSearchProviderRepository';
import {RepositoryQuery} from './Repository';

export class LocalCustomSearchProviderRepository
  implements CustomSearchProviderRepository
{
  constructor(private readonly database: LocalDatabase) {}

  async create(input: CreateCustomSearchProviderInput) {
    const provider: CustomSearchProvider = {
      ...input,
      id: createEntityId('search-provider'),
    };

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      customSearchProviders: [...snapshot.customSearchProviders, provider],
    }));

    return provider;
  }

  async delete(id: string) {
    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      customSearchProviders: snapshot.customSearchProviders.filter(
        provider => provider.id !== id,
      ),
    }));
  }

  async getAll(query?: RepositoryQuery) {
    const {customSearchProviders} = await this.database.getSnapshot();
    const search = query?.search?.toLowerCase();
    const filtered = search
      ? customSearchProviders.filter(provider =>
          provider.name.toLowerCase().includes(search),
        )
      : customSearchProviders;
    const offset = query?.offset ?? 0;
    return filtered.slice(offset, offset + (query?.limit ?? filtered.length));
  }

  async getById(id: string) {
    const {customSearchProviders} = await this.database.getSnapshot();
    return customSearchProviders.find(provider => provider.id === id);
  }

  async update(id: string, input: UpdateCustomSearchProviderInput) {
    let updatedProvider: CustomSearchProvider | undefined;

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      customSearchProviders: snapshot.customSearchProviders.map(provider => {
        if (provider.id !== id) {
          return provider;
        }

        updatedProvider = {...provider, ...input, id};
        return updatedProvider;
      }),
    }));

    if (!updatedProvider) {
      throw new Error(`Search provider not found: ${id}`);
    }

    return updatedProvider;
  }
}
