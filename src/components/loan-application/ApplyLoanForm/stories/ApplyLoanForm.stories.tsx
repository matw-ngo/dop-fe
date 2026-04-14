import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import React from "react";
import { AmountField } from "../components/AmountField";
import { OtpVerificationModal } from "../components/OtpVerificationModal";
import { PeriodField } from "../components/PeriodField";
import { PhoneVerificationModal } from "../components/PhoneVerificationModal";
import { PurposeField } from "../components/PurposeField";
import { SubmitButton } from "../components/SubmitButton";
import { TermsAgreement } from "../components/TermsAgreement";

const meta = {
  title: "Loan Application/Form",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

// AmountField Stories
export const AmountFieldDefault: StoryObj<typeof AmountField> = {
  render: (args) => <AmountField {...args} />,
  args: {
    value: 20,
    onChange: fn(),
    label: "Loan Amount",
  },
};

export const AmountFieldZero: StoryObj<typeof AmountField> = {
  ...AmountFieldDefault,
  args: {
    ...AmountFieldDefault.args,
    value: 0,
  },
};

export const AmountFieldWithError: StoryObj<typeof AmountField> = {
  ...AmountFieldDefault,
  args: {
    ...AmountFieldDefault.args,
    error: "Amount is required",
  },
};

export const AmountFieldDisabled: StoryObj<typeof AmountField> = {
  ...AmountFieldDefault,
  args: {
    ...AmountFieldDefault.args,
    disabled: true,
  },
};

// PeriodField Stories
export const PeriodFieldDefault: StoryObj<typeof PeriodField> = {
  render: (args) => <PeriodField {...args} />,
  args: {
    value: 12,
    onChange: fn(),
    label: "Loan Period",
  },
};

export const PeriodFieldZero: StoryObj<typeof PeriodField> = {
  ...PeriodFieldDefault,
  args: {
    ...PeriodFieldDefault.args,
    value: 0,
  },
};

// PurposeField Stories
export const PurposeFieldDefault: StoryObj<typeof PurposeField> = {
  render: (args) => <PurposeField {...args} />,
  args: {
    value: "debt-consolidation",
    onChange: fn(),
    options: [
      { value: "debt-consolidation", label: "Debt Consolidation" },
      { value: "home-improvement", label: "Home Improvement" },
      { value: "business", label: "Business" },
    ],
    label: "Loan Purpose",
    placeholder: "Select a purpose",
  },
};

export const PurposeFieldEmpty: StoryObj<typeof PurposeField> = {
  ...PurposeFieldDefault,
  args: {
    ...PurposeFieldDefault.args,
    value: "",
  },
};

// TermsAgreement Stories
export const TermsAgreementDefault: StoryObj<typeof TermsAgreement> = {
  render: (args) => <TermsAgreement {...args} />,
  args: {
    value: "",
    onChange: fn(),
  },
};

export const TermsAgreementAgreed: StoryObj<typeof TermsAgreement> = {
  ...TermsAgreementDefault,
  args: {
    ...TermsAgreementDefault.args,
    value: "1",
  },
};

export const TermsAgreementDisagreed: StoryObj<typeof TermsAgreement> = {
  ...TermsAgreementDefault,
  args: {
    ...TermsAgreementDefault.args,
    value: "0",
  },
};

export const TermsAgreementWithError: StoryObj<typeof TermsAgreement> = {
  ...TermsAgreementDefault,
  args: {
    ...TermsAgreementDefault.args,
    error: "You must agree to the terms",
  },
};

// SubmitButton Stories
export const SubmitButtonDefault: StoryObj<typeof SubmitButton> = {
  render: (args) => <SubmitButton {...args} />,
  args: {
    isSubmitting: false,
    label: "Submit Application",
  },
};

export const SubmitButtonLoading: StoryObj<typeof SubmitButton> = {
  ...SubmitButtonDefault,
  args: {
    ...SubmitButtonDefault.args,
    isSubmitting: true,
  },
};

export const SubmitButtonDisabled: StoryObj<typeof SubmitButton> = {
  ...SubmitButtonDefault,
  args: {
    ...SubmitButtonDefault.args,
    disabled: true,
  },
};

// PhoneVerificationModal Stories
export const PhoneVerificationModalDefault: StoryObj<
  typeof PhoneVerificationModal
> = {
  render: (args) => <PhoneVerificationModal {...args} />,
  args: {
    open: true,
    onClose: fn(),
    onVerify: fn(),
    title: "Verify Your Phone Number",
    description: "Please enter your phone number to continue",
  },
};

export const PhoneVerificationModalClosed: StoryObj<
  typeof PhoneVerificationModal
> = {
  ...PhoneVerificationModalDefault,
  args: {
    ...PhoneVerificationModalDefault.args,
    open: false,
  },
};

// OtpVerificationModal Stories
export const OtpVerificationModalDefault: StoryObj<
  typeof OtpVerificationModal
> = {
  render: (args) => <OtpVerificationModal {...args} />,
  args: {
    open: true,
    onClose: fn(),
    phoneNumber: "0912345678",
    onSuccess: fn(),
    onFailure: fn(),
    onExpired: fn(),
  },
};

export const OtpVerificationModalClosed: StoryObj<typeof OtpVerificationModal> =
  {
    ...OtpVerificationModalDefault,
    args: {
      ...OtpVerificationModalDefault.args,
      open: false,
    },
  };

// Combined Stories
export const CompleteForm: StoryObj = {
  render: () => {
    const [amount, setAmount] = React.useState(20);
    const [period, setPeriod] = React.useState(12);
    const [purpose, setPurpose] = React.useState("debt-consolidation");
    const [phone] = React.useState("0912345678");
    const [agreeStatus, setAgreeStatus] = React.useState("");
    const [showPhoneModal, setShowPhoneModal] = React.useState(false);
    const [showOtpModal, setShowOtpModal] = React.useState(false);

    const purposes = [
      { value: "debt-consolidation", label: "Debt Consolidation" },
      { value: "home-improvement", label: "Home Improvement" },
      { value: "business", label: "Business" },
    ];

    return (
      <div className="max-w-2xl mx-auto p-4">
        <AmountField
          value={amount}
          onChange={setAmount}
          label="Expected Amount"
        />
        <PeriodField value={period} onChange={setPeriod} label="Loan Period" />
        <PurposeField
          value={purpose}
          onChange={setPurpose}
          options={purposes}
          label="Loan Purpose"
          placeholder="Select a purpose"
        />
        <TermsAgreement value={agreeStatus} onChange={setAgreeStatus} />
        <SubmitButton
          isSubmitting={false}
          onClick={() => setShowPhoneModal(true)}
        />
        <PhoneVerificationModal
          open={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onVerify={(_phone) => {
            setShowPhoneModal(false);
            setShowOtpModal(true);
          }}
        />
        <OtpVerificationModal
          open={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          phoneNumber={phone}
          onSuccess={() => setShowOtpModal(false)}
          onFailure={fn()}
          onExpired={fn()}
        />
      </div>
    );
  },
};
