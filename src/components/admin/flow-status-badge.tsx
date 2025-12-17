import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FlowStatus } from "@/types/admin";

interface FlowStatusBadgeProps {
  status: FlowStatus;
  className?: string;
}

const statusConfig = {
  active: {
    label: "Active",
    variant: "default" as const,
  },
  inactive: {
    label: "Inactive",
    variant: "secondary" as const,
  },
  draft: {
    label: "Draft",
    variant: "outline" as const,
  },
  archived: {
    label: "Archived",
    variant: "destructive" as const,
  },
};

export function FlowStatusBadge({ status, className }: FlowStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}
