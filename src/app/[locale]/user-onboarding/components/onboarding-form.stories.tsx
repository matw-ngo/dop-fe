import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { OnboardingForm } from "./onboarding-form";
import type { MappedFlow } from "@/mappers/flowMapper";

// --- MOCK DATA ---
const MOCK_DEFAULT_FLOW: MappedFlow = {
  id: "flow-1",
  name: "Default Lending Flow",
  description: "A mock flow for Storybook",
  status: "Active",
  createdAt: new Date(),
  updatedAt: new Date(),
  steps: [
    {
      id: "step-1",
      useEkyc: false,
      sendOtp: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: {
        fullName: { visible: true, required: true },
        email: { visible: true, required: true },
        phoneNumber: { visible: true, required: false },
        gender: { visible: true, required: true },
        purpose: { visible: false, required: false },
        nationalId: { visible: false, required: false },
        secondNationalId: { visible: false, required: false },
        location: { visible: false, required: false },
        birthday: { visible: false, required: false },
        incomeType: { visible: false, required: false },
        income: { visible: false, required: false },
        havingLoan: { visible: false, required: false },
        careerStatus: { visible: false, required: false },
        careerType: { visible: false, required: false },
        creditStatus: { visible: false, required: false },
      },
    },
    {
      id: "step-2",
      useEkyc: true,
      sendOtp: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: {} as any, // eKYC step has no regular fields
    },
  ],
};

const MOCK_ALL_FIELDS_FLOW: MappedFlow = {
  ...MOCK_DEFAULT_FLOW,
  steps: [
    {
      id: "step-all-fields",
      useEkyc: false,
      sendOtp: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: {
        fullName: { visible: true, required: true },
        email: { visible: true, required: true },
        phoneNumber: { visible: true, required: true },
        gender: { visible: true, required: true },
        purpose: { visible: false, required: false },
        nationalId: { visible: false, required: false },
        secondNationalId: { visible: false, required: false },
        location: { visible: false, required: false },
        birthday: { visible: false, required: false },
        incomeType: { visible: false, required: false },
        income: { visible: false, required: false },
        havingLoan: { visible: false, required: false },
        careerStatus: { visible: false, required: false },
        careerType: { visible: false, required: false },
        creditStatus: { visible: false, required: false },
      },
    },
  ],
};

// --- i18n ---
const messages = {
  pages: {
    userOnboardingPage: {
      title: "Loan Account Registration",
      subtitle: "Complete the following steps to start using our service",
      resetButton: "Start Over",
      noConfig: "No form configuration available.",
      loadError: "Failed to load onboarding configuration: {message}",
      successAlert: "Registration successful!",
      steps: {
        ekyc: {
          title: "Identity Verification",
          label: "eKYC Identity Verification",
          description: "Verify your identity using eKYC",
        },
        confirmation: {
          title: "Confirm Information",
          description: "Review and confirm your information",
        },
      },
      fields: {
        fullName: { label: "Full Name" },
        email: { label: "Email" },
        phoneNumber: { label: "Phone Number" },
        dateOfBirth: { label: "Date of Birth" },
        gender: {
          label: "Gender",
          options: { male: "Male", female: "Female", other: "Other" },
        },
      },
    },
  },
  form: {
    errors: { required: "This field is required" },
  },
  common: {
    error: "Error",
    retry: "Retry",
  },
};

// --- STORYBOOK META ---
const queryClient = new QueryClient();

const meta: Meta<typeof OnboardingForm> = {
  title: "Features/Onboarding/OnboardingForm",
  component: OnboardingForm,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="en" messages={messages}>
          <div className="w-[700px] p-4 bg-gray-100">
            <Story />
          </div>
        </NextIntlClientProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingForm>;

// --- STORIES ---
export const Default: Story = {
  args: {
    flowData: MOCK_DEFAULT_FLOW,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => alert("Refetch clicked!"),
  },
};

export const AllFieldTypes: Story = {
  args: {
    ...Default.args,
    flowData: MOCK_ALL_FIELDS_FLOW,
  },
};

export const Loading: Story = {
  args: {
    flowData: undefined,
    isLoading: true,
    isError: false,
    error: null,
    refetch: () => {},
  },
};

export const ErrorState: Story = {
  name: "Error State",
  args: {
    flowData: undefined,
    isLoading: false,
    isError: true,
    error: new Error("Failed to connect to the server"),
    refetch: () => alert("Refetch clicked!"),
  },
};

export const NoConfig: Story = {
  name: "With No Config Data",
  args: {
    flowData: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {},
  },
};
