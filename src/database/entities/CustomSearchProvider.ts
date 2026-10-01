export type CustomSearchProvider = {
  id: string;
  name: string;
  urlTemplate: string;
  supportedFormats: string[];
  enabled: boolean;
};
