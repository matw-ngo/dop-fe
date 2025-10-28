import { corporateTheme } from "./themes/corporate";
import { creativeTheme } from "./themes/creative";
import { defaultTheme } from "./themes/default";
import { medicalTheme } from "./themes/medical";
import type { ThemeConfig, UserGroup } from "./types";

// All available themes
export const themes: Record<string, ThemeConfig> = {
  default: defaultTheme,
  corporate: corporateTheme,
  creative: creativeTheme,
  medical: medicalTheme,
};

// User groups configuration
export const userGroups: Record<string, UserGroup> = {
  system: {
    id: "system",
    name: "System Users",
    description: "General system users",
    defaultTheme: "default",
    availableThemes: ["default", "corporate", "creative", "medical"],
    customizations: {
      allowCustomColors: false,
      allowCustomFonts: false,
      allowCustomRadius: false,
      brandingRequired: false,
    },
  },
  business: {
    id: "business",
    name: "Business Users",
    description: "Corporate and business professionals",
    defaultTheme: "corporate",
    availableThemes: ["default", "corporate"],
    customizations: {
      allowCustomColors: true,
      allowCustomFonts: false,
      allowCustomRadius: false,
      brandingRequired: true,
    },
  },
  creative: {
    id: "creative",
    name: "Creative Users",
    description: "Designers and creative professionals",
    defaultTheme: "creative",
    availableThemes: ["default", "creative"],
    customizations: {
      allowCustomColors: true,
      allowCustomFonts: true,
      allowCustomRadius: true,
      brandingRequired: false,
    },
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare Users",
    description: "Medical and healthcare professionals",
    defaultTheme: "medical",
    availableThemes: ["default", "medical"],
    customizations: {
      allowCustomColors: false,
      allowCustomFonts: false,
      allowCustomRadius: false,
      brandingRequired: true,
    },
  },
};
