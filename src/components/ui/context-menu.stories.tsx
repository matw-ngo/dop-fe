import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";

const meta: Meta<typeof ContextMenu> = {
  title: "UI/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

const ContextMenuContentComponent = () => {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showActivityBar, setShowActivityBar] = React.useState(false);
  const [person, setPerson] = React.useState("pedro");

  return (
    <ContextMenuContent className="w-64">
      <ContextMenuItem inset>
        Back
        <ContextMenuShortcut>⌘[</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset disabled>
        Forward
        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset>
        Reload
        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-48">
          <ContextMenuItem>
            Save Page As...
            <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Create Shortcut...</ContextMenuItem>
          <ContextMenuItem>Name Window...</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Developer Tools</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem
        checked={showStatusBar}
        onCheckedChange={setShowStatusBar}
      >
        Show Status Bar
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        checked={showActivityBar}
        onCheckedChange={setShowActivityBar}
        disabled
      >
        Show Activity Bar
      </ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
        <ContextMenuLabel inset>People</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
        <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    </ContextMenuContent>
  );
};

export const Default: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContentComponent />
    </ContextMenu>
  ),
};
