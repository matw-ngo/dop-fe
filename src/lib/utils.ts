import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maps gap values to Tailwind CSS gap classes
 * @param gap - The gap value (string or number)
 * @returns The corresponding Tailwind CSS gap class
 */
export function getGapClass(gap?: string | number): string {
  if (!gap) return "gap-6";

  const gapMap: Record<string, string> = {
    "0": "gap-0",
    "1": "gap-1",
    "2": "gap-2",
    "3": "gap-3",
    "4": "gap-4",
    "5": "gap-5",
    "6": "gap-6",
    "7": "gap-7",
    "8": "gap-8",
    "9": "gap-9",
    "10": "gap-10",
    "12": "gap-12",
    "16": "gap-16",
    "20": "gap-20",
    "24": "gap-24",
  };

  return gapMap[gap.toString()] || "gap-6";
}
