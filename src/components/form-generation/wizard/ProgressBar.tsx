"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  showStepNumbers?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  showPercentage = true,
  showStepNumbers = true,
  className,
}: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {(showStepNumbers || showPercentage) && (
        <div className="flex justify-between text-sm text-muted-foreground">
          {showStepNumbers && (
            <span>
              Step {current} of {total}
            </span>
          )}
          {showPercentage && <span>{Math.round(percentage)}% Complete</span>}
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

ProgressBar.displayName = "ProgressBar";
