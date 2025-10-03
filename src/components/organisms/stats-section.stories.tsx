import type { Meta, StoryObj } from "@storybook/react";
import { StatsSection } from "./stats-section";
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Award,
  Globe,
  Star,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";

const meta: Meta<typeof StatsSection> = {
  title: "Organisms/StatsSection",
  component: StatsSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "StatsSection component for displaying key metrics and statistics with various layouts and animations.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "cards", "minimal", "featured", "compact"],
      description: "Visual variant of the section",
    },
    layout: {
      control: "select",
      options: ["2-column", "3-column", "4-column", "auto"],
      description: "Grid layout configuration",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the section",
    },
    background: {
      control: "select",
      options: ["none", "muted", "gradient", "primary"],
      description: "Background style",
    },
    alignment: {
      control: "select",
      options: ["left", "center", "right"],
      description: "Text alignment",
    },
    spacing: {
      control: "select",
      options: ["tight", "normal", "loose"],
      description: "Spacing between items",
    },
    animateOnView: {
      control: "boolean",
      description: "Animate numbers when they come into view",
    },
    showHeader: {
      control: "boolean",
      description: "Show section header",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsSection>;

// Sample stats data
const basicStats = [
  {
    id: "customers",
    icon: <Users className="w-6 h-6" />,
    value: 3000000,
    label: "Khách hàng tin tưởng",
    description: "Đã đăng ký và sử dụng dịch vụ",
    suffix: "+",
    color: "primary" as const,
  },
  {
    id: "partners",
    icon: <Building className="w-6 h-6" />,
    value: "14",
    label: "Đối tác ngân hàng",
    description: "Hợp tác chiến lược",
    suffix: "+",
    color: "success" as const,
  },
  {
    id: "loans",
    icon: <DollarSign className="w-6 h-6" />,
    value: "1.2B",
    label: "Tổng giải ngân",
    description: "Năm 2024",
    prefix: "₫",
    trend: {
      value: 25,
      isPositive: true,
      label: "YoY",
    },
    color: "primary" as const,
  },
  {
    id: "processing",
    icon: <Clock className="w-6 h-6" />,
    value: "24",
    label: "Giờ xử lý",
    description: "Thời gian trung bình",
    suffix: "h",
    trend: {
      value: 30,
      isPositive: false,
      label: "cải thiện",
    },
  },
];

const achievementStats = [
  {
    id: "awards",
    icon: <Award className="w-6 h-6" />,
    value: "50",
    label: "Giải thưởng",
    description: "Các giải thưởng uy tín trong ngành",
    suffix: "+",
    highlight: true,
  },
  {
    id: "rating",
    icon: <Star className="w-6 h-6" />,
    value: "4.8",
    label: "Đánh giá",
    description: "Từ 100,000+ khách hàng",
    suffix: "/5",
    color: "success" as const,
  },
  {
    id: "uptime",
    icon: <Shield className="w-6 h-6" />,
    value: "99.9",
    label: "Uptime",
    description: "Tỷ lệ hoạt động ổn định",
    suffix: "%",
    color: "primary" as const,
  },
];

const performanceStats = [
  {
    id: "growth",
    icon: <TrendingUp className="w-6 h-6" />,
    value: "125",
    label: "Tăng trưởng",
    description: "So với năm trước",
    suffix: "%",
    trend: {
      value: 25,
      isPositive: true,
    },
    color: "success" as const,
  },
  {
    id: "new-customers",
    icon: <Users className="w-6 h-6" />,
    value: 500000,
    label: "Khách hàng mới",
    description: "Trong năm 2024",
  },
  {
    id: "revenue",
    icon: <DollarSign className="w-6 h-6" />,
    value: "15B",
    label: "Doanh thu",
    description: "Tổng doanh thu năm",
    prefix: "₫",
    trend: {
      value: 18,
      isPositive: true,
    },
    color: "primary" as const,
  },
  {
    id: "coverage",
    icon: <Globe className="w-6 h-6" />,
    value: "63",
    label: "Tỉnh thành",
    description: "Có mặt trên toàn quốc",
    suffix: "/63",
    color: "primary" as const,
  },
];

export const Default: Story = {
  args: {
    stats: basicStats,
  },
};

export const Cards: Story = {
  args: {
    variant: "cards",
    stats: basicStats,
    title: "Hiệu suất hoạt động 2024",
    description:
      "Những con số ấn tượng khẳng định vị thế của chúng tôi trong ngành tài chính",
  },
};

export const ThreeColumn: Story = {
  args: {
    layout: "3-column",
    stats: achievementStats,
    title: "Thành tựu đạt được",
    subtitle: "Uy tín & Chất lượng",
    description: "Sự ghi nhận từ khách hàng và các tổ chức uy tín",
    variant: "cards",
  },
};

export const FourColumn: Story = {
  args: {
    layout: "4-column",
    stats: performanceStats,
    title: "Báo cáo hiệu suất 2024",
    subtitle: "Tăng trưởng vượt bậc",
    description:
      "Những con số minh chứng cho sự phát triển bền vững và tăng trưởng mạnh mẽ",
    variant: "featured",
    size: "lg",
    animateOnView: true,
  },
};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    stats: achievementStats,
    title: "Thống kê nhanh",
    size: "sm",
    spacing: "tight",
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
    stats: basicStats.slice(0, 3),
    showHeader: false,
    size: "sm",
  },
};

export const WithBackground: Story = {
  args: {
    background: "gradient",
    stats: basicStats,
    title: "Số liệu ấn tượng",
    subtitle: "Năm 2024",
    description:
      "Những thành tựu đáng tự hào mà chúng tôi đạt được trong năm qua",
    variant: "featured",
  },
};

export const PrimaryBackground: Story = {
  args: {
    background: "primary",
    stats: achievementStats,
    title: "Cam kết chất lượng",
    description: "Những con số khẳng định chất lượng dịch vụ hàng đầu",
    variant: "default",
  },
};

export const LeftAligned: Story = {
  args: {
    alignment: "left",
    stats: basicStats,
    title: "Tổng quan hoạt động",
    description: "Cập nhật các chỉ số quan trọng của công ty trong quý 4/2024",
    variant: "cards",
    layout: "2-column",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    stats: performanceStats,
    title: "Báo cáo tăng trưởng toàn diện",
    subtitle: "Q4 2024 Performance Report",
    description:
      "Phân tích chi tiết về hiệu suất hoạt động và tăng trưởng của công ty trong quý 4 năm 2024, cho thấy sự phát triển vượt bậc trên tất cả các mặt.",
    variant: "featured",
    background: "muted",
    spacing: "loose",
  },
};

export const AnimatedCounters: Story = {
  args: {
    stats: [
      {
        icon: <Users className="w-6 h-6" />,
        value: 1250000,
        label: "Tổng khách hàng",
        color: "primary" as const,
      },
      {
        icon: <DollarSign className="w-6 h-6" />,
        value: 850000000,
        label: "Tổng giải ngân (VND)",
        color: "success" as const,
      },
      {
        icon: <CheckCircle className="w-6 h-6" />,
        value: 98.5,
        label: "Tỷ lệ hài lòng (%)",
        suffix: "%",
        color: "primary" as const,
      },
    ],
    title: "Số liệu real-time",
    description: "Xem các con số tăng dần khi cuộn xuống",
    variant: "cards",
    animateOnView: true,
  },
};
