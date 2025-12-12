import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Button } from "../button";
import { Empty } from "./index";

const meta: Meta<typeof Empty> = {
  title: "UI/Empty",
  component: Empty,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Empty state title",
    },
    description: {
      control: "text",
      description: "Empty state description",
    },
    image: {
      control: "text",
      description: "Image URL or emoji",
    },
    action: {
      control: "text",
      description: "Action button text",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Empty>;

// Default empty state
export const Default: Story = {
  args: {
    title: "No data found",
    description: "There's nothing to display here.",
  },
};

// With icon
export const WithIcon: Story = {
  args: {
    image: "📭",
    title: "No messages",
    description: "You don't have any messages yet.",
  },
};

// With custom image
export const WithImage: Story = {
  args: {
    image: "/illustrations/no-data.svg",
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
};

// With action button
export const WithAction: Story = {
  args: {
    image: "📝",
    title: "No posts yet",
    description: "Be the first to share something with the community.",
    action: "Create Post",
  },
  render: (args) => (
    <Empty
      {...args}
      action={
        args.action && (
          <Button onClick={() => alert("Action clicked!")}>
            {args.action}
          </Button>
        )
      }
    />
  ),
};

// Search results empty
export const SearchEmpty: Story = {
  args: {
    image: "🔍",
    title: "No search results",
    description: "We couldn't find anything matching your search.",
    action: "Clear filters",
  },
};

// Table empty state
export const TableEmpty: Story = {
  render: () => (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3}>
              <Empty
                image="📊"
                title="No data to display"
                description="Add some data to see it here."
                action="Add First Row"
                actionButton={<Button size="sm">Add First Row</Button>}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

// Cart empty
export const CartEmpty: Story = {
  args: {
    image: "🛒",
    title: "Your cart is empty",
    description: "Add some products to get started!",
    action: "Start Shopping",
  },
  render: (args) => (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <Empty {...args} />
    </div>
  ),
};

// Error empty state
export const ErrorEmpty: Story = {
  args: {
    image: "⚠️",
    title: "Something went wrong",
    description: "Failed to load data. Please try again.",
    action: "Retry",
  },
  render: (args) => (
    <Empty
      {...args}
      action={
        args.action && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            {args.action}
          </Button>
        )
      }
    />
  ),
};

// Mobile app style
export const MobileStyle: Story = {
  args: {
    image: "📱",
    title: "No notifications",
    description: "You're all caught up!",
    className: "text-center py-12",
  },
};

// Minimal style
export const Minimal: Story = {
  args: {
    title: "Nothing here",
    description: "Check back later.",
    className: "text-gray-500",
  },
};