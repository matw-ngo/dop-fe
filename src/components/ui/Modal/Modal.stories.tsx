import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../button";
import Modal from "./index";

const meta: Meta<typeof Modal> = {
  title: "UI/modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isShow: {
      control: "boolean",
      description: "Controls modal visibility",
      defaultValue: false,
    },
    onClose: {
      action: "closed",
      description: "Callback when modal is closed",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for modal card",
    },
    bodyClassName: {
      control: "text",
      description: "Additional CSS classes for modal body",
    },
    backgroundClassName: {
      control: "text",
      description: "Additional CSS classes for modal background",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic modal
export const Default: Story = {
  render: (args) => {
    const [isShow, setIsShow] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsShow(true)}>Open Modal</Button>
        <Modal
          {...args}
          isShow={isShow}
          onClose={() => {
            setIsShow(false);
            args.onClose?.();
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Modal Title</h2>
            <p className="text-gray-600">
              This is the modal content. You can put any content here.
            </p>
          </div>
        </Modal>
      </div>
    );
  },
};

// Without close button
export const WithoutCloseButton: Story = {
  render: (args) => {
    const [isShow, setIsShow] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsShow(true)}>Open Modal</Button>
        <Modal
          {...args}
          isShow={isShow}
          onClose={() => {
            setIsShow(false);
            args.onClose?.();
          }}
          components={{
            modalClose: null,
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">No Close Button</h2>
            <p className="text-gray-600 mb-4">
              This modal doesn't have a close button. You can only close it by
              clicking the backdrop.
            </p>
            <Button onClick={() => setIsShow(false)}>Close</Button>
          </div>
        </Modal>
      </div>
    );
  },
};

// Prevent close on backdrop
export const PreventCloseOnBackdrop: Story = {
  render: (args) => {
    const [isShow, setIsShow] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsShow(true)}>Open Modal</Button>
        <Modal
          {...args}
          isShow={isShow}
          backgroundClassName="pointer-events-none"
          onClose={() => {
            setIsShow(false);
            args.onClose?.();
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Can't Close on Backdrop
            </h2>
            <p className="text-gray-600 mb-4">
              This modal can't be closed by clicking the backdrop. Use the close
              button.
            </p>
            <Button onClick={() => setIsShow(false)}>Close</Button>
          </div>
        </Modal>
      </div>
    );
  },
};

// Different sizes
export const Sizes: Story = {
  render: (args) => {
    const [isShow, setIsShow] = useState(false);
    const [size, setSize] = useState<"sm" | "md" | "lg" | "xl">("md");

    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
    };

    return (
      <div className="space-4">
        <div className="flex gap-2">
          {Object.keys(sizeClasses).map((s) => (
            <Button
              key={s}
              variant={size === s ? "default" : "outline"}
              onClick={() => setSize(s as typeof size)}
            >
              {s.toUpperCase()}
            </Button>
          ))}
          <Button onClick={() => setIsShow(true)}>Open Modal</Button>
        </div>
        <Modal
          {...args}
          isShow={isShow}
          className={sizeClasses[size]}
          onClose={() => {
            setIsShow(false);
            args.onClose?.();
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Modal Size: {size.toUpperCase()}
            </h2>
            <p className="text-gray-600">
              This is a {size} sized modal. The size is controlled by the
              max-width class.
            </p>
          </div>
        </Modal>
      </div>
    );
  },
};

// Custom content
export const CustomContent: Story = {
  render: (args) => {
    const [isShow, setIsShow] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsShow(true)}>Open Form Modal</Button>
        <Modal
          {...args}
          isShow={isShow}
          onClose={() => {
            setIsShow(false);
            args.onClose?.();
          }}
        >
          <div className="p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setIsShow(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your message"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsShow(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    );
  },
};

// Confirmation dialog
export const ConfirmationDialog: Story = {
  render: (args) => {
    const [isShow, setIsShow] = useState(false);

    const handleConfirm = () => {
      alert("Confirmed!");
      setIsShow(false);
    };

    return (
      <div>
        <Button variant="destructive" onClick={() => setIsShow(true)}>
          Delete Item
        </Button>
        <Modal
          {...args}
          isShow={isShow}
          onClose={() => {
            setIsShow(false);
            args.onClose?.();
          }}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Confirm Delete</h2>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this item? All associated data
              will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsShow(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};
