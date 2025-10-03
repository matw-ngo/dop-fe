import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TabGroup, TabItem } from "./tab-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building,
  Calculator,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";

// Sample content for tabs
const LoanContent = ({ type }: { type: string }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        {type}
      </CardTitle>
      <CardDescription>
        Điều khoản và điều kiện cho {type.toLowerCase()}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`amount-${type}`}>Số tiền vay</Label>
          <Input id={`amount-${type}`} placeholder="Nhập số tiền..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`duration-${type}`}>Thời hạn</Label>
          <Input id={`duration-${type}`} placeholder="Nhập thời hạn..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">
          <Calculator className="h-4 w-4 mr-2" />
          Tính toán
        </Button>
        <Button variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Điều khoản
        </Button>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Lãi suất từ <span className="font-bold text-primary">8.5%/năm</span>
        </p>
      </div>
    </CardContent>
  </Card>
);

const meta: Meta<typeof TabGroup> = {
  title: "Molecules/TabGroup",
  component: TabGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "TabGroup component for organizing content into tabs. Supports multiple variants, sizes, and orientations.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "pills", "underline"],
      description: "Visual style of the tabs",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the tabs",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Layout orientation",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabGroup>;

// Basic loan types tabs
const loanTabs = [
  {
    id: "consumer",
    label: "Vay tiêu dùng",
    content: <LoanContent type="Vay tiêu dùng" />,
  },
  {
    id: "business",
    label: "Vay kinh doanh",
    content: <LoanContent type="Vay kinh doanh" />,
  },
  {
    id: "installment",
    label: "Vay trả góp",
    content: <LoanContent type="Vay trả góp" />,
  },
];

// Tabs with badges
const tabsWithBadges = [
  {
    id: "new",
    label: "Sản phẩm mới",
    badge: "3",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sản phẩm mới</h3>
        <div className="grid gap-2">
          <Badge variant="secondary">Vay nhanh 24h</Badge>
          <Badge variant="secondary">Vay không thế chấp</Badge>
          <Badge variant="secondary">Vay online 100%</Badge>
        </div>
      </div>
    ),
  },
  {
    id: "popular",
    label: "Phổ biến",
    badge: "5",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sản phẩm phổ biến</h3>
        <div className="grid gap-2">
          <Badge>Vay tiêu dùng</Badge>
          <Badge>Vay mua nhà</Badge>
          <Badge>Vay mua xe</Badge>
          <Badge>Vay kinh doanh</Badge>
          <Badge>Vay du học</Badge>
        </div>
      </div>
    ),
  },
  {
    id: "premium",
    label: "Premium",
    badge: "VIP",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gói Premium</h3>
        <p className="text-muted-foreground">
          Các sản phẩm dành cho khách hàng VIP với ưu đãi đặc biệt
        </p>
        <Button variant="outline" className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" />
          Tìm hiểu thêm
        </Button>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    items: loanTabs,
    variant: "default",
    size: "md",
  },
};

export const Pills: Story = {
  args: {
    items: loanTabs,
    variant: "pills",
    size: "md",
  },
};

export const Underline: Story = {
  args: {
    items: loanTabs,
    variant: "underline",
    size: "md",
  },
};

export const WithBadges: Story = {
  args: {
    items: tabsWithBadges,
    variant: "pills",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    items: loanTabs,
    variant: "default",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    items: loanTabs,
    variant: "pills",
    size: "lg",
  },
};

export const Vertical: Story = {
  args: {
    items: loanTabs,
    variant: "pills",
    orientation: "vertical",
  },
  parameters: {
    layout: "centered",
  },
};

export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("consumer");

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "consumer" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("consumer")}
          >
            Consumer
          </Button>
          <Button
            variant={activeTab === "business" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("business")}
          >
            Business
          </Button>
          <Button
            variant={activeTab === "installment" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("installment")}
          >
            Installment
          </Button>
        </div>

        <TabGroup
          items={loanTabs}
          value={activeTab}
          onValueChange={setActiveTab}
          variant="underline"
        />
      </div>
    );
  },
};

export const WithDisabledTab: Story = {
  args: {
    items: [
      ...loanTabs.slice(0, 2),
      {
        id: "installment",
        label: "Vay trả góp",
        content: <LoanContent type="Vay trả góp" />,
        disabled: true,
      },
    ],
    variant: "pills",
  },
};

export const LoanApplicationForm: Story = {
  name: "Loan Application Form",
  render: () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Đăng ký khoản vay</h2>
        <p className="text-muted-foreground">
          Chọn loại hình vay phù hợp với nhu cầu của bạn
        </p>
      </div>

      <TabGroup
        items={[
          {
            id: "consumer",
            label: "Vay tiêu dùng",
            badge: "HOT",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Vay tiêu dùng - Giải pháp tài chính linh hoạt
                  </CardTitle>
                  <CardDescription>
                    Lãi suất ưu đãi từ 8.5%/năm • Duyệt nhanh trong 24h • Không
                    cần thế chấp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số tiền vay *</Label>
                      <Input placeholder="Từ 5,000,000đ - 500,000,000đ" />
                    </div>
                    <div className="space-y-2">
                      <Label>Thời hạn vay *</Label>
                      <Input placeholder="6 - 60 tháng" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mục đích vay</Label>
                      <Input placeholder="Tiêu dùng cá nhân" />
                    </div>
                    <div className="space-y-2">
                      <Label>Thu nhập hàng tháng</Label>
                      <Input placeholder="Từ 8,000,000đ" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">8.5%</p>
                      <p className="text-sm text-muted-foreground">
                        Lãi suất/năm
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">24h</p>
                      <p className="text-sm text-muted-foreground">
                        Thời gian duyệt
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">500M</p>
                      <p className="text-sm text-muted-foreground">
                        Hạn mức tối đa
                      </p>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    ĐĂNG KÝ VAY NGAY
                  </Button>
                </CardContent>
              </Card>
            ),
          },
          {
            id: "business",
            label: "Vay kinh doanh",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Vay kinh doanh - Phát triển doanh nghiệp
                  </CardTitle>
                  <CardDescription>
                    Lãi suất từ 10%/năm • Hạn mức lên đến 5 tỷ • Thế chấp linh
                    hoạt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số tiền vay *</Label>
                      <Input placeholder="Từ 50,000,000đ - 5,000,000,000đ" />
                    </div>
                    <div className="space-y-2">
                      <Label>Thời hạn vay *</Label>
                      <Input placeholder="12 - 120 tháng" />
                    </div>
                    <div className="space-y-2">
                      <Label>Loại hình kinh doanh</Label>
                      <Input placeholder="VD: Bán lẻ, Dịch vụ..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Doanh thu hàng tháng</Label>
                      <Input placeholder="Từ 100,000,000đ" />
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Building className="h-5 w-5 mr-2" />
                    ĐĂNG KÝ VAY KINH DOANH
                  </Button>
                </CardContent>
              </Card>
            ),
          },
          {
            id: "installment",
            label: "Vay trả góp",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Vay trả góp - Mua sắm thông minh
                  </CardTitle>
                  <CardDescription>
                    Lãi suất 0% tháng đầu • Trả góp linh hoạt • Duyệt tức thì
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sản phẩm muốn mua *</Label>
                      <Input placeholder="VD: iPhone, Laptop, Xe máy..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Giá trị sản phẩm *</Label>
                      <Input placeholder="Từ 3,000,000đ" />
                    </div>
                    <div className="space-y-2">
                      <Label>Thời gian trả góp</Label>
                      <Input placeholder="6 - 24 tháng" />
                    </div>
                    <div className="space-y-2">
                      <Label>Số tiền trả trước</Label>
                      <Input placeholder="Tối thiểu 20%" />
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Calculator className="h-5 w-5 mr-2" />
                    ĐĂNG KÝ TRẢ GÓP
                  </Button>
                </CardContent>
              </Card>
            ),
          },
        ]}
        variant="pills"
        size="lg"
      />
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
