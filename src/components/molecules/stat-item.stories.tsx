import type { Meta, StoryObj } from "@storybook/react";
import { StatItem } from "./stat-item";
import {
  Users,
  Building,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  Shield,
  Clock,
  Globe,
  Star,
  Heart,
  CheckCircle,
  Target,
} from "lucide-react";

const meta: Meta<typeof StatItem> = {
  title: "Molecules/StatItem",
  component: StatItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "StatItem component for displaying statistics, metrics, and key performance indicators with icons and optional trends.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "card", "minimal", "highlight"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Size of the component",
    },
    iconPosition: {
      control: "select",
      options: ["left", "top", "right"],
      description: "Position of the icon",
    },
    color: {
      control: "select",
      options: ["default", "primary", "success", "warning", "destructive"],
      description: "Color scheme",
    },
    animateOnView: {
      control: "boolean",
      description: "Animate number counting when component comes into view",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatItem>;

export const Default: Story = {
  args: {
    icon: Users,
    value: "3,000,000",
    label: "Người dùng tin tưởng",
    description: "Số khách hàng đã sử dụng dịch vụ",
    suffix: "+",
  },
};

export const Card: Story = {
  args: {
    icon: Building,
    value: "14",
    label: "Đối tác ngân hàng",
    description: "Hợp tác với các ngân hàng hàng đầu",
    variant: "card",
    suffix: "+",
  },
};

export const Minimal: Story = {
  args: {
    icon: CreditCard,
    value: "500M",
    label: "Hạn mức tối đa",
    variant: "minimal",
    prefix: "₫",
  },
};

export const Highlight: Story = {
  args: {
    icon: TrendingUp,
    value: "8.5",
    label: "Lãi suất từ",
    description: "Ưu đãi đặc biệt cho khách hàng mới",
    variant: "highlight",
    suffix: "%/năm",
  },
};

export const WithTrend: Story = {
  args: {
    icon: DollarSign,
    value: "1.2B",
    label: "Tổng giá trị giải ngân",
    description: "Tổng số tiền đã cho vay trong năm 2024",
    trend: {
      value: 15.2,
      isPositive: true,
      label: "so với năm trước",
    },
    variant: "card",
    prefix: "₫",
  },
};

export const NegativeTrend: Story = {
  args: {
    icon: Clock,
    value: "24",
    label: "Thời gian xử lý",
    description: "Thời gian trung bình để duyệt hồ sơ",
    trend: {
      value: 20,
      isPositive: false,
      label: "so với tháng trước",
    },
    variant: "card",
    suffix: " giờ",
  },
};

export const LeftIcon: Story = {
  args: {
    icon: Shield,
    value: "99.9",
    label: "Tỷ lệ bảo mật",
    description: "Cam kết bảo vệ thông tin khách hàng",
    iconPosition: "left",
    variant: "card",
    suffix: "%",
  },
};

export const RightIcon: Story = {
  args: {
    icon: Award,
    value: "50",
    label: "Giải thưởng",
    description: "Các giải thưởng uy tín trong ngành",
    iconPosition: "right",
    variant: "card",
    suffix: "+",
  },
};

export const Small: Story = {
  args: {
    icon: Globe,
    value: "24/7",
    label: "Hỗ trợ",
    size: "sm",
    variant: "minimal",
  },
};

export const Large: Story = {
  args: {
    icon: Star,
    value: "4.8",
    label: "Đánh giá khách hàng",
    description: "Trung bình từ 100,000+ đánh giá",
    size: "lg",
    variant: "card",
    suffix: "/5",
    color: "success",
  },
};

export const ExtraLarge: Story = {
  args: {
    icon: Heart,
    value: "95",
    label: "Hài lòng",
    description: "Tỷ lệ khách hàng hài lòng với dịch vụ",
    size: "xl",
    variant: "highlight",
    suffix: "%",
  },
};

export const Animated: Story = {
  args: {
    icon: Users,
    value: 3000000,
    label: "Người dùng",
    description: "Số lượng khách hàng đã đăng ký",
    animateOnView: true,
    variant: "card",
  },
};

export const PrimaryColor: Story = {
  args: {
    icon: Target,
    value: "100",
    label: "Mục tiêu đạt được",
    description: "Hoàn thành vượt mức kế hoạch năm",
    color: "primary",
    variant: "card",
    suffix: "%",
  },
};

export const SuccessColor: Story = {
  args: {
    icon: CheckCircle,
    value: "99.1",
    label: "Tỷ lệ thành công",
    description: "Các khoản vay được giải ngân thành công",
    color: "success",
    variant: "card",
    suffix: "%",
  },
};

// Real-world examples
export const LoanStatistics: Story = {
  name: "Loan Statistics Grid",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem
        icon={Users}
        value={3000000}
        label="Khách hàng tin tưởng"
        description="Đã đăng ký và sử dụng dịch vụ"
        variant="card"
        animateOnView={true}
        suffix="+"
      />

      <StatItem
        icon={Building}
        value="14"
        label="Đối tác ngân hàng"
        description="Hợp tác chiến lược"
        variant="card"
        suffix="+"
        color="primary"
      />

      <StatItem
        icon={DollarSign}
        value="1.2B"
        label="Tổng giải ngân"
        description="Năm 2024"
        variant="card"
        prefix="₫"
        trend={{
          value: 25,
          isPositive: true,
          label: "YoY",
        }}
        color="success"
      />

      <StatItem
        icon={Clock}
        value="24"
        label="Thời gian duyệt"
        description="Trung bình"
        variant="card"
        suffix=" giờ"
        trend={{
          value: 30,
          isPositive: false,
          label: "cải thiện",
        }}
      />
    </div>
  ),
};

export const CompanyAchievements: Story = {
  name: "Company Achievements",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatItem
        icon={Award}
        value="50"
        label="Giải thưởng"
        description="Các giải thưởng uy tín trong ngành tài chính"
        variant="highlight"
        size="lg"
        suffix="+"
      />

      <StatItem
        icon={Star}
        value="4.8"
        label="Đánh giá"
        description="Trung bình từ 100,000+ khách hàng"
        variant="highlight"
        size="lg"
        suffix="/5"
        color="success"
      />

      <StatItem
        icon={Shield}
        value="99.9"
        label="Bảo mật"
        description="Tỷ lệ bảo vệ thông tin khách hàng"
        variant="highlight"
        size="lg"
        suffix="%"
        color="primary"
      />
    </div>
  ),
};

export const PerformanceMetrics: Story = {
  name: "Performance Metrics",
  render: () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center">
        Hiệu suất hoạt động 2024
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatItem
          icon={TrendingUp}
          value="125"
          label="Tăng trưởng"
          description="So với năm trước"
          variant="card"
          suffix="%"
          trend={{
            value: 25,
            isPositive: true,
          }}
          color="success"
          animateOnView={true}
        />

        <StatItem
          icon={Users}
          value={500000}
          label="Khách hàng mới"
          description="Trong năm 2024"
          variant="card"
          animateOnView={true}
        />

        <StatItem
          icon={CreditCard}
          value="15B"
          label="Doanh thu"
          description="Tổng doanh thu năm"
          variant="card"
          prefix="₫"
          trend={{
            value: 18,
            isPositive: true,
          }}
          color="primary"
        />

        <StatItem
          icon={Globe}
          value="63"
          label="Tỉnh thành"
          description="Có mặt trên toàn quốc"
          variant="card"
          suffix="/63"
          color="primary"
        />
      </div>
    </div>
  ),
};

export const MinimalStats: Story = {
  name: "Minimal Stats List",
  render: () => (
    <div className="space-y-4 max-w-md">
      <StatItem
        icon={Calendar}
        value="2019"
        label="Năm thành lập"
        variant="minimal"
        iconPosition="left"
        size="sm"
      />

      <StatItem
        icon={Users}
        value="500+"
        label="Nhân viên"
        variant="minimal"
        iconPosition="left"
        size="sm"
      />

      <StatItem
        icon={Building}
        value="100+"
        label="Văn phòng"
        variant="minimal"
        iconPosition="left"
        size="sm"
      />

      <StatItem
        icon={Globe}
        value="24/7"
        label="Hỗ trợ khách hàng"
        variant="minimal"
        iconPosition="left"
        size="sm"
      />
    </div>
  ),
};
