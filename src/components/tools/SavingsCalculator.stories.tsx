import type { Meta, StoryObj } from "@storybook/react";
import { SavingsCalculator } from "./SavingsCalculator";

const meta: Meta<typeof SavingsCalculator> = {
  title: "Tools/SavingsCalculator",
  component: SavingsCalculator,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A comprehensive savings calculator component that allows users to compare savings rates from different banks.

## Features
- Amount slider with input field (10M - 1000M VND)
- Period selection (1, 3, 6, 9, 12, 18, 24 months)
- Savings type toggle (Counter/Online)
- Sort options (rate ascending/descending)
- Results table with pagination
- Min/max rate highlighting
- Summary statistics
- External links to bank applications
- Loading states and error handling
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: "max-w-6xl mx-auto",
  },
};
