// Theme system types
export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;

  // Component colors
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;

  // Semantic colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;

  // Utility colors
  border: string;
  input: string;
  ring: string;

  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  // Sidebar colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  group: string; // User group this theme belongs to
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fonts?: {
    sans?: string;
    mono?: string;
  };
  radius?: string;
  animations?: Record<string, string>;
  customCSS?: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  defaultTheme: string;
  availableThemes: string[];
  customizations?: {
    allowCustomColors?: boolean;
    allowCustomFonts?: boolean;
    allowCustomRadius?: boolean;
    brandingRequired?: boolean;
  };
}

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeState {
  currentTheme: string;
  userGroup: string;
  customizations?: Partial<ThemeColors>;
}
