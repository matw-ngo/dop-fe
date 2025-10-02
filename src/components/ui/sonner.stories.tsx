import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./sonner";
import { Button } from "./button";
import { toast } from "sonner";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner (Toasts)",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="space-x-2">
        <Button
          variant="outline"
          onClick={() => toast("Event has been created.")}
        >
          Show Default Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Event has been created.")}
        >
          Show Success Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Event has failed to create.")}
        >
          Show Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", {
              action: { label: "Undo", onClick: () => console.log("Undo") },
            })
          }
        >
          Show With Action
        </Button>
      </div>
    </>
  ),
};
