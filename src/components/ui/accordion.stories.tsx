import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: { type: "radio" },
      options: ["single", "multiple"],
      description:
        "Determines whether one or multiple items can be opened at the same time.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const AccordionContentItems = () => (
  <>
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Is it styled?</AccordionTrigger>
      <AccordionContent>
        Yes. It comes with default styles that matches the other components'
        aesthetic.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Is it animated?</AccordionTrigger>
      <AccordionContent>
        Yes. It's animated by default, but you can disable it if you prefer.
      </AccordionContent>
    </AccordionItem>
  </>
);

export const Default: Story = {
  name: "Default (Single, Non-collapsible)",
  args: {
    type: "single",
    defaultValue: "item-1",
    className: "w-[300px]",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionContentItems />
    </Accordion>
  ),
};

export const Collapsible: Story = {
  name: "Single, Collapsible",
  args: {
    type: "single",
    collapsible: true,
    className: "w-[300px]",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionContentItems />
    </Accordion>
  ),
};

export const Multiple: Story = {
  name: "Multiple",
  args: {
    type: "multiple",
    defaultValue: ["item-1"],
    className: "w-[300px]",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionContentItems />
    </Accordion>
  ),
};
