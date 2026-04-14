import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../button";
import { ButtonGroup } from "./index";

const meta: Meta<typeof ButtonGroup> = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
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

// Basic button group
export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button>Middle</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

// With variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <ButtonGroup>
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </ButtonGroup>
    </div>
  ),
};

// With sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ButtonGroup>
        <Button size="sm">Small</Button>
        <Button size="sm">Small</Button>
        <Button size="sm">Small</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="default">Default</Button>
        <Button size="default">Default</Button>
        <Button size="default">Default</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="lg">Large</Button>
        <Button size="lg">Large</Button>
        <Button size="lg">Large</Button>
      </ButtonGroup>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Home
      </Button>
      <Button>
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        Analytics
      </Button>
      <Button variant="outline">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Settings
      </Button>
    </ButtonGroup>
  ),
};

// Vertical orientation
export const Vertical: Story = {
  render: () => (
    <div className="flex gap-4">
      <ButtonGroup className="flex-col">
        <Button>Top</Button>
        <Button>Middle</Button>
        <Button>Bottom</Button>
      </ButtonGroup>
      <ButtonGroup className="flex-col">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    </div>
  ),
};

// With disabled state
export const WithDisabled: Story = {
  render: () => (
    <ButtonGroup>
      <Button>Enabled</Button>
      <Button disabled>Disabled</Button>
      <Button>Enabled</Button>
    </ButtonGroup>
  ),
};

// With loading state
export const WithLoading: Story = {
  render: () => (
    <ButtonGroup>
      <Button>Cancel</Button>
      <Button disabled>
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading...
      </Button>
    </ButtonGroup>
  ),
};

// Segmented control style
export const Segmented: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");

    return (
      <ButtonGroup className="p-1 bg-gray-100 rounded-lg">
        {["option1", "option2", "option3"].map((option) => (
          <Button
            key={option}
            variant={selected === option ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelected(option)}
            className={
              selected === option ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }
          >
            {option === "option1" && "Day"}
            {option === "option2" && "Week"}
            {option === "option3" && "Month"}
          </Button>
        ))}
      </ButtonGroup>
    );
  },
};

// Number stepper
export const NumberStepper: Story = {
  render: () => {
    const [value, setValue] = useState(0);

    return (
      <ButtonGroup className="w-32">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setValue(Math.max(0, value - 1))}
          className="flex-1"
        >
          −
        </Button>
        <Button variant="outline" size="sm" className="flex-1 cursor-default">
          {value}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setValue(value + 1)}
          className="flex-1"
        >
          +
        </Button>
      </ButtonGroup>
    );
  },
};

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("tab1");
    const tabs = [
      { id: "tab1", label: "Overview", icon: "📊" },
      { id: "tab2", label: "Details", icon: "📝" },
      { id: "tab3", label: "Settings", icon: "⚙️" },
    ];

    return (
      <div className="space-y-4">
        <ButtonGroup>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1"
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </ButtonGroup>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">
            Content for: {tabs.find((t) => t.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-gray-600">
            This is the content that would be displayed when the{" "}
            {tabs.find((t) => t.id === activeTab)?.label} tab is active.
          </p>
        </div>
      </div>
    );
  },
};
