import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./header";
import {
  CreditCard,
  Building,
  Calculator,
  FileText,
  HelpCircle,
  Users,
  TrendingUp,
  Shield,
  Phone,
} from "lucide-react";

const meta: Meta<typeof Header> = {
  title: "Organisms/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Header component with navigation, logo, contact info and responsive mobile menu.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "minimal", "sticky", "transparent"],
      description: "Visual variant of the header",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the header",
    },
    showContactInfo: {
      control: "boolean",
      description: "Show contact information bar",
    },
    showLanguageSwitch: {
      control: "boolean",
      description: "Show language switcher",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

// Sample navigation data
const sampleNavigation = [
  {
    title: "Sản phẩm vay",
    icon: <CreditCard className="w-4 h-4" />,
    children: [
      {
        title: "Vay tiêu dùng",
        href: "/loans/personal",
        description: "Vay nhanh cho nhu cầu cá nhân với lãi suất ưu đãi",
        icon: <Users className="w-4 h-4" />,
        badge: "Phổ biến",
      },
      {
        title: "Vay kinh doanh",
        href: "/loans/business",
        description: "Hỗ trợ vốn cho doanh nghiệp và cá nhân kinh doanh",
        icon: <Building className="w-4 h-4" />,
      },
      {
        title: "Vay mua nhà",
        href: "/loans/home",
        description: "Thực hiện ước mơ có nhà với lãi suất cạnh tranh",
        icon: <Shield className="w-4 h-4" />,
        badge: "Mới",
      },
      {
        title: "Vay trả góp",
        href: "/loans/installment",
        description: "Mua sắm thông minh với hình thức trả góp linh hoạt",
        icon: <Calculator className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Công cụ",
    icon: <Calculator className="w-4 h-4" />,
    children: [
      {
        title: "Máy tính khoản vay",
        href: "/calculator",
        description: "Tính toán số tiền vay và lãi suất phù hợp",
        icon: <Calculator className="w-4 h-4" />,
      },
      {
        title: "So sánh lãi suất",
        href: "/compare",
        description: "So sánh lãi suất từ các ngân hàng khác nhau",
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Hướng dẫn",
    href: "/guides",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    title: "Hỗ trợ",
    href: "/support",
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

const contactInfo = {
  phone: "1900 1234",
  email: "support@loanapp.vn",
  address: "Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM",
};

export const Default: Story = {
  args: {
    navigation: sampleNavigation,
    actions: {
      login: {
        text: "Đăng nhập",
        href: "/login",
        variant: "ghost",
      },
      cta: {
        text: "Đăng ký vay",
        href: "/apply",
        variant: "default",
      },
    },
  },
};

export const WithContactInfo: Story = {
  args: {
    navigation: sampleNavigation,
    contactInfo,
    showContactInfo: true,
    actions: {
      login: {
        text: "Đăng nhập",
        href: "/login",
        variant: "ghost",
      },
      cta: {
        text: "Đăng ký vay ngay",
        href: "/apply",
        variant: "default",
      },
    },
  },
};

export const WithLanguageSwitch: Story = {
  args: {
    navigation: sampleNavigation,
    showLanguageSwitch: true,
    currentLanguage: "vi",
    actions: {
      login: {
        text: "Đăng nhập",
        href: "/login",
        variant: "ghost",
      },
      cta: {
        text: "Apply Now",
        href: "/apply",
        variant: "default",
      },
    },
    onLanguageChange: (lang) => console.log("Language changed to:", lang),
  },
};

export const Sticky: Story = {
  args: {
    variant: "sticky",
    navigation: sampleNavigation,
    actions: {
      login: {
        text: "Đăng nhập",
        href: "/login",
        variant: "ghost",
      },
      cta: {
        text: "Đăng ký vay",
        href: "/apply",
        variant: "default",
      },
    },
  },
  render: (args) => (
    <div>
      <Header {...args} />
      <div className="h-[200vh] bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="pt-20">
          <h1 className="text-4xl font-bold text-center mb-8">
            Scroll to see sticky header effect
          </h1>
          <p className="text-center text-muted-foreground">
            The header will become fixed and gain a backdrop blur effect when
            scrolling.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    navigation: [
      { title: "Trang chủ", href: "/" },
      { title: "Sản phẩm", href: "/products" },
      { title: "Về chúng tôi", href: "/about" },
      { title: "Liên hệ", href: "/contact" },
    ],
    actions: {
      login: {
        text: "Đăng nhập",
        href: "/login",
        variant: "ghost",
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    navigation: sampleNavigation,
    contactInfo,
    showContactInfo: true,
    showLanguageSwitch: true,
    actions: {
      login: {
        text: "Đăng nhập tài khoản",
        href: "/login",
        variant: "outline",
      },
      cta: {
        text: "Đăng ký vay ngay",
        href: "/apply",
        variant: "default",
      },
    },
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    navigation: [
      { title: "Vay nhanh", href: "/quick-loan" },
      { title: "Máy tính", href: "/calculator" },
      { title: "Hỗ trợ", href: "/support" },
    ],
    actions: {
      cta: {
        text: "Vay ngay",
        href: "/apply",
        variant: "default",
      },
    },
  },
};
