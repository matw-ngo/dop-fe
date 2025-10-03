import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./footer";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  Award,
  Globe,
} from "lucide-react";

const meta: Meta<typeof Footer> = {
  title: "Organisms/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded", // Changed from fullscreen to test
    docs: {
      description: {
        component:
          "Footer component with navigation links, contact info, newsletter signup and social media links.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "minimal", "detailed", "newsletter-focus"],
      description: "Visual variant of the footer",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the footer",
    },
    background: {
      control: "select",
      options: ["default", "dark", "gradient"],
      description: "Background style",
    },
    showBackToTop: {
      control: "boolean",
      description: "Show back to top button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

// Sample data
const sampleColumns = [
  {
    title: "Sản phẩm",
    links: [
      { title: "Vay tiêu dùng", href: "/loans/personal" },
      { title: "Vay kinh doanh", href: "/loans/business" },
      { title: "Vay mua nhà", href: "/loans/home", badge: "Mới" },
      { title: "Vay trả góp", href: "/loans/installment" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { title: "Trung tâm trợ giúp", href: "/help" },
      { title: "Liên hệ", href: "/contact" },
      { title: "Câu hỏi thường gặp", href: "/faq" },
      { title: "Hướng dẫn vay", href: "/guides" },
    ],
  },
  {
    title: "Công ty",
    links: [
      { title: "Về chúng tôi", href: "/about" },
      { title: "Tuyển dụng", href: "/careers", badge: "Hot" },
      { title: "Tin tức", href: "/news" },
      { title: "Đối tác", href: "/partners" },
    ],
  },
];

const sampleSocialLinks = [
  {
    platform: "Facebook",
    href: "https://facebook.com",
    icon: <Facebook className="w-4 h-4" />,
  },
  {
    platform: "Twitter",
    href: "https://twitter.com",
    icon: <Twitter className="w-4 h-4" />,
  },
  {
    platform: "Instagram",
    href: "https://instagram.com",
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    platform: "LinkedIn",
    href: "https://linkedin.com",
    icon: <Linkedin className="w-4 h-4" />,
  },
];

const sampleContactInfo = {
  phone: "1900 1234",
  email: "support@loanapp.vn",
  address: "Tầng 10, Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP.HCM",
  workingHours: "T2-T6: 8:00-18:00, T7: 8:00-12:00",
};

const sampleCertifications = [
  {
    name: "ISO 27001",
    icon: <Shield className="w-4 h-4" />,
    description: "Chứng nhận bảo mật thông tin",
  },
  {
    name: "PCI DSS",
    icon: <Award className="w-4 h-4" />,
    description: "Chuẩn bảo mật thanh toán",
  },
  {
    name: "Giám sát NHNN",
    icon: <Globe className="w-4 h-4" />,
    description: "Được giám sát bởi Ngân hàng Nhà nước",
  },
];

export const Default: Story = {
  args: {
    columns: sampleColumns,
    socialLinks: sampleSocialLinks,
    contactInfo: sampleContactInfo,
    bottomText: {
      copyright: "© 2024 LoanApp. Tất cả các quyền được bảo lưu.",
      links: [
        { title: "Điều khoản sử dụng", href: "/terms" },
        { title: "Chính sách bảo mật", href: "/privacy" },
        { title: "Chính sách cookie", href: "/cookies" },
      ],
    },
  },
};

export const ThemeTest: Story = {
  name: "Theme Test (Use Toolbar)",
  args: {
    columns: sampleColumns.slice(0, 2),
    socialLinks: sampleSocialLinks,
    contactInfo: sampleContactInfo,
    description:
      "Test changing themes using the toolbar above. This should adapt to different themes.",
    bottomText: {
      copyright: "© 2024 Theme Test Footer",
    },
  },
};
