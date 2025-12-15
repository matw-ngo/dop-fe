// Theme system exports

export { ThemeCustomizer } from "@/components/theme/theme-customizer";
// Re-export theme components
export { ThemeSelector } from "@/components/theme/theme-selector";

// Export from context.tsx (legacy context)
export { useTheme as useLegacyTheme, ThemeProvider as LegacyThemeProvider } from "./context";

// Export from index.tsx (new unified theme system)
export { useTheme, ThemeProvider, useThemeUtils } from "./index";

// Export other modules
export * from "./themes";
export * from "./types";
export * from "./utils";

// Export storage migration utilities
export {
  ThemeStorageMigration,
  runThemeMigration,
  isThemeMigrationNeeded,
  getThemeMigrationStatus,
  rollbackThemeMigration,
  clearMigrationRollback,
  type MigrationResult,
  type RollbackData,
  MIGRATION_VERSION,
} from "./storage-migration";

// Export migration integration components
export {
  MigrationProvider,
  ThemeProviderWithMigration,
  useThemeMigration,
  MigrationDebugger,
  initializeThemeMigration,
} from "./migration-integration";
