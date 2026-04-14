import type { Meta, StoryObj } from "@storybook/react";
import { SuccessView } from "./views/SuccessView";
import { EmptyState } from "./views/EmptyState";
import { ErrorState } from "./views/ErrorState";
import { ProductListView } from "./views/ProductListView";
import { ProductCard } from "./components/ProductCard";
import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { defaultTheme } from "@/components/form-generation/themes/default";
import { finzoneTheme } from "@/configs/themes/finzone-theme";
import type { components } from "@/lib/api/v1/dop";

type MatchedProduct = components["schemas"]["matched_product"];

const mockProducts: MatchedProduct[] = [
  {
    product_id: "1",
    product_name: "Vay Tiêu Dùng VPBank",
    product_type: "personal_loan",
    partner_id: "vpbank-001",
    partner_name: "VPBank",
    partner_code: "VPB",
  },
  {
    product_id: "2",
    product_name: "Vay Thế Chấp TPBank",
    product_type: "mortgage_loan",
    partner_id: "tpbank-001",
    partner_name: "TPBank",
    partner_code: "TPB",
  },
  {
    product_id: "3",
    product_name: "Vay Tiêu Dùng Fe Credit",
    product_type: "personal_loan",
    partner_id: "fecredit-001",
    partner_name: "FE Credit",
    partner_code: "FEC",
  },
];

const meta: Meta = {
  title: "Loan Application/LoanResult",
  component: ProductListView,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <FormThemeProvider theme={defaultTheme}>
        <div className="min-h-[400px] w-full bg-gray-50 p-8">
          <Story />
        </div>
      </FormThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SuccessState: Story = {
  render: () => (
    <SuccessView
      forwardResult={{
        status: "forwarded",
        partner_id: "vpbank-001",
        partner_name: "VPBank",
        partner_lead_id: "LEAD-2024-001",
      }}
    />
  ),
};

export const SuccessStateNoLeadId: Story = {
  render: () => (
    <SuccessView
      forwardResult={{
        status: "forwarded",
        partner_id: "tpbank-001",
        partner_name: "TPBank",
      }}
    />
  ),
};

export const EmptyStateDefault: Story = {
  render: () => <EmptyState />,
};

export const EmptyStateWithActions: Story = {
  render: () => (
    <EmptyState
      onBack={() => console.log("Back")}
      onRetry={() => console.log("Retry")}
    />
  ),
};

export const ErrorStateRejected: Story = {
  render: () => <ErrorState status="rejected" />,
};

export const ErrorStateExhausted: Story = {
  render: () => <ErrorState status="exhausted" />,
};

export const ErrorStateWithMessage: Story = {
  render: () => (
    <ErrorState
      error="Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau."
      status="error"
    />
  ),
};

export const ErrorStateWithActions: Story = {
  render: () => (
    <ErrorState
      status="rejected"
      onBack={() => console.log("Back")}
      onRetry={() => console.log("Retry")}
    />
  ),
};

export const ProductList: Story = {
  render: () => <ProductListView products={mockProducts} />,
};

export const ProductListWithSelect: Story = {
  render: () => (
    <ProductListView
      products={mockProducts}
      onSelectProduct={(product) => console.log("Selected:", product)}
    />
  ),
};

export const ProductListEmpty: Story = {
  render: () => <ProductListView products={[]} />,
};

export const ProductCardDefault: Story = {
  render: () => <ProductCard product={mockProducts[0]} index={0} />,
};

export const ProductCardMultiple: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockProducts.map((product, index) => (
        <ProductCard key={product.product_id} product={product} index={index} />
      ))}
    </div>
  ),
};

export const FinzoneTheme: Story = {
  decorators: [
    (Story) => (
      <FormThemeProvider theme={finzoneTheme}>
        <div className="min-h-[400px] w-full bg-gray-50 p-8">
          <Story />
        </div>
      </FormThemeProvider>
    ),
  ],
  render: () => (
    <SuccessView
      forwardResult={{
        status: "forwarded",
        partner_id: "vpbank-001",
        partner_name: "VPBank",
        partner_lead_id: "LEAD-2024-001",
      }}
    />
  ),
};
