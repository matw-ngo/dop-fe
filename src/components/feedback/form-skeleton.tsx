import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type SkeletonFieldType =
  | "input"
  | "textarea"
  | "select"
  | "checkbox"
  | "avatar";

interface FormSkeletonProps {
  fields?: SkeletonFieldType[];
  className?: string;
}

const renderField = (type: SkeletonFieldType, key: number) => {
  switch (type) {
    case "textarea":
      return <Skeleton key={key} className="h-24 w-full" />;
    case "avatar":
      return <Skeleton key={key} className="h-20 w-20 rounded-full" />;
    case "checkbox":
      return (
        <div key={key} className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
      );
    case "input":
    case "select":
    default:
      return <Skeleton key={key} className="h-10 w-full" />;
  }
};

export function FormSkeleton({
  fields = ["input", "input", "input"],
  className,
}: FormSkeletonProps) {
  return (
    <div
      className={cn("bg-white rounded-2xl shadow-xl p-8 space-y-8", className)}
    >
      {/* Header Skeleton */}
      <Skeleton className="h-8 w-3/4" />
      {/* Fields Skeleton */}
      <div className="space-y-4 pt-4">
        {fields.map((type, index) => renderField(type, index))}
      </div>
      {/* Footer Skeleton */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
}
