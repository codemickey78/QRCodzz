export type Template = {
  id: string;
  name: string;
  category: string;
  configuration: Record<string, unknown>;
  isBuiltIn: boolean;
};
