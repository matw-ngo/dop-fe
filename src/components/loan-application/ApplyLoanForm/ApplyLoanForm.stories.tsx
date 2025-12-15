import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import React from "react";
import ApplyLoanForm from "./index";

const meta: Meta<typeof ApplyLoanForm> = {
  title: "Components/ApplyLoanForm",
  component: ApplyLoanForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "ApplyLoanForm component for loan application with amount slider, period selector, purpose dropdown, and terms agreement.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    // Since it's a self-contained component with its own state,
    // we don't have direct props to control
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if main elements are present
    expect(canvas.getByText("Số tiền vay:")).toBeInTheDocument();
    expect(canvas.getByText("Thời hạn vay:")).toBeInTheDocument();
    expect(canvas.getByText("Mục đích vay")).toBeInTheDocument();
    expect(canvas.getByText("Điều khoản sử dụng dịch vụ")).toBeInTheDocument();
    expect(canvas.getByText("Bắt đầu tìm kiếm khoản vay")).toBeInTheDocument();
  },
};

// Story with pre-filled values
export const WithPreFilledValues: Story = {
  render: () => {
    // We'll create a wrapper component to set initial values
    return <ApplyLoanForm />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Simulate user interactions
    const amountSlider = canvas.getByRole("slider", { name: /amount/i });
    await userEvent.click(amountSlider, { clientX: 200 });

    const periodSlider = canvas.getAllByRole("slider")[1];
    await userEvent.click(periodSlider, { clientX: 200 });

    const purposeSelect = canvas.getByRole("combobox");
    await userEvent.selectOptions(purposeSelect, "consumer_loan");

    // Check if phone modal appears after clicking submit
    const agreeRadio = canvas.getByLabelText(
      "Tôi đồng ý và muốn sử dụng dịch vụ.",
    );
    await userEvent.click(agreeRadio);

    const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
    await userEvent.click(submitButton);

    // Check if phone modal appears
    await expect(canvas.getByText("Nhập số điện thoại")).toBeInTheDocument();
  },
};

// Story with phone modal visible
export const PhoneModalVisible: Story = {
  render: () => {
    const ModifiedComponent = () => {
      const [showModal, setShowModal] = React.useState(true);

      // We need to override the showModal state
      React.useEffect(() => {
        const originalShowModal = React.useState;
        (React as any).useState = (initial: any) => {
          if (initial === false) return [showModal, setShowModal];
          if (
            typeof initial === "function" &&
            initial.toString().includes("showPhoneModal")
          ) {
            return [showModal, setShowModal];
          }
          return originalShowModal(initial);
        };

        return () => {
          (React as any).useState = originalShowModal;
        };
      }, []);

      return <ApplyLoanForm />;
    };

    return <ModifiedComponent />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if modal elements are present
    expect(canvas.getByText("Nhập số điện thoại")).toBeInTheDocument();
    expect(
      canvas.getByText(
        "Nhập số điện thoại của bạn để tiếp tục tìm kiếm khoản vay",
      ),
    ).toBeInTheDocument();
    expect(canvas.getByPlaceholderText("Số điện thoại")).toBeInTheDocument();
    expect(canvas.getByText("Tiếp Tục")).toBeInTheDocument();
  },
};

// Story with OTP modal visible
export const OTPModalVisible: Story = {
  render: () => {
    const ModifiedComponent = () => {
      const [showOTPModal, setShowOTPModal] = React.useState(true);

      React.useEffect(() => {
        const originalUseState = React.useState;
        (React as any).useState = (initial: any) => {
          if (initial === false && showOTPModal) {
            const match = new Error().stack?.match(/useState.*OTP/);
            if (match) return [true, setShowOTPModal];
          }
          return originalUseState(initial);
        };
      }, []);

      return <ApplyLoanForm />;
    };

    return <ModifiedComponent />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if OTP modal is present
    expect(
      canvas.getByText(
        "Vui lòng nhập mã OTP đã được gửi đến điện thoại của bạn",
      ),
    ).toBeInTheDocument();

    // Check if there are 4 OTP input fields
    const otpInputs = canvas.getAllByRole("textbox");
    expect(otpInputs).toHaveLength(4);
  },
};

// Story with form validation errors
export const WithValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Try to submit without filling form
    const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
    await userEvent.click(submitButton);

    // Should show validation error
    expect(canvas.getByText("Vui lòng chọn khoản vay")).toBeInTheDocument();
  },
};

// Story testing sliders
export const InteractWithSliders: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Test amount slider
    await step("Select loan amount", async () => {
      const amountSlider = canvas.getByRole("slider");
      await userEvent.click(amountSlider, { clientX: 300 });

      // Check if amount is displayed
      expect(canvas.getByText(/\d+\.000\.000đ/)).toBeInTheDocument();
    });

    // Test period slider
    await step("Select loan period", async () => {
      const periodSlider = canvas.getAllByRole("slider")[1];
      await userEvent.click(periodSlider, { clientX: 300 });

      // Check if period is displayed
      expect(canvas.getByText(/\d+\stháng/)).toBeInTheDocument();
    });
  },
};

// Story testing purpose selection
export const SelectLoanPurpose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select loan purpose
    const purposeSelect = canvas.getByRole("combobox");
    await userEvent.selectOptions(purposeSelect, "student_loan");

    expect(canvas.getByDisplayValue("Vay học tập/học phí")).toBeInTheDocument();
  },
};

// Story with mobile viewport
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check responsive behavior
    expect(canvas.getByText("Số tiền vay:")).toBeInTheDocument();

    // Radio buttons should have smaller text on mobile
    const radioLabels = canvas.getAllByText(/Tôi (đồng ý|không đồng ý)/);
    radioLabels.forEach((label) => {
      expect(label).toHaveClass("md:text-xs");
    });
  },
};

// Accessibility testing story
export const AccessibilityTest: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Check form labels", async () => {
      // All form elements should have proper labels
      expect(canvas.getByLabelText("Số tiền vay:")).toBeInTheDocument();
      expect(canvas.getByLabelText("Thời hạn vay:")).toBeInTheDocument();
      expect(canvas.getByLabelText("Mục đích vay")).toBeInTheDocument();
    });

    await step("Check radio buttons", async () => {
      const agreeRadio = canvas.getByLabelText(
        "Tôi đồng ý và muốn sử dụng dịch vụ.",
      );
      const disagreeRadio = canvas.getByLabelText(
        "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
      );

      expect(agreeRadio).toBeInTheDocument();
      expect(disagreeRadio).toBeInTheDocument();
    });

    await step("Check keyboard navigation", async () => {
      // Tab through form elements
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();

      // Focus should be on submit button
      const submitButton = canvas.getByText("Bắt đầu tìm kiếm khoản vay");
      expect(submitButton).toHaveFocus();
    });
  },
};
