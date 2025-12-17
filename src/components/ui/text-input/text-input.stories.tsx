import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Search,
  User,
} from "lucide-react";
import React from "react";
import { Button } from "../button";
import { TextInput } from "./index";

const meta: Meta<typeof TextInput> = {
  title: "UI/TextInput",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label for the input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    type: {
      control: "select",
      options: ["text", "number", "email", "password", "tel", "url"],
      description: "Input type",
      defaultValue: "text",
    },
    value: {
      control: "text",
      description: "Input value",
    },
    disabled: {
      control: "boolean",
      description: "Disable input",
    },
    required: {
      control: "boolean",
      description: "Mark as required",
    },
    error: {
      control: "boolean",
      description: "Show error state",
    },
    errorMessage: {
      control: "text",
      description: "Error message to display",
    },
    description: {
      control: "text",
      description: "Helper/description text",
    },
    theme: {
      control: "select",
      options: ["light", "dark"],
      description: "Theme variant",
      defaultValue: "light",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default text input
export const Default: Story = {
  args: {
    placeholder: "Enter text here...",
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: "Email Address",
    type: "email",
    placeholder: "john@example.com",
  },
};

// With description
export const WithDescription: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    description: "Password must be at least 8 characters long",
  },
};

// With error state
export const WithError: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    error: true,
    errorMessage: "Please enter a valid email address",
    value: "invalid-email",
  },
};

// With left icon
export const WithLeftIcon: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
    leftIcon: <User className="w-4 h-4" />,
  },
};

// With right icon
export const WithRightIcon: Story = {
  args: {
    label: "Search",
    placeholder: "Search products...",
    rightIcon: <Search className="w-4 h-4" />,
  },
};

// With both icons
export const WithBothIcons: Story = {
  args: {
    label: "Amount",
    type: "number",
    placeholder: "0.00",
    leftIcon: <span className="text-gray-500">$</span>,
    rightIcon: <span className="text-gray-500">USD</span>,
  },
};

// Password input with toggle
export const PasswordToggle: Story = {
  render: (args) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <TextInput
        {...args}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
      />
    );
  },
  args: {
    label: "Password",
    placeholder: "Enter your password",
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
    theme: "dark",
    leftIcon: <User className="w-4 h-4" />,
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "This input is disabled",
    disabled: true,
    value: "Disabled value",
  },
};

// Required field
export const Required: Story = {
  args: {
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
  },
};

// Number input
export const NumberInput: Story = {
  args: {
    label: "Quantity",
    type: "number",
    placeholder: "0",
    min: 0,
    step: 1,
  },
};

// Phone input
export const PhoneInput: Story = {
  args: {
    label: "Phone Number",
    type: "tel",
    placeholder: "+84 123 456 789",
    leftIcon: <span className="text-gray-500">📞</span>,
  },
};

// Email input
export const EmailInput: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "your@email.com",
    leftIcon: <Mail className="w-4 h-4" />,
  },
};

// URL input
export const UrlInput: Story = {
  args: {
    label: "Website",
    type: "url",
    placeholder: "https://example.com",
  },
};

// Search input
export const SearchInput: Story = {
  args: {
    placeholder: "Search...",
    leftIcon: <Search className="w-4 h-4 text-gray-400" />,
  },
};

// Form example
export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.username) {
        newErrors.username = "Username is required";
      }

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    return (
      <form className="w-96 space-y-4">
        <TextInput
          label="Username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          error={!!errors.username}
          errorMessage={errors.username}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <TextInput
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={!!errors.email}
          errorMessage={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <TextInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={!!errors.password}
          errorMessage={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <TextInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button type="button" className="w-full" onClick={validateForm}>
          Validate Form
        </Button>
      </form>
    );
  },
};

// Interactive example with real-time validation
export const InteractiveValidation: Story = {
  render: () => {
    const [email, setEmail] = React.useState("");
    const [isValid, setIsValid] = React.useState<boolean | null>(null);

    const validateEmail = (value: string) => {
      if (!value) {
        setIsValid(null);
        return;
      }
      const emailRegex = /\S+@\S+\.\S+/;
      setIsValid(emailRegex.test(value));
    };

    return (
      <div className="w-96 space-y-4">
        <TextInput
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          rightIcon={
            isValid !== null && (
              <span className={isValid ? "text-green-500" : "text-red-500"}>
                {isValid ? "✓" : <AlertCircle className="w-4 h-4" />}
              </span>
            )
          }
          error={isValid === false}
          errorMessage={
            isValid === false ? "Please enter a valid email" : undefined
          }
        />
        <p className="text-sm text-gray-500">
          {isValid === true && "Email is valid!"}
          {isValid === false && "Please enter a valid email address"}
          {isValid === null && "Start typing to validate email"}
        </p>
      </div>
    );
  },
};

// Large input
export const LargeInput: Story = {
  args: {
    label: "Message",
    placeholder: "Type your message here...",
    className: "h-24",
  },
};

// Sizes showcase
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <TextInput placeholder="Small input" className="h-8 text-sm" />
      <TextInput placeholder="Default input" />
      <TextInput placeholder="Large input" className="h-12 text-lg" />
    </div>
  ),
};
