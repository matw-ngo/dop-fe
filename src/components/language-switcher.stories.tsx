import type { Meta, StoryObj } from "@storybook/react";
import LanguageSwitcher from "./language-switcher";
import { NextIntlClientProvider } from "next-intl";
import { fn } from "@storybook/test";

// Mock messages for the provider
const messages = {
  en: {},
  vi: {},
};

const meta: Meta<typeof LanguageSwitcher> = {
  title: "App/LanguageSwitcher",
  component: LanguageSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    // Mock next/navigation
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/en",
        replace: fn(),
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      const locale = globals.locale || "en";
      return (
        <NextIntlClientProvider
          locale={locale}
          messages={messages[locale as keyof typeof messages]}
        >
          <Story />
        </NextIntlClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof LanguageSwitcher>;

export const Default: Story = {
  render: () => <LanguageSwitcher />,
};
