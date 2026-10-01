export type LocalDatabaseAdapter<TSchema> = {
  close(): Promise<void>;
  getSnapshot(): Promise<TSchema>;
  initialize(): Promise<void>;
  migrate(): Promise<void>;
  updateSnapshot(updater: (snapshot: TSchema) => TSchema): Promise<TSchema>;
};
