import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import React from "react";
import { useFormTheme } from "@/components/form-generation/themes";

// Utility function for classnames
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export interface ISelectBoxOption {
  label: string;
  value: string | number;
  icon?: any;
}

export interface ISelectGroupProps {
  label?: string;
  onChange?: (value: string) => void;
  theme?: "light" | "dark";
  className?: string;
  value?: string | number;
  options: ISelectBoxOption[] | [];
  placeholder?: string;
  helpComponent?: any;
  disabled?: boolean;
  error?: string;
}

export const SelectGroup = React.forwardRef<
  HTMLButtonElement,
  ISelectGroupProps
>((props, ref) => {
  const { theme: contextTheme } = useFormTheme();
  const currentValue = props.value?.toString() || "";

  const primaryColor = contextTheme.colors.primary;
  const borderColor = contextTheme.colors.border || "#bfd1cc";
  const labelColor = contextTheme.colors.textSecondary || "#4d7e70";
  const textColor = "#3F4350";
  const errorColor = contextTheme.colors.error || "#ff7474";
  const _placeholderColor = contextTheme.colors.placeholder || "#BFD1CC";

  return (
    <div className={cn("space-y-2", props.className)}>
      {/* Label Group */}
      {(props.label || props.helpComponent) && (
        <div className="flex items-center justify-between">
          {props.label && (
            <label
              className="block text-xs font-normal leading-4"
              style={{ color: labelColor }}
            >
              {props.label}
              {props.error && (
                <span style={{ color: errorColor }} className="ml-1">
                  ({props.error})
                </span>
              )}
            </label>
          )}
          {props.helpComponent && <div>{props.helpComponent}</div>}
        </div>
      )}

      {/* Select Component */}
      <SelectPrimitive.Root
        value={currentValue}
        onValueChange={(value) => props.onChange?.(value)}
        disabled={props.disabled}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-lg bg-white",
            "text-sm font-normal",
            "focus:outline-none focus:ring-2",
            "transition-colors",
            "data-[placeholder]:opacity-50",
            props.disabled && "opacity-50 cursor-not-allowed",
          )}
          style={
            {
              borderColor: props.error ? errorColor : borderColor,
              color: textColor,
              "--tw-ring-color": props.error ? errorColor : primaryColor,
            } as React.CSSProperties
          }
        >
          <SelectPrimitive.Value
            placeholder={props.placeholder || "Vui lòng chọn"}
          />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="w-4 h-4" style={{ color: primaryColor }} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "mt-3 -ml-[1px] w-full min-w-[var(--radix-select-trigger-width)] overflow-hidden",
              "bg-white border rounded-lg shadow-[0px_8px_24px_0px_#0000001F]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              "z-50",
            )}
            style={{ borderColor: "rgba(63, 67, 80, 0.16)" }}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {props.options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value.toString()}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2",
                    "rounded-sm py-2 pl-4 pr-8",
                    "text-sm",
                    "outline-none select-none",
                    "hover:bg-gray-50",
                    "focus:bg-gray-100",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    "data-[state=checked]:font-bold data-[state=unchecked]:font-normal",
                  )}
                  style={{ color: textColor }}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <span className="absolute right-2 flex items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check
                        className="w-4 h-4"
                        style={{ color: primaryColor }}
                      />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
});

SelectGroup.displayName = "SelectGroup";
