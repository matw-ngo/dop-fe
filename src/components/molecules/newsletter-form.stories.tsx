import type { Meta, StoryObj } from "@storybook/react";
import { NewsletterForm } from "./newsletter-form";
import { Gift, TrendingUp, Shield, Zap } from "lucide-react";

const meta: Meta<typeof NewsletterForm> = {
  title: "Molecules/NewsletterForm",
  component: NewsletterForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "NewsletterForm component for email subscription with various layouts, preferences, and themes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "inline", "card", "minimal", "floating"],
      description: "Layout variant of the form",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the component",
    },
    theme: {
      control: "select",
      options: ["light", "dark", "primary"],
      description: "Color theme",
    },
    showPrivacyConsent: {
      control: "boolean",
      description: "Show privacy consent checkbox",
    },
    showPreferences: {
      control: "boolean",
      description: "Show newsletter preferences",
    },
    disabled: {
      control: "boolean",
      description: "Disable the form",
    },
    loading: {
      control: "boolean",
      description: "Show loading state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof NewsletterForm>;

// Mock submit function
const mockSubmit = async (email: string, preferences?: any) => {
  console.log("Submitted:", { email, preferences });
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Randomly succeed or fail for demo
  if (Math.random() > 0.3) {
    return Promise.resolve();
  } else {
    throw new Error("Submission failed");
  }
};

export const Default: Story = {
  args: {
    onSubmit: mockSubmit,
  },
};

export const Inline: Story = {
  args: {
    variant: "inline",
    title: "Nhận tin tức mới nhất",
    description: "Đăng ký để nhận thông tin về sản phẩm và ưu đãi",
    onSubmit: mockSubmit,
  },
};

export const Card: Story = {
  args: {
    variant: "card",
    title: "Đăng ký nhận bản tin",
    description: "Nhận thông tin mới nhất về tài chính và ưu đãi đặc biệt",
    onSubmit: mockSubmit,
  },
};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    title: "Newsletter",
    placeholder: "Email...",
    buttonText: "OK",
    showPrivacyConsent: false,
    onSubmit: mockSubmit,
  },
};

export const Floating: Story = {
  args: {
    variant: "floating",
    title: "Nhận thông báo",
    description: "Đăng ký nhận tin về ưu đãi mới",
    buttonText: "Đăng ký",
    showPrivacyConsent: false,
    onSubmit: mockSubmit,
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const WithBenefits: Story = {
  args: {
    variant: "card",
    title: "Tham gia cộng đồng VIP",
    description: "Nhận những thông tin và ưu đãi độc quyền",
    benefits: [
      "Tin tức tài chính hàng ngày",
      "Mẹo đầu tư và tiết kiệm",
      "Ưu đãi độc quyền cho thành viên VIP",
      "Tư vấn miễn phí từ chuyên gia",
    ],
    buttonText: "Tham gia ngay",
    onSubmit: mockSubmit,
  },
};

export const WithPreferences: Story = {
  args: {
    variant: "card",
    title: "Tùy chỉnh thông báo",
    description: "Chọn loại thông tin bạn muốn nhận",
    showPreferences: true,
    onSubmit: mockSubmit,
  },
};

export const DarkTheme: Story = {
  args: {
    variant: "card",
    theme: "dark",
    title: "Đăng ký nhận tin",
    description: "Nhận thông tin mới nhất về sản phẩm và khuyến mãi",
    benefits: [
      "Cập nhật sản phẩm mới",
      "Ưu đãi đặc biệt",
      "Mẹo tài chính hữu ích",
    ],
    onSubmit: mockSubmit,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const PrimaryTheme: Story = {
  args: {
    variant: "card",
    theme: "primary",
    title: "Ưu đãi độc quyền",
    description: "Đăng ký để nhận những ưu đãi tốt nhất",
    benefits: [
      "Lãi suất ưu đãi đặc biệt",
      "Miễn phí các dịch vụ premium",
      "Tư vấn 1:1 với chuyên gia",
    ],
    buttonText: "Nhận ưu đãi",
    onSubmit: mockSubmit,
  },
};

export const SmallSize: Story = {
  args: {
    size: "sm",
    variant: "inline",
    title: "Newsletter",
    description: "Nhận tin mới nhất",
    showPrivacyConsent: false,
    onSubmit: mockSubmit,
  },
};

export const LargeSize: Story = {
  args: {
    size: "lg",
    variant: "card",
    title: "Trở thành thành viên VIP",
    description:
      "Tham gia cộng đồng hơn 1 triệu người dùng và nhận những quyền lợi đặc biệt",
    benefits: [
      "Lãi suất ưu đãi lên đến 2%/năm",
      "Tư vấn miễn phí với chuyên gia tài chính",
      "Ưu tiên xử lý hồ sơ vay",
      "Quà tặng chào mừng thành viên mới",
    ],
    buttonText: "Đăng ký VIP ngay",
    onSubmit: mockSubmit,
  },
};

export const Disabled: Story = {
  args: {
    variant: "card",
    title: "Sắp ra mắt",
    description: "Tính năng này sẽ sớm được cập nhật",
    disabled: true,
    buttonText: "Sắp ra mắt",
    onSubmit: mockSubmit,
  },
};

export const Loading: Story = {
  args: {
    variant: "card",
    title: "Đang xử lý",
    description: "Vui lòng chờ trong giây lát...",
    loading: true,
    buttonText: "Đang xử lý...",
    onSubmit: mockSubmit,
  },
};

export const CustomIcon: Story = {
  args: {
    variant: "card",
    title: "Ưu đãi đặc biệt",
    description: "Nhận thông báo về các chương trình khuyến mãi",
    icon: <Gift className="w-5 h-5" />,
    buttonText: "Nhận ưu đãi",
    onSubmit: mockSubmit,
  },
};

// Real-world examples
export const LoanPromotionSignup: Story = {
  name: "Loan Promotion Signup",
  render: () => (
    <div className="max-w-md mx-auto">
      <NewsletterForm
        variant="card"
        theme="primary"
        title="Ưu đãi vay đặc biệt"
        description="Đăng ký nhận thông báo về các chương trình vay với lãi suất ưu đãi"
        placeholder="Nhập email để nhận ưu đãi..."
        buttonText="Nhận ưu đãi ngay"
        icon={<TrendingUp className="w-5 h-5" />}
        benefits={[
          "Lãi suất ưu đãi từ 8.5%/năm",
          "Miễn phí thẩm định hồ sơ",
          "Giải ngân nhanh trong 24h",
          "Ưu tiên xét duyệt cho thành viên",
        ]}
        privacyText="Tôi đồng ý nhận email về các chương trình ưu đãi và chấp nhận điều khoản sử dụng"
        onSubmit={mockSubmit}
      />
    </div>
  ),
};

export const FinancialNewsletterComplete: Story = {
  name: "Financial Newsletter (Complete)",
  render: () => (
    <div className="max-w-lg mx-auto">
      <NewsletterForm
        variant="card"
        size="lg"
        title="Bản tin tài chính VIP"
        description="Nhận phân tích thị trường, mẹo đầu tư và cơ hội tài chính từ các chuyên gia hàng đầu"
        placeholder="email@example.com"
        buttonText="Tham gia miễn phí"
        icon={<Shield className="w-6 h-6" />}
        showPreferences={true}
        benefits={[
          "Phân tích thị trường hàng tuần",
          "Dự báo xu hướng lãi suất",
          "Mẹo đầu tư an toàn",
          "Cảnh báo cơ hội đầu tư",
          "Tư vấn 1:1 với chuyên gia (VIP)",
        ]}
        successMessage="Chào mừng bạn đến với cộng đồng VIP! Kiểm tra email để kích hoạt tài khoản."
        onSubmit={mockSubmit}
      />
    </div>
  ),
};

export const FooterNewsletter: Story = {
  name: "Footer Newsletter",
  render: () => (
    <div className="bg-gray-900 p-8">
      <div className="max-w-md mx-auto">
        <NewsletterForm
          variant="default"
          theme="dark"
          title="Cập nhật tin tức"
          description="Nhận thông tin mới nhất về sản phẩm và dịch vụ"
          placeholder="Địa chỉ email của bạn"
          buttonText="Đăng ký"
          showPrivacyConsent={false}
          onSubmit={mockSubmit}
        />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const QuickSignupBar: Story = {
  name: "Quick Signup Bar",
  render: () => (
    <div className="bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        <NewsletterForm
          variant="inline"
          theme="primary"
          size="md"
          title="🎉 Ưu đãi có hạn: Lãi suất 0% tháng đầu!"
          description="Đăng ký ngay để không bỏ lỡ cơ hội"
          placeholder="Email của bạn"
          buttonText="Nhận ưu đãi"
          showPrivacyConsent={false}
          icon={<Zap className="w-5 h-5" />}
          onSubmit={mockSubmit}
        />
      </div>
    </div>
  ),
};

export const SidebarWidget: Story = {
  name: "Sidebar Widget",
  render: () => (
    <div className="max-w-xs mx-auto">
      <NewsletterForm
        variant="card"
        size="sm"
        title="💡 Mẹo tài chính"
        description="Nhận mẹo quản lý tài chính hàng tuần"
        placeholder="Email..."
        buttonText="Đăng ký"
        showPrivacyConsent={false}
        benefits={[
          "Mẹo tiết kiệm hiệu quả",
          "Cách đầu tư thông minh",
          "Quản lý chi tiêu",
        ]}
        onSubmit={mockSubmit}
      />
    </div>
  ),
};
