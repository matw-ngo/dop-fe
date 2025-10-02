import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { ChartConfig } from "./chart";

const meta: Meta<typeof ChartContainer> = {
  title: "UI/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

export const BarChartVertical: Story = {
  name: "Bar Chart (Vertical)",
  args: {
    config: chartConfig,
    className: "min-h-[200px] w-full max-w-lg",
  },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

export const BarChartHorizontal: Story = {
  name: "Bar Chart (Horizontal)",
  args: {
    config: chartConfig,
    className: "min-h-[200px] w-full max-w-lg",
  },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="month"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <XAxis type="number" hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="desktop"
          layout="vertical"
          fill="var(--color-desktop)"
          radius={4}
        />
        <Bar
          dataKey="mobile"
          layout="vertical"
          fill="var(--color-mobile)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  ),
};

export const LineChartStory: Story = {
  name: "Line Chart",
  args: {
    config: chartConfig,
    className: "min-h-[200px] w-full max-w-lg",
  },
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="desktop"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="mobile"
          stroke="var(--color-mobile)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  ),
};

export const PieChartStory: Story = {
  name: "Pie Chart",
  args: {
    config: chartConfig,
    className: "mx-auto aspect-square max-h-[250px]",
  },
  render: (args) => (
    <ChartContainer {...args}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="desktop" />} />
        <Pie
          data={chartData}
          dataKey="desktop"
          nameKey="month"
          innerRadius={60}
        />
      </PieChart>
    </ChartContainer>
  ),
};

export const RadarChartStory: Story = {
  name: "Radar Chart",
  args: {
    config: chartConfig,
    className: "mx-auto aspect-square max-h-[250px]",
  },
  render: (args) => (
    <ChartContainer {...args}>
      <RadarChart data={chartData}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarGrid />
        <PolarAngleAxis dataKey="month" />
        <PolarRadiusAxis />
        <Radar
          dataKey="desktop"
          fill="var(--color-desktop)"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ChartContainer>
  ),
};
