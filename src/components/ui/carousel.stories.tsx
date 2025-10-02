import type { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import { Card, CardContent } from "./card";
import Autoplay from "embla-carousel-autoplay";

const meta: Meta<typeof Carousel> = {
  title: "UI/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const CarouselContentItems = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <CarouselItem key={index}>
        <div className="p-1">
          <Card>
            <CardContent className="flex aspect-square items-center justify-center p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    ))}
  </>
);

export const Default: Story = {
  render: (args) => (
    <Carousel {...args} className="w-full max-w-xs">
      <CarouselContent>
        <CarouselContentItems />
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const Sized: Story = {
  name: "With Custom Sizes",
  render: (args) => (
    <Carousel
      {...args}
      opts={{
        align: "start",
      }}
      className="w-full max-w-sm"
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const Vertical: Story = {
  name: "Vertical Orientation",
  render: (args) => (
    <Carousel {...args} orientation="vertical" className="w-full max-w-xs">
      <CarouselContent className="-mt-1 h-[200px]">
        <CarouselContentItems />
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const WithAutoplay: Story = {
  name: "With Autoplay Plugin",
  render: (args) => (
    <Carousel
      {...args}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full max-w-xs"
    >
      <CarouselContent>
        <CarouselContentItems />
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
