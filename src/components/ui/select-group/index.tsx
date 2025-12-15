import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

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
  const theme = props.theme || "light";
  const currentValue = props.value?.toString() || "";

  return (
    <div className={cn("space-y-2", props.className)}>
      {/* Label Group */}
      {(props.label || props.helpComponent) && (
        <div className="flex items-center justify-between">
          {props.label && (
            <label className="block text-xs font-normal leading-4 text-[#4d7e70]">
              {props.label}
              {props.error && (
                <span className="text-red-500 ml-1">({props.error})</span>
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
            "w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-[#bfd1cc] rounded-lg bg-white",
            "text-sm font-normal text-[#3F4350]",
            "focus:outline-none focus:ring-2 focus:ring-[#017848] focus:border-[#017848]",
            "transition-colors",
            "data-[placeholder]:text-[#BFD1CC]",
            props.disabled && "opacity-50 cursor-not-allowed",
            props.error &&
              "border-red-500 focus:ring-red-500 focus:border-red-500",
          )}
        >
          <SelectPrimitive.Value
            placeholder={props.placeholder || "Vui lòng chọn"}
          />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="w-4 h-4 text-[#017848]" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "mt-3 -ml-[17px] w-[calc(100%+34px)] overflow-hidden",
              "bg-white border border-[#3F435029] rounded-lg shadow-[0px_8px_24px_0px_#0000001F]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              "z-50",
            )}
            position="popper"
            sideOffset={12}
          >
            <SelectPrimitive.Viewport className="p-1">
              {props.options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value.toString()}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2",
                    "rounded-sm py-2 pl-4 pr-8",
                    "text-sm text-[#3F4350]",
                    "outline-none select-none",
                    "hover:bg-gray-50",
                    "focus:bg-gray-100",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    "data-[state=checked]:font-bold data-[state=unchecked]:font-normal",
                  )}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <span className="absolute right-2 flex items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="w-4 h-4 text-[#017848]" />
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
