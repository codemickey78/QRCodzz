export const FileSystemService = {
  async ensureWorkspaceDirectories() {
    return {
      backups: 'QRCodzz/Backups',
      exports: 'QRCodzz/Exports',
      printSheets: 'QRCodzz/PrintSheets',
    };
  },

  buildWorkspacePath(directory: string, filename: string) {
    return `${directory}/${sanitizeFilename(filename)}`;
  },
};

export function sanitizeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'export'
  );
}
