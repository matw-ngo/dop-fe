import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import "../src/app/globals.css";
import { withTheme } from "./theme-decorator";

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
  decorators: [withTheme],
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
