import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LoanCalculatorSlider, LoanCalculator } from "./loan-calculator-slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp } from "lucide-react";

const meta: Meta<typeof LoanCalculatorSlider> = {
  title: "Molecules/LoanCalculatorSlider",
  component: LoanCalculatorSlider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "LoanCalculatorSlider component for selecting loan amounts, durations, and rates with interactive sliders.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["amount", "duration", "rate"],
      description: "Type of value being selected",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the component",
    },
    showInput: {
      control: "boolean",
      description: "Show input field for direct entry",
    },
    showBadges: {
      control: "boolean",
      description: "Show preset value buttons",
    },
    disabled: {
      control: "boolean",
      description: "Disable the slider",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoanCalculatorSlider>;

export const AmountSlider: Story = {
  args: {
    label: "Số tiền vay",
    value: 50_000_000,
    min: 5_000_000,
    max: 500_000_000,
    step: 1_000_000,
    variant: "amount",
    showInput: true,
    showBadges: true,
    presetValues: [
      { label: "10M", value: 10_000_000 },
      { label: "50M", value: 50_000_000 },
      { label: "100M", value: 100_000_000 },
      { label: "200M", value: 200_000_000 },
    ],
    helperText: "Chọn số tiền bạn muốn vay",
  },
};

export const DurationSlider: Story = {
  args: {
    label: "Thời hạn vay",
    value: 24,
    min: 6,
    max: 60,
    step: 1,
    variant: "duration",
    showInput: true,
    showBadges: true,
    presetValues: [
      { label: "6 tháng", value: 6 },
      { label: "12 tháng", value: 12 },
      { label: "24 tháng", value: 24 },
      { label: "36 tháng", value: 36 },
    ],
    helperText: "Thời gian bạn muốn trả nợ",
  },
};

export const RateSlider: Story = {
  args: {
    label: "Lãi suất",
    value: 8.5,
    min: 6,
    max: 24,
    step: 0.1,
    variant: "rate",
    showInput: false,
    showBadges: false,
    helperText: "Lãi suất áp dụng cho khoản vay của bạn",
  },
};

export const SmallSize: Story = {
  args: {
    label: "Số tiền vay",
    value: 20_000_000,
    min: 5_000_000,
    max: 100_000_000,
    variant: "amount",
    size: "sm",
    showBadges: true,
    presetValues: [
      { label: "10M", value: 10_000_000 },
      { label: "50M", value: 50_000_000 },
    ],
  },
};

export const LargeSize: Story = {
  args: {
    label: "Số tiền vay",
    value: 100_000_000,
    min: 10_000_000,
    max: 1_000_000_000,
    variant: "amount",
    size: "lg",
    showInput: true,
    helperText: "Khoản vay lớn cho doanh nghiệp",
  },
};

export const Disabled: Story = {
  args: {
    label: "Lãi suất cố định",
    value: 8.5,
    min: 6,
    max: 12,
    variant: "rate",
    disabled: true,
    helperText: "Lãi suất này được cố định cho gói vay hiện tại",
  },
};

// Interactive examples
export const InteractiveAmountSlider: Story = {
  name: "Interactive Amount Slider",
  render: () => {
    const [amount, setAmount] = useState(50_000_000);

    return (
      <div className="space-y-4 max-w-md">
        <LoanCalculatorSlider
          label="Số tiền vay"
          value={amount}
          min={5_000_000}
          max={500_000_000}
          step={1_000_000}
          variant="amount"
          onValueChange={setAmount}
          showInput={true}
          showBadges={true}
          presetValues={[
            { label: "10M", value: 10_000_000 },
            { label: "50M", value: 50_000_000 },
            { label: "100M", value: 100_000_000 },
            { label: "200M", value: 200_000_000 },
          ]}
          helperText="Chọn số tiền bạn muốn vay"
        />

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Selected amount:</p>
          <p className="font-bold">{amount.toLocaleString("vi-VN")} VND</p>
        </div>
      </div>
    );
  },
};

export const InteractiveDurationSlider: Story = {
  name: "Interactive Duration Slider",
  render: () => {
    const [duration, setDuration] = useState(24);

    return (
      <div className="space-y-4 max-w-md">
        <LoanCalculatorSlider
          label="Thời hạn vay"
          value={duration}
          min={6}
          max={60}
          step={1}
          variant="duration"
          onValueChange={setDuration}
          showInput={true}
          showBadges={true}
          presetValues={[
            { label: "6 tháng", value: 6 },
            { label: "12 tháng", value: 12 },
            { label: "24 tháng", value: 24 },
            { label: "36 tháng", value: 36 },
          ]}
          helperText="Thời gian bạn muốn trả nợ"
        />

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Selected duration:</p>
          <p className="font-bold">{duration} tháng</p>
        </div>
      </div>
    );
  },
};

// Full Loan Calculator Stories
const LoanCalculatorMeta: Meta<typeof LoanCalculator> = {
  title: "Molecules/LoanCalculator",
  component: LoanCalculator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export const FullLoanCalculator: StoryObj<typeof LoanCalculator> = {
  name: "Full Loan Calculator",
  render: () => {
    const [amount, setAmount] = useState(50_000_000);
    const [duration, setDuration] = useState(24);
    const [rate, setRate] = useState(8.5);

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Calculator className="h-6 w-6" />
            Máy tính khoản vay
          </CardTitle>
          <CardDescription>
            Tính toán khoản vay phù hợp với nhu cầu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoanCalculator
            amount={amount}
            duration={duration}
            interestRate={rate}
            onAmountChange={setAmount}
            onDurationChange={setDuration}
            onInterestRateChange={setRate}
            showResults={true}
          />

          <div className="mt-6 text-center">
            <Button size="lg" className="w-full md:w-auto">
              <TrendingUp className="h-5 w-5 mr-2" />
              ĐĂNG KÝ VAY NGAY
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
};

export const SimpleLoanCalculator: StoryObj<typeof LoanCalculator> = {
  name: "Simple Loan Calculator",
  render: () => {
    const [amount, setAmount] = useState(30_000_000);
    const [duration, setDuration] = useState(12);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h3 className="text-xl font-semibold text-center">
          Tính toán khoản vay nhanh
        </h3>

        <LoanCalculator
          amount={amount}
          duration={duration}
          interestRate={8.5}
          onAmountChange={setAmount}
          onDurationChange={setDuration}
          showResults={true}
          amountRange={{ min: 5_000_000, max: 200_000_000 }}
          durationRange={{ min: 6, max: 36 }}
        />
      </div>
    );
  },
};

export const BusinessLoanCalculator: StoryObj<typeof LoanCalculator> = {
  name: "Business Loan Calculator",
  render: () => {
    const [amount, setAmount] = useState(500_000_000);
    const [duration, setDuration] = useState(60);
    const [rate, setRate] = useState(10);

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Máy tính vay kinh doanh
          </CardTitle>
          <CardDescription>
            Dành cho các doanh nghiệp và cá nhân kinh doanh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoanCalculator
            amount={amount}
            duration={duration}
            interestRate={rate}
            onAmountChange={setAmount}
            onDurationChange={setDuration}
            onInterestRateChange={setRate}
            showResults={true}
            amountRange={{ min: 50_000_000, max: 5_000_000_000 }}
            durationRange={{ min: 12, max: 120 }}
            rateRange={{ min: 8, max: 18 }}
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Tư vấn miễn phí
            </Button>
            <Button className="w-full">Đăng ký vay kinh doanh</Button>
          </div>
        </CardContent>
      </Card>
    );
  },
};
