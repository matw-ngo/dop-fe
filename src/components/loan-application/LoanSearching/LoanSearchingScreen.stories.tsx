import type { Meta, StoryObj } from "@storybook/react";
import { LoanSearchingScreen } from "./LoanSearchingScreen";
import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { defaultTheme } from "@/components/form-generation/themes/default";
import { finzoneTheme } from "@/configs/themes/finzone-theme";

const meta = {
  title: "Loan Application/LoanSearchingScreen",
  component: LoanSearchingScreen,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Loan Searching Screen displays a loading state while the system searches for matching loans.

## Features
- Uses theme system for consistent styling
- Supports i18n translations
- Responsive design
- Customizable message
- Accessible with proper ARIA labels

## Usage
\`\`\`tsx
import { LoanSearchingScreen } from "@/components/loan-application/LoanSearching";

<LoanSearchingScreen />
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <FormThemeProvider theme={defaultTheme}>
        <Story />
      </FormThemeProvider>
    ),
  ],
} satisfies Meta<typeof LoanSearchingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default loan searching screen with default theme
 */
export const Default: Story = {
  args: {},
};

/**
 * With custom message
 */
export const CustomMessage: Story = {
  args: {
    message: "Đang xử lý yêu cầu của bạn, vui lòng đợi...",
  },
};

/**
 * With Finzone theme
 */
export const FinzoneTheme: Story = {
  args: {},
  decorators: [
    (Story) => (
      <FormThemeProvider theme={finzoneTheme}>
        <Story />
      </FormThemeProvider>
    ),
  ],
};

/**
 * With custom styling
 */
export const CustomStyling: Story = {
  args: {
    className: "bg-gradient-to-br from-blue-50 to-indigo-50",
  },
};

/**
 * Mobile view
 */
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

/**
 * Tablet view
 */
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
