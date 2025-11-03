import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { StoryFn } from "@storybook/react";
import enMessages from "../messages/en.json";

export const withIntl = (Story: StoryFn) => {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {/* @ts-ignore */}
      <Story />
    </NextIntlClientProvider>
  );
};
