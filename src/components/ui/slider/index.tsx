import React from "react";
import * as Slider from "@radix-ui/react-slider";

export interface ISliderProps {
  step: number;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  trackingHandler?: (startValue: number, endValue: number) => void;
  thumbImg?: string;
}

export default function CustomSlider({
  value,
  onChange,
  min,
  max,
  step,
  thumbImg,
  trackingHandler,
}: ISliderProps) {
  const [startValue, setStartValue] = React.useState(0);
  const valueRef = React.useRef(0);

  const handleValueChange = (values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
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
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-7"
      value={[value]}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      onPointerDown={handlePointerDown}
      min={min}
      max={max}
      step={step}
    >
      <Slider.Track className="bg-[#E6F1ED] relative grow rounded-full h-[6px]">
        <Slider.Range className="absolute bg-[#007848] rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-7 h-7 bg-white rounded shadow-lg border-4 border-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007848] focus:ring-offset-2 cursor-pointer"
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
    </Slider.Root>
  );
}

export { CustomSlider };