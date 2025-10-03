import type { Meta, StoryObj } from "@storybook/react";
import { LoanRegistrationWidget } from "./loan-registration-widget";
import {
  CreditCard,
  Building,
  Calculator,
  Shield,
  Clock,
  Smartphone,
  Users,
  CheckCircle,
  Zap,
  Globe,
  Award,
} from "lucide-react";

const meta: Meta<typeof LoanRegistrationWidget> = {
  title: "Organisms/LoanRegistrationWidget",
  component: LoanRegistrationWidget,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Complete loan registration widget with tabs, calculator, benefits, and application form.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "detailed"],
      description: "Visual variant of the widget",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the widget",
    },
    showBenefits: {
      control: "boolean",
      description: "Show benefits section",
    },
    showProgress: {
      control: "boolean",
      description: "Show progress indicator",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoanRegistrationWidget>;

// Sample loan types data
const sampleLoanTypes = [
  {
    id: "consumer",
    name: "Vay tiêu dùng",
    description:
      "Giải pháp tài chính linh hoạt cho mọi nhu cầu cá nhân với lãi suất ưu đãi",
    icon: <CreditCard className="w-5 h-5" />,
    badge: "Phổ biến",
    minAmount: 5_000_000,
    maxAmount: 500_000_000,
    minDuration: 6,
    maxDuration: 60,
    interestRate: { min: 8.5, max: 15.0 },
    features: [
      "100% trực tuyến",
      "Không cần thế chấp",
      "Duyệt nhanh trong 24h",
      "Giải ngân trong ngày",
      "Trả trước không phạt",
      "Lãi suất cạnh tranh",
    ],
    benefits: [
      {
        icon: <Smartphone className="w-4 h-4" />,
        title: "100% online",
        description: "Hoàn toàn trực tuyến, không cần đến ngân hàng",
      },
      {
        icon: <Shield className="w-4 h-4" />,
        title: "Bảo mật thông tin",
        description: "Mã hóa SSL 256-bit, cam kết không chia sẻ thông tin",
      },
      {
        icon: <Clock className="w-4 h-4" />,
        title: "Duyệt nhanh 24h",
        description: "AI phê duyệt tự động, giải ngân trong ngày",
      },
      {
        icon: <CheckCircle className="w-4 h-4" />,
        title: "Không cần thế chấp",
        description: "Chỉ cần CMND và sao kê thu nhập",
      },
    ],
  },
  {
    id: "business",
    name: "Vay kinh doanh",
    description:
      "Hỗ trợ vốn cho doanh nghiệp và cá nhân kinh doanh phát triển bền vững",
    icon: <Building className="w-5 h-5" />,
    badge: "Doanh nghiệp",
    minAmount: 50_000_000,
    maxAmount: 5_000_000_000,
    minDuration: 12,
    maxDuration: 120,
    interestRate: { min: 10.0, max: 18.0 },
    features: [
      "Hạn mức lên đến 5 tỷ",
      "Thời hạn linh hoạt đến 10 năm",
      "Thế chấp đa dạng",
      "Tư vấn chuyên nghiệp",
      "Lịch trả nợ linh hoạt",
      "Ưu đãi khách hàng VIP",
    ],
    benefits: [
      {
        icon: <Building className="w-4 h-4" />,
        title: "Dành cho doanh nghiệp",
        description: "Hỗ trợ đặc biệt cho SME và startup",
      },
      {
        icon: <Globe className="w-4 h-4" />,
        title: "Mạng lưới rộng",
        description: "Hỗ trợ trên toàn quốc với 500+ điểm giao dịch",
      },
      {
        icon: <Users className="w-4 h-4" />,
        title: "Tư vấn chuyên nghiệp",
        description: "Đội ngũ chuyên gia với 10+ năm kinh nghiệm",
      },
      {
        icon: <Award className="w-4 h-4" />,
        title: "Uy tín hàng đầu",
        description: "Được tin tưởng bởi 50,000+ doanh nghiệp",
      },
    ],
  },
  {
    id: "installment",
    name: "Vay trả góp",
    description:
      "Mua sắm thông minh với hình thức trả góp linh hoạt và lãi suất ưu đãi",
    icon: <Calculator className="w-5 h-5" />,
    badge: "Mới",
    minAmount: 3_000_000,
    maxAmount: 200_000_000,
    minDuration: 6,
    maxDuration: 36,
    interestRate: { min: 0, max: 12.0 },
    features: [
      "Lãi suất 0% tháng đầu",
      "Trả góp 6-36 tháng",
      "Duyệt tức thì",
      "Mua ngay nhận ngay",
      "Đối tác đa dạng",
      "Không phí ẩn",
    ],
    benefits: [
      {
        icon: <Zap className="w-4 h-4" />,
        title: "Duyệt tức thì",
        description: "Phê duyệt trong 5 phút, mua ngay nhận ngay",
      },
      {
        icon: <Calculator className="w-4 h-4" />,
        title: "Lãi suất 0%",
        description: "Tháng đầu tiên hoàn toàn miễn phí lãi suất",
      },
      {
        icon: <CheckCircle className="w-4 h-4" />,
        title: "Thủ tục đơn giản",
        description: "Chỉ cần CMND và xác nhận thu nhập",
      },
      {
        icon: <Globe className="w-4 h-4" />,
        title: "Đối tác đa dạng",
        description: "Hợp tác với 1000+ cửa hàng trên toàn quốc",
      },
    ],
  },
];

export const Default: Story = {
  args: {
    loanTypes: sampleLoanTypes,
    onSubmit: async (data) => {
      console.log("Loan application submitted:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
    size: "sm",
    loanTypes: sampleLoanTypes,
    showBenefits: false,
    onSubmit: async (data) => {
      console.log("Compact loan application:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
  },
};

export const Detailed: Story = {
  args: {
    variant: "detailed",
    size: "lg",
    loanTypes: sampleLoanTypes,
    title: "Đăng ký khoản vay trực tuyến",
    description:
      "Chọn sản phẩm vay phù hợp nhất với nhu cầu tài chính của bạn. Quy trình 100% trực tuyến, nhanh chóng và an toàn.",
    showBenefits: true,
    showProgress: true,
    onSubmit: async (data) => {
      console.log("Detailed loan application:", data);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
  },
};

export const SingleLoanType: Story = {
  args: {
    loanTypes: [sampleLoanTypes[0]], // Only consumer loan
    title: "Vay tiêu dùng nhanh chóng",
    description: "Giải pháp tài chính tức thì cho mọi nhu cầu cá nhân",
    showProgress: false,
    onSubmit: async (data) => {
      console.log("Single loan application:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

export const WithoutBenefits: Story = {
  args: {
    loanTypes: sampleLoanTypes,
    showBenefits: false,
    title: "Đăng ký vay nhanh",
    description: "Chọn và tính toán khoản vay phù hợp",
    onSubmit: async (data) => {
      console.log("No benefits loan application:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
  },
};
