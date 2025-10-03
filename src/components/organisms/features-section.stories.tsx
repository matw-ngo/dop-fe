import type { Meta, StoryObj } from "@storybook/react";
import { FeaturesSection } from "./features-section";
import {
  Zap,
  Shield,
  Star,
  TrendingUp,
  Users,
  Award,
  Clock,
  CreditCard,
  Smartphone,
  Globe,
  CheckCircle,
  Heart,
} from "lucide-react";

const meta: Meta<typeof FeaturesSection> = {
  title: "Organisms/FeaturesSection",
  component: FeaturesSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "FeaturesSection component for showcasing key features and benefits with various layouts and styles.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "grid", "carousel", "staggered", "minimal"],
      description: "Visual variant of the section",
    },
    layout: {
      control: "select",
      options: ["2-column", "3-column", "4-column", "mixed"],
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
    spacing: {
      control: "select",
      options: ["tight", "normal", "loose"],
      description: "Spacing between items",
    },
    showHeader: {
      control: "boolean",
      description: "Show section header",
    },
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeaturesSection>;

// Sample features data
const sampleFeatures = [
  {
    id: "fast-approval",
    title: "Duyệt vay nhanh chóng",
    description:
      "Công nghệ AI phê duyệt tự động trong vòng 30 giây, tiết kiệm thời gian tối đa cho khách hàng.",
    icon: <Zap className="w-8 h-8" />,
    features: [
      "AI phê duyệt 30 giây",
      "Giải ngân trong ngày",
      "100% trực tuyến",
      "Không cần giấy tờ phức tạp",
    ],
    buttonText: "Tìm hiểu thêm",
    highlight: true,
  },
  {
    id: "secure-reliable",
    title: "Ổn định & tin cậy",
    description:
      "Được giám sát bởi Ngân hàng Nhà nước, đảm bảo an toàn tuyệt đối cho mọi giao dịch.",
    icon: <Shield className="w-8 h-8" />,
    features: ["Giám sát NHNN", "SSL 256-bit", "ISO 27001", "99.9% uptime"],
    buttonText: "Xem chứng nhận",
  },
  {
    id: "attractive-offers",
    title: "Ưu đãi hấp dẫn",
    description:
      "Lãi suất cạnh tranh và nhiều chương trình khuyến mãi đặc biệt cho khách hàng mới.",
    icon: <Star className="w-8 h-8" />,
    badge: "HOT",
    features: [
      "Lãi suất từ 8.5%/năm",
      "Miễn phí thẩm định",
      "Ưu đãi khách VIP",
      "Quà tặng hấp dẫn",
    ],
    buttonText: "Đăng ký ngay",
  },
];

const extendedFeatures = [
  ...sampleFeatures,
  {
    id: "customer-support",
    title: "Hỗ trợ 24/7",
    description:
      "Đội ngũ chăm sóc khách hàng chuyên nghiệp luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.",
    icon: <Users className="w-8 h-8" />,
    features: [
      "Hotline 24/7",
      "Live chat",
      "Email support",
      "Tư vấn chuyên nghiệp",
    ],
    buttonText: "Liên hệ ngay",
  },
  {
    id: "competitive-rates",
    title: "Lãi suất cạnh tranh",
    description:
      "Mức lãi suất ưu đãi nhất thị trường với nhiều gói vay linh hoạt phù hợp mọi nhu cầu.",
    icon: <TrendingUp className="w-8 h-8" />,
    features: [
      "Từ 8.5%/năm",
      "Lãi suất cố định",
      "Không phí ẩn",
      "Miễn phí trả trước",
    ],
    buttonText: "So sánh lãi suất",
  },
  {
    id: "trusted-brand",
    title: "Thương hiệu uy tín",
    description:
      "Được tin tưởng bởi hàng triệu khách hàng với nhiều năm kinh nghiệm trong lĩnh vực tài chính.",
    icon: <Award className="w-8 h-8" />,
    features: [
      "3M+ khách hàng",
      "50+ giải thưởng",
      "15+ năm kinh nghiệm",
      "Uy tín hàng đầu",
    ],
    buttonText: "Về chúng tôi",
  },
];

export const Default: Story = {
  args: {
    features: sampleFeatures,
  },
};

export const Grid: Story = {
  args: {
    variant: "grid",
    features: sampleFeatures,
    title: "Tại sao chọn chúng tôi?",
    description:
      "Ba lý do chính khiến hàng triệu khách hàng tin tưởng lựa chọn dịch vụ của chúng tôi",
  },
};

export const TwoColumn: Story = {
  args: {
    layout: "2-column",
    features: sampleFeatures.slice(0, 2),
    title: "Hai ưu điểm nổi bật",
    size: "lg",
  },
};

export const FourColumn: Story = {
  args: {
    layout: "4-column",
    features: extendedFeatures.slice(0, 4),
    title: "Dịch vụ toàn diện",
    description:
      "Chúng tôi cung cấp giải pháp tài chính hoàn chỉnh với 4 trụ cột chính",
    variant: "grid",
  },
};

export const MixedLayout: Story = {
  args: {
    layout: "mixed",
    features: sampleFeatures,
    title: "Tính năng đặc biệt",
    description: "Khám phá những tính năng làm nên sự khác biệt",
    variant: "default",
    showCTA: true,
  },
};

export const WithBackground: Story = {
  args: {
    background: "gradient",
    features: sampleFeatures,
    title: "Ưu điểm vượt trội",
    subtitle: "Tại sao chọn chúng tôi",
    description:
      "Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu của khách hàng",
  },
};

export const PrimaryBackground: Story = {
  args: {
    background: "primary",
    features: sampleFeatures,
    title: "Cam kết của chúng tôi",
    description: "Ba cam kết cốt lõi tạo nên giá trị cho khách hàng",
    showCTA: true,
    ctaText: "Trải nghiệm ngay",
  },
};

export const Carousel: Story = {
  args: {
    variant: "carousel",
    features: extendedFeatures,
    title: "Dịch vụ đa dạng",
    description: "Cuộn ngang để khám phá tất cả dịch vụ của chúng tôi",
  },
};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    features: sampleFeatures,
    title: "Tính năng",
    showHeader: true,
    spacing: "tight",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    features: sampleFeatures,
    title: "Giải pháp tài chính toàn diện",
    subtitle: "Dành cho mọi nhu cầu",
    description:
      "Từ vay tiêu dùng đến kinh doanh, chúng tôi có giải pháp phù hợp cho mọi khách hàng với dịch vụ chuyên nghiệp và uy tín hàng đầu thị trường.",
    showCTA: true,
    background: "muted",
  },
};
