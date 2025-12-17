import type { StoryFn } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import { useEffect } from "react";
import enMessages from "./messages/en.json";

export const withIntl = (Story: StoryFn) => {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {/* @ts-ignore */}
      <Story />
    </NextIntlClientProvider>
  );
};
