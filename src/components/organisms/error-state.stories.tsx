import type { Meta, StoryObj } from "@storybook/react";
import { ErrorState } from "./error-state";
import { Card } from "@/components/ui/card";

// Mock translation function for Storybook
const t = (key: string) => {
  const translations: Record<string, string> = {
    defaultTitle: "An Unexpected Error Occurred",
    description: "Please try again. If the problem persists, contact support.",
    showDetails: "Show Details",
    hideDetails: "Hide Details",
    retryButton: "Retry",
  };
  return translations[key] || key;
};

const meta: Meta<typeof ErrorState> = {
  title: "Organisms/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Card className="w-[700px]">
        <Story />
      </Card>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    onRetry: { action: "retried" },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
    title: "Could Not Load Data",
    message: "A network error occurred (DNS_PROBE_FINISHED_NO_INTERNET)",
    onRetry: () => alert("Retry clicked!"),
    t: t,
  },
};

export const WithLongMessage: Story = {
  name: "With a Long Message",
  args: {
    ...Default.args,
    message: `TypeError: Failed to fetch\n    at getFlowByDomain (http://localhost:6006/src/hooks/useFlow.ts:12:19)\n    at http://localhost:6006/node_modules/.cache/sb-vite/deps/@tanstack_react-query.js?v=3a05c58c:12:109\n    at Object.fetchFn (http://localhost:6006/node_modules/.cache/sb-vite/deps/@tanstack_react-query.js?v=3a05c58c:12:120)`,
    t: t,
  },
};
