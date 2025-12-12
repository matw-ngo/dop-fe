import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import "../src/app/globals.css";
import { withTheme } from "./theme-decorator";
import { withIntl } from "./intl-decorator";

// Ensure CSS variables are set before component renders
const ensureCSSVariables = () => {
  // Apply default theme CSS variables if not already set
  const root = document.documentElement;

  // Primary color variables
  const primaryColors = {
    '--color-primary-50': '#eff6ff',
    '--color-primary-100': '#dbeafe',
    '--color-primary-200': '#bfdbfe',
    '--color-primary-300': '#93c5fd',
    '--color-primary-400': '#60a5fa',
    '--color-primary-500': '#3b82f6',
    '--color-primary-600': '#2563eb',
    '--color-primary-700': '#1d4ed8',
    '--color-primary-800': '#1e40af',
    '--color-primary-900': '#1e3a8a',
    '--color-primary-950': '#172554',
    '--color-primary': '#3b82f6',
  };

  // Gray color variables
  const grayColors = {
    '--color-gray-50': '#f9fafb',
    '--color-gray-100': '#f3f4f6',
    '--color-gray-200': '#e5e7eb',
    '--color-gray-300': '#d1d5db',
    '--color-gray-400': '#9ca3af',
    '--color-gray-500': '#6b7280',
    '--color-gray-600': '#4b5563',
    '--color-gray-700': '#374151',
    '--color-gray-800': '#1f2937',
    '--color-gray-900': '#111827',
    '--color-gray-950': '#030712',
    '--color-gray': '#6b7280',
  };

  // Apply colors to root
  Object.entries({ ...primaryColors, ...grayColors }).forEach(([key, value]) => {
    if (!root.style.getPropertyValue(key)) {
      root.style.setProperty(key, value);
    }
  });
};

// Run before stories render
if (typeof window !== 'undefined') {
  ensureCSSVariables();
}

const customViewports = {
  iphone14: {
    name: "iPhone 14",
    styles: {
      width: "390px",
      height: "844px",
    },
    type: "mobile",
  },
  pixel7: {
    name: "Pixel 7",
    styles: {
      width: "412px",
      height: "915px",
    },
    type: "mobile",
  },
  ipadMini: {
    name: "iPad Mini",
    styles: {
      width: "768px",
      height: "1024px",
    },
    type: "tablet",
  },
  laptop: {
    name: 'Laptop 13"',
    styles: {
      width: "1280px",
      height: "800px",
    },
    type: "desktop",
  },
  desktop: {
    name: 'Desktop 24"',
    styles: {
      width: "1920px",
      height: "1080px",
    },
    type: "desktop",
  },
};

const preview: Preview = {
  decorators: [withIntl, withTheme],
  parameters: {
    viewport: {
      viewports: {
        ...customViewports,
        ...INITIAL_VIEWPORTS,
      },
    },
    nextjs: {
      appDirectory: true,
      router: {
        pathname: "/",
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Disable default backgrounds since we're using themes
    },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "default",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default Theme" },
          { value: "corporate", title: "Corporate Theme" },
          { value: "creative", title: "Creative Theme" },
          { value: "medical", title: "Medical Theme" },
        ],
        dynamicTitle: true,
      },
    },
    userGroup: {
      description: "User group for theme permissions",
      defaultValue: "system",
      toolbar: {
        title: "User Group",
        icon: "user",
        items: [
          { value: "system", title: "System Users" },
          { value: "business", title: "Business Users" },
          { value: "creative", title: "Creative Users" },
          { value: "healthcare", title: "Healthcare Users" },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Light/Dark mode",
      defaultValue: "light",
      toolbar: {
        title: "Mode",
        icon: "moon",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
