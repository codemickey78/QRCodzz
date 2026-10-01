export type RepositoryQuery = {
  limit?: number;
  offset?: number;
  search?: string;
};

export interface Repository<TEntity, TCreate, TUpdate> {
  create(input: TCreate): Promise<TEntity>;
  delete(id: string): Promise<void>;
  getAll(query?: RepositoryQuery): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | undefined>;
  update(id: string, input: TUpdate): Promise<TEntity>;
}
