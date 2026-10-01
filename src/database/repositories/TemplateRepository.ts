import {Template} from '../entities/Template';
import {Repository, RepositoryQuery} from './Repository';

export type CreateTemplateInput = Omit<Template, 'id'>;
export type UpdateTemplateInput = Partial<Omit<Template, 'id'>>;

export interface TemplateRepository
  extends Repository<Template, CreateTemplateInput, UpdateTemplateInput> {
  getBuiltIns(): Promise<Template[]>;
  search(query: RepositoryQuery): Promise<Template[]>;
}
