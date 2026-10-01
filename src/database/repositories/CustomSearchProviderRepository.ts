import {CustomSearchProvider} from '../entities/CustomSearchProvider';
import {Repository} from './Repository';

export type CreateCustomSearchProviderInput = Omit<CustomSearchProvider, 'id'>;
export type UpdateCustomSearchProviderInput = Partial<
  Omit<CustomSearchProvider, 'id'>
>;

export interface CustomSearchProviderRepository
  extends Repository<
    CustomSearchProvider,
    CreateCustomSearchProviderInput,
    UpdateCustomSearchProviderInput
  > {}
