import * as RadixSlider from "@radix-ui/react-slider";
import React from "react";

export interface ISliderProps {
  step: number;
  min: number;
  max: number;
  value?: number | number[];
  onValueChange?: (values: number[]) => void;
  onChange?: (value: number) => void;
  trackingHandler?: (startValue: number, endValue: number) => void;
  thumbImg?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSlider({
  value,
  onChange,
  onValueChange,
  min,
  max,
  step,
  thumbImg,
  trackingHandler,
  disabled = false,
  className = "",
}: ISliderProps) {
  const [startValue, setStartValue] = React.useState(0);
  const valueRef = React.useRef(0);

  const handleValueChange = (values: number[]) => {
    const newValue = values[0];
    if (onChange) {
      onChange(newValue);
    }
    if (onValueChange) {
      onValueChange(values);
    }
    valueRef.current = newValue;
  };

  const handleValueCommit = (_values: number[]) => {
    if (trackingHandler) {
      trackingHandler(startValue, valueRef.current);
    }
  };

  const handlePointerDown = () => {
    const initialValue = Array.isArray(value) ? value[0] : value;
    setStartValue(initialValue ?? 0);
  };

  const sliderValue = Array.isArray(value)
    ? value
    : value !== undefined
      ? [value]
      : [];
  const thumbStyle = {
    ...(thumbImg
      ? {
          backgroundImage: `url(${thumbImg})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }
      : {}),
    "--tw-ring-color": "var(--form-primary, var(--color-primary))",
    "--tw-ring-offset-color": "transparent",
  } as React.CSSProperties;

  return (
    <RadixSlider.Root
      className={`relative flex items-center select-none touch-none w-full h-7 z-10 ${className} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      value={sliderValue}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      onPointerDown={disabled ? undefined : handlePointerDown}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <RadixSlider.Track className="bg-[var(--slider-track,#ffffff)] relative grow rounded-full h-[6px] border border-[var(--form-border,#e5e7eb)]">
        <RadixSlider.Range className="absolute bg-[var(--form-primary,var(--color-primary))] rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-[28px] h-[28px] bg-white rounded-[4px] shadow-sm border-[4px] border-white outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus-visible:ring-2 focus-visible:ring-offset-0 cursor-pointer"
        style={thumbStyle}
      />
    </RadixSlider.Root>
  );
}

export { CustomSlider };

// Add named export for Slider to match the import pattern
export const Slider = CustomSlider;
