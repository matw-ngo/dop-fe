import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Spinner } from "./index";

const meta: Meta<typeof Spinner> = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default spinner
export const Default: Story = {
  args: {},
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
      <Spinner className="size-12" />
    </div>
  ),
};

// Colors
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <Spinner color="success" />
      <Spinner color="warning" />
      <Spinner color="error" />
    </div>
  ),
};

// With text
export const WithText: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Spinner />
        <span>Loading...</span>
      </div>
      <div className="flex items-center gap-2">
        <Spinner className="size-4" />
        <span className="text-sm">Processing...</span>
      </div>
      <div className="flex items-center gap-2">
        <Spinner className="size-6" />
        <span className="text-lg">Please wait</span>
      </div>
    </div>
  ),
};

// In button
export const InButton: Story = {
  render: () => (
    <div className="space-y-2 w-48">
      <button
        type="button"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2"
      >
        <Spinner className="size-4 text-white" />
        Loading...
      </button>
      <button
        type="button"
        className="w-full px-4 py-2 bg-gray-600 text-white rounded-md flex items-center justify-center gap-2"
        disabled
      >
        <Spinner className="size-4" />
        Processing...
      </button>
    </div>
  ),
};

// On card
export const OnCard: Story = {
  render: () => (
    <div className="w-96 p-6 border rounded-lg shadow-sm">
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="size-8" />
        <h3 className="text-lg font-semibold">Loading Data</h3>
        <p className="text-sm text-gray-500 text-center">
          Please wait while we fetch your data...
        </p>
      </div>
    </div>
  ),
};

// Full screen overlay
export const FullScreenOverlay: Story = {
  render: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <Spinner className="size-12" />
        <p className="mt-4 text-center">Loading...</p>
      </div>
    </div>
  ),
};

// Custom styled
export const CustomStyled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg">
        <Spinner className="text-blue-500" />
      </div>
      <div className="flex items-center justify-center p-4 bg-gray-900 rounded-lg">
        <Spinner className="text-white size-8" />
      </div>
      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg">
        <Spinner className="text-white size-12" />
      </div>
    </div>
  ),
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);

    const handleLoad = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 3000);
    };

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleLoad}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner className="inline mr-2 size-4 text-white" />
              Loading...
            </>
          ) : (
            "Load Data"
          )}
        </button>
        {loading && (
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">
              Simulating data load... This will take 3 seconds.
            </p>
          </div>
        )}
      </div>
    );
  },
};
