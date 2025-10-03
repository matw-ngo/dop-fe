import type { Meta, StoryObj } from "@storybook/react";
import { BenefitItem } from "./benefit-item";
import {
  Shield,
  Clock,
  CreditCard,
  Users,
  Smartphone,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Lock,
  Zap,
  Heart,
  ThumbsUp,
  Globe,
  Headphones,
} from "lucide-react";

const meta: Meta<typeof BenefitItem> = {
  title: "Molecules/BenefitItem",
  component: BenefitItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "BenefitItem component for displaying features, benefits, or advantages with icons and descriptions.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "highlight", "minimal"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the component",
    },
    iconPosition: {
      control: "select",
      options: ["left", "top", "right"],
      description: "Position of the icon",
    },
    disabled: {
      control: "boolean",
      description: "Disable the item",
    },
    highlight: {
      control: "boolean",
      description: "Add highlight ring",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BenefitItem>;

export const Default: Story = {
  args: {
    icon: Shield,
    title: "Bảo mật thông tin",
    description:
      "Thông tin khách hàng được bảo mật tuyệt đối với công nghệ mã hóa SSL 256-bit",
    variant: "default",
    size: "md",
  },
};

export const Compact: Story = {
  args: {
    icon: Clock,
    title: "Duyệt nhanh 24h",
    description: "Xét duyệt tự động trong vòng 24 giờ",
    variant: "compact",
    size: "md",
  },
};

export const Highlight: Story = {
  args: {
    icon: Star,
    title: "100% online",
    description: "Hoàn toàn trực tuyến, không cần đến ngân hàng",
    variant: "highlight",
    size: "md",
  },
};

export const Minimal: Story = {
  args: {
    icon: CheckCircle,
    title: "Không cần thế chấp",
    description: "Vay nhanh mà không cần tài sản đảm bảo",
    variant: "minimal",
    size: "md",
  },
};

export const TopIcon: Story = {
  args: {
    icon: Award,
    title: "Uy tín hàng đầu",
    description: "Được tin tưởng bởi hơn 3 triệu khách hàng trên toàn quốc",
    iconPosition: "top",
    variant: "default",
  },
};

export const RightIcon: Story = {
  args: {
    icon: TrendingUp,
    title: "Lãi suất ưu đãi",
    description: "Chỉ từ 8.5%/năm cho khách hàng mới",
    iconPosition: "right",
    variant: "default",
  },
};

export const Small: Story = {
  args: {
    icon: Zap,
    title: "Xử lý tức thì",
    description: "AI phê duyệt trong 30 giây",
    size: "sm",
    variant: "compact",
  },
};

export const Large: Story = {
  args: {
    icon: Heart,
    title: "Chăm sóc 24/7",
    description:
      "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi",
    size: "lg",
    variant: "default",
  },
};

export const WithBadge: Story = {
  args: {
    icon: Globe,
    title: "Mạng lưới rộng khắp",
    description: "Hơn 1000 điểm giao dịch trên toàn quốc",
    badge: "NEW",
    variant: "highlight",
  },
};

export const Clickable: Story = {
  args: {
    icon: Headphones,
    title: "Hỗ trợ khách hàng",
    description: "Click để liên hệ với tư vấn viên",
    variant: "default",
    onClick: () => alert("Đang kết nối với tư vấn viên..."),
  },
};

export const Disabled: Story = {
  args: {
    icon: Lock,
    title: "Tính năng sắp ra mắt",
    description: "Tính năng này sẽ sớm được cập nhật",
    disabled: true,
    variant: "default",
  },
};

// Loan Registration Benefits - Real use case
export const LoanBenefits: Story = {
  name: "Loan Registration Benefits",
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">
        Lợi ích khi vay tại chúng tôi
      </h3>

      <BenefitItem
        icon={Smartphone}
        title="100% online"
        description="Hoàn toàn trực tuyến, không cần đến ngân hàng"
        variant="minimal"
        size="sm"
      />

      <BenefitItem
        icon={Shield}
        title="Bảo mật thông tin"
        description="Mã hóa SSL 256-bit, cam kết không chia sẻ thông tin"
        variant="minimal"
        size="sm"
      />

      <BenefitItem
        icon={Clock}
        title="Duyệt nhanh 24h"
        description="AI phê duyệt tự động, giải ngân trong ngày"
        variant="minimal"
        size="sm"
      />

      <BenefitItem
        icon={CreditCard}
        title="Không cần thế chấp"
        description="Chỉ cần CMND và sao kê thu nhập"
        variant="minimal"
        size="sm"
      />

      <BenefitItem
        icon={Users}
        title="3.000.000+ khách hàng tin tưởng"
        description="Uy tín được khẳng định qua nhiều năm hoạt động"
        variant="minimal"
        size="sm"
      />
    </div>
  ),
};

// Feature Highlights Grid
export const FeatureHighlights: Story = {
  name: "Feature Highlights Grid",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BenefitItem
        icon={Zap}
        title="Duyệt vay nhanh chóng"
        description="Công nghệ AI phê duyệt tự động trong 30 giây, tiết kiệm thời gian tối đa"
        variant="default"
        iconPosition="top"
      />

      <BenefitItem
        icon={Shield}
        title="Ổn định & tin cậy"
        description="Được giám sát bởi Ngân hàng Nhà nước, đảm bảo an toàn tuyệt đối"
        variant="default"
        iconPosition="top"
      />

      <BenefitItem
        icon={Star}
        title="Ưu đãi, chính sách hấp dẫn"
        description="Lãi suất cạnh tranh, nhiều ưu đãi đặc biệt cho khách hàng mới"
        variant="highlight"
        iconPosition="top"
      />
    </div>
  ),
};

// Compact Benefits List
export const CompactBenefitsList: Story = {
  name: "Compact Benefits List",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
      <BenefitItem
        icon={CheckCircle}
        title="Lãi suất từ 8.5%/năm"
        variant="compact"
        size="sm"
      />

      <BenefitItem
        icon={CheckCircle}
        title="Không phí ẩn"
        variant="compact"
        size="sm"
      />

      <BenefitItem
        icon={CheckCircle}
        title="Giải ngân nhanh"
        variant="compact"
        size="sm"
      />

      <BenefitItem
        icon={CheckCircle}
        title="Trả trước không phạt"
        variant="compact"
        size="sm"
      />
    </div>
  ),
};

// Interactive Benefits
export const InteractiveBenefits: Story = {
  name: "Interactive Benefits",
  render: () => (
    <div className="space-y-3 max-w-lg">
      <h3 className="text-lg font-semibold mb-4">Tìm hiểu thêm về dịch vụ</h3>

      <BenefitItem
        icon={Shield}
        title="Bảo mật & An toàn"
        description="Tìm hiểu về các biện pháp bảo mật"
        variant="default"
        onClick={() => alert("Hiển thị thông tin bảo mật")}
      />

      <BenefitItem
        icon={Headphones}
        title="Hỗ trợ 24/7"
        description="Kết nối với tư vấn viên ngay"
        variant="default"
        onClick={() => alert("Đang kết nối...")}
      />

      <BenefitItem
        icon={TrendingUp}
        title="Lãi suất cạnh tranh"
        description="Xem bảng lãi suất chi tiết"
        variant="default"
        onClick={() => alert("Hiển thị bảng lãi suất")}
      />

      <BenefitItem
        icon={Award}
        title="Ưu đãi đặc biệt"
        description="Khám phá các chương trình khuyến mãi"
        variant="highlight"
        badge="HOT"
        onClick={() => alert("Hiển thị ưu đãi")}
      />
    </div>
  ),
};
