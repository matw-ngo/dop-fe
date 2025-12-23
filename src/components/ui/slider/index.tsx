import * as RadixSlider from "@radix-ui/react-slider";
import React from "react";

export interface ISliderProps {
  step: number;
  min: number;
  max: number;
  value: number;
  onValueChange?: (values: number[]) => void;
  onChange?: (value: number) => void;
  trackingHandler?: (startValue: number, endValue: number) => void;
  thumbImg?: string;
  disabled?: boolean;
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

  const handleValueCommit = (values: number[]) => {
    if (trackingHandler) {
      trackingHandler(startValue, valueRef.current);
    }
  };

  const handlePointerDown = () => {
    setStartValue(value);
  };

  return (
    <RadixSlider.Root
      className={`relative flex items-center select-none touch-none w-full h-7 z-10 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      value={[value]}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      onPointerDown={disabled ? undefined : handlePointerDown}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <RadixSlider.Track className="bg-[#E6F1ED] relative grow rounded-full h-[6px]">
        <RadixSlider.Range className="absolute bg-[#017848] rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-[28px] h-[28px] bg-white rounded-[4px] shadow-sm border-[4px] border-white focus:outline-none focus:ring-2 focus:ring-[#017848] focus:ring-offset-2 cursor-pointer"
        style={
          thumbImg
            ? {
                backgroundImage: `url(${thumbImg})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }
            : {}
        }
      />
    </RadixSlider.Root>
  );
}

export { CustomSlider };

// Add named export for Slider to match the import pattern
export const Slider = CustomSlider;
