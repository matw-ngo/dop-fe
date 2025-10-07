// Component Registry for Data-Driven UI system
// Maps string component names to actual React components

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CustomSelect } from "@/components/wrappers/CustomSelect";
import { CustomRadioGroup } from "@/components/wrappers/CustomRadioGroup";
import { CustomDatePicker } from "@/components/wrappers/CustomDatePicker";
import { CustomDateRangePicker } from "@/components/wrappers/CustomDateRangePicker";
import { CustomToggleGroup } from "@/components/wrappers/CustomToggleGroup";
import { CustomInputOTP } from "@/components/wrappers/CustomInputOTP";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Registry of components that can be rendered dynamically
 * Add new components here as needed by the system
 */
export const ComponentRegistry = {
  // Basic form inputs
  Input,
  Textarea,
  Checkbox,
  Switch,
  Slider,

  // Wrapper components for complex UI
  Select: CustomSelect,
  RadioGroup: CustomRadioGroup,
  DatePicker: CustomDatePicker,
  DateRangePicker: CustomDateRangePicker,
  ToggleGroup: CustomToggleGroup,
  InputOTP: CustomInputOTP,

  // Display components
  Label,
  Progress,
  Badge,
  Separator,

  // Action components
  Button,
} as const;

/**
 * Type-safe union of registered component names
 * This limits what Backend can send as component names
 */
export type RegisteredComponent = keyof typeof ComponentRegistry;

/**
 * Type guard to check if a component name is registered
 */
export function isRegisteredComponent(
  componentName: string,
): componentName is RegisteredComponent {
  return componentName in ComponentRegistry;
}

/**
 * Get a component from the registry with type safety
 */
export function getComponent(componentName: string) {
  if (!isRegisteredComponent(componentName)) {
    console.error(
      `Component "${componentName}" is not registered in ComponentRegistry`,
    );
    return null;
  }
  return ComponentRegistry[componentName];
}
