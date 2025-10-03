import type { Meta, StoryObj } from "@storybook/react";
import { FeatureCard } from "./feature-card";
import {
  Zap,
  Shield,
  Star,
  Clock,
  DollarSign,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Smartphone,
  CreditCard,
  Globe,
  Heart,
  Lock,
  Settings,
} from "lucide-react";

const meta: Meta<typeof FeatureCard> = {
  title: "Molecules/FeatureCard",
  component: FeatureCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "FeatureCard component for showcasing features, services, or benefits with images, icons, and call-to-action buttons.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "horizontal", "compact", "image-top", "icon-only"],
      description: "Layout variant of the card",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the component",
    },
    buttonVariant: {
      control: "select",
      options: ["default", "outline", "ghost", "link"],
      description: "Style of the action button",
    },
    hover: {
      control: "boolean",
      description: "Enable hover effects",
    },
    clickable: {
      control: "boolean",
      description: "Make the entire card clickable",
    },
    highlight: {
      control: "boolean",
      description: "Add highlight border",
    },
    imageAspectRatio: {
      control: "select",
      options: ["square", "video", "portrait"],
      description: "Aspect ratio for images",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    icon: Zap,
    title: "Duyệt vay nhanh chóng",
    description:
      "Công nghệ AI phê duyệt tự động trong vòng 30 giây, tiết kiệm thời gian tối đa cho khách hàng.",
    buttonText: "Tìm hiểu thêm",
    buttonVariant: "outline",
  },
};

export const WithImage: Story = {
  args: {
    image: "/api/placeholder/400/300",
    title: "Ổn định & tin cậy",
    description:
      "Được giám sát bởi Ngân hàng Nhà nước, đảm bảo an toàn tuyệt đối cho mọi giao dịch.",
    buttonText: "Xem chi tiết",
    badge: "Uy tín",
  },
};

export const WithFeatures: Story = {
  args: {
    icon: Star,
    title: "Ưu đãi hấp dẫn",
    description:
      "Nhiều chương trình khuyến mãi và ưu đãi đặc biệt dành cho khách hàng.",
    features: [
      "Lãi suất từ 8.5%/năm",
      "Không phí ẩn",
      "Miễn phí thẩm định",
      "Ưu đãi khách hàng mới",
    ],
    buttonText: "Đăng ký ngay",
    buttonVariant: "default",
  },
};

export const Horizontal: Story = {
  args: {
    image: "/api/placeholder/400/300",
    title: "Bảo mật tuyệt đối",
    description:
      "Sử dụng công nghệ mã hóa SSL 256-bit, đảm bảo thông tin khách hàng được bảo vệ an toàn.",
    variant: "horizontal",
    buttonText: "Tìm hiểu",
  },
};

export const Compact: Story = {
  args: {
    icon: Clock,
    title: "Hỗ trợ 24/7",
    description:
      "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.",
    variant: "compact",
    size: "sm",
  },
};

export const ImageTop: Story = {
  args: {
    image: "/api/placeholder/400/300",
    title: "Dịch vụ chuyên nghiệp",
    description:
      "Đội ngũ tư vấn viên giàu kinh nghiệm, tận tâm với từng khách hàng.",
    variant: "image-top",
    buttonText: "Liên hệ tư vấn",
  },
};

export const IconOnly: Story = {
  args: {
    icon: Shield,
    title: "An toàn tuyệt đối",
    description:
      "Cam kết bảo mật thông tin khách hàng với các tiêu chuẩn quốc tế.",
    variant: "icon-only",
    buttonText: "Xem thêm",
    badge: "Chứng nhận",
  },
};

export const Large: Story = {
  args: {
    icon: Award,
    title: "Uy tín hàng đầu",
    description:
      "Được tin tưởng bởi hàng triệu khách hàng trên toàn quốc với nhiều năm kinh nghiệm trong lĩnh vực tài chính.",
    size: "lg",
    buttonText: "Khám phá ngay",
    features: [
      "50+ giải thưởng uy tín",
      "3M+ khách hàng tin tưởng",
      "99.9% uptime",
      "Hỗ trợ đa ngôn ngữ",
    ],
  },
};

export const Small: Story = {
  args: {
    icon: Smartphone,
    title: "Mobile App",
    description:
      "Ứng dụng di động tiện lợi, quản lý khoản vay mọi lúc mọi nơi.",
    size: "sm",
    variant: "compact",
    buttonText: "Tải app",
  },
};

export const Clickable: Story = {
  args: {
    icon: TrendingUp,
    title: "Lãi suất cạnh tranh",
    description:
      "Mức lãi suất ưu đãi nhất thị trường, phù hợp với mọi đối tượng khách hàng.",
    clickable: true,
    onClick: () => alert("Card clicked!"),
    highlight: true,
  },
};

export const WithBadge: Story = {
  args: {
    image: "/api/placeholder/400/300",
    title: "Sản phẩm mới",
    description:
      "Ra mắt gói vay đặc biệt với nhiều ưu đãi hấp dẫn chưa từng có.",
    badge: "NEW",
    buttonText: "Khám phá",
    buttonVariant: "default",
  },
};

// Real-world examples
export const LoanFeatures: Story = {
  name: "Loan Features Grid",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FeatureCard
        icon={Zap}
        title="Duyệt vay nhanh chóng"
        description="Công nghệ AI phê duyệt tự động trong vòng 30 giây, tiết kiệm thời gian tối đa cho khách hàng."
        buttonText="Tìm hiểu thêm"
        buttonVariant="outline"
        features={[
          "AI phê duyệt 30 giây",
          "Giải ngân trong ngày",
          "100% trực tuyến",
          "Không cần giấy tờ phức tạp",
        ]}
      />

      <FeatureCard
        icon={Shield}
        title="Ổn định & tin cậy"
        description="Được giám sát bởi Ngân hàng Nhà nước, đảm bảo an toàn tuyệt đối cho mọi giao dịch."
        buttonText="Xem chứng nhận"
        buttonVariant="outline"
        features={["Giám sát NHNN", "SSL 256-bit", "ISO 27001", "99.9% uptime"]}
      />

      <FeatureCard
        icon={Star}
        title="Ưu đãi hấp dẫn"
        description="Lãi suất cạnh tranh và nhiều chương trình khuyến mãi đặc biệt cho khách hàng mới."
        buttonText="Đăng ký ngay"
        buttonVariant="default"
        highlight={true}
        features={[
          "Lãi suất từ 8.5%/năm",
          "Miễn phí thẩm định",
          "Ưu đãi khách VIP",
          "Quà tặng hấp dẫn",
        ]}
      />
    </div>
  ),
};

export const ServiceCards: Story = {
  name: "Service Cards",
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center">Dịch vụ của chúng tôi</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureCard
          image="/api/placeholder/600/400"
          title="Vay cá nhân"
          description="Giải pháp tài chính linh hoạt cho mọi nhu cầu cá nhân với lãi suất ưu đãi và thủ tục đơn giản."
          variant="horizontal"
          buttonText="Đăng ký vay"
          buttonVariant="default"
          features={[
            "Hạn mức lên đến 500M",
            "Thời hạn linh hoạt 6-60 tháng",
            "Không cần tài sản thế chấp",
          ]}
        />

        <FeatureCard
          image="/api/placeholder/600/400"
          title="Vay kinh doanh"
          description="Hỗ trợ doanh nghiệp phát triển với các gói vay ưu đãi, thủ tục nhanh gọn."
          variant="horizontal"
          buttonText="Tư vấn miễn phí"
          buttonVariant="outline"
          features={[
            "Hạn mức lên đến 5 tỷ",
            "Lãi suất cạnh tranh",
            "Tư vấn chuyên nghiệp",
          ]}
        />
      </div>
    </div>
  ),
};

export const ProductShowcase: Story = {
  name: "Product Showcase",
  render: () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
        <p className="text-muted-foreground">
          Khám phá các sản phẩm tài chính hàng đầu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard
          icon={CreditCard}
          title="Vay tiêu dùng"
          description="Vay nhanh cho nhu cầu cá nhân"
          variant="icon-only"
          size="sm"
          buttonText="Xem chi tiết"
          badge="Phổ biến"
        />

        <FeatureCard
          icon={Globe}
          title="Vay kinh doanh"
          description="Hỗ trợ phát triển doanh nghiệp"
          variant="icon-only"
          size="sm"
          buttonText="Tư vấn"
        />

        <FeatureCard
          icon={Heart}
          title="Vay mua nhà"
          description="Thực hiện ước mơ có nhà"
          variant="icon-only"
          size="sm"
          buttonText="Đăng ký"
          badge="NEW"
        />

        <FeatureCard
          icon={Settings}
          title="Dịch vụ khác"
          description="Các sản phẩm tài chính khác"
          variant="icon-only"
          size="sm"
          buttonText="Khám phá"
        />
      </div>
    </div>
  ),
};

export const InteractiveCards: Story = {
  name: "Interactive Cards",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeatureCard
        icon={Lock}
        title="Bảo mật cao cấp"
        description="Hệ thống bảo mật đa lớp với công nghệ blockchain và AI."
        clickable={true}
        onClick={() => alert("Xem thông tin bảo mật")}
        features={[
          "Blockchain security",
          "AI fraud detection",
          "Multi-factor auth",
          "Real-time monitoring",
        ]}
        buttonText="Tìm hiểu bảo mật"
      />

      <FeatureCard
        icon={Users}
        title="Hỗ trợ khách hàng"
        description="Đội ngũ chuyên gia tư vấn 24/7 với kinh nghiệm nhiều năm."
        clickable={true}
        onClick={() => alert("Kết nối với tư vấn viên")}
        features={[
          "Hỗ trợ 24/7",
          "Tư vấn chuyên nghiệp",
          "Đa kênh liên lạc",
          "Phản hồi nhanh chóng",
        ]}
        buttonText="Liên hệ ngay"
        buttonVariant="default"
        highlight={true}
      />
    </div>
  ),
};
