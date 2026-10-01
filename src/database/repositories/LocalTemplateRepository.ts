import {createEntityId} from '../../utils/id';
import {LocalDatabase} from '../adapters/LocalDatabase';
import {Template} from '../entities/Template';
import {RepositoryQuery} from './Repository';
import {
  CreateTemplateInput,
  TemplateRepository,
  UpdateTemplateInput,
} from './TemplateRepository';

export class LocalTemplateRepository implements TemplateRepository {
  constructor(private readonly database: LocalDatabase) {}

  async create(input: CreateTemplateInput) {
    const template: Template = {
      ...input,
      id: createEntityId('template'),
    };

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      templates: [...snapshot.templates, template],
    }));

    return template;
  }

  async delete(id: string) {
    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      templates: snapshot.templates.filter(template => template.id !== id),
    }));
  }

  async getAll(query?: RepositoryQuery) {
    const {templates} = await this.database.getSnapshot();
    return this.applyQuery(templates, query);
  }

  async getBuiltIns() {
    const {templates} = await this.database.getSnapshot();
    return templates.filter(template => template.isBuiltIn);
  }

  async getById(id: string) {
    const {templates} = await this.database.getSnapshot();
    return templates.find(template => template.id === id);
  }

  async search(query: RepositoryQuery) {
    return this.getAll(query);
  }

  async update(id: string, input: UpdateTemplateInput) {
    let updatedTemplate: Template | undefined;

    await this.database.updateSnapshot(snapshot => ({
      ...snapshot,
      templates: snapshot.templates.map(template => {
        if (template.id !== id) {
          return template;
        }

        updatedTemplate = {
          ...template,
          ...input,
          id,
        };

        return updatedTemplate;
      }),
    }));

    if (!updatedTemplate) {
      throw new Error(`Template not found: ${id}`);
    }

    return updatedTemplate;
  }

  private applyQuery(templates: Template[], query?: RepositoryQuery) {
    const search = query?.search?.trim().toLowerCase();
    const filtered = search
      ? templates.filter(template =>
          [template.name, template.category].some(value =>
            value.toLowerCase().includes(search),
          ),
        )
      : templates;
    const offset = query?.offset ?? 0;
    return filtered.slice(offset, offset + (query?.limit ?? filtered.length));
  }
}
