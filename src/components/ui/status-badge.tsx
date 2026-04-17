import { Check, Clock, Loader2, Truck, AlertCircle, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type StatusType =
  | "success"
  | "pending"
  | "processing"
  | "warning"
  | "error"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface StatusBadgeProps {
  data?: {
    status?: StatusType
  }
  appearance?: {
    label?: string
    showIcon?: boolean
    size?: "sm" | "md" | "lg"
  }
  className?: string
}

const statusConfig: Record<
  StatusType,
  { icon: React.ElementType; className: string; defaultLabel: string }
> = {
  success: {
    icon: Check,
    className: "border-primary bg-primary text-primary-foreground",
    defaultLabel: "Done",
  },
  pending: {
    icon: Clock,
    className: "border-border bg-background text-muted-foreground",
    defaultLabel: "Pending",
  },
  processing: {
    icon: Loader2,
    className: "border-[hsl(var(--support))] bg-[hsl(var(--support))] text-[hsl(var(--support-foreground))]",
    defaultLabel: "In progress",
  },
  warning: {
    icon: AlertCircle,
    className: "border-[hsl(var(--support))] bg-[hsl(var(--support))] text-[hsl(var(--support-foreground))]",
    defaultLabel: "Warning",
  },
  error: {
    icon: XCircle,
    className: "border-destructive bg-destructive text-destructive-foreground",
    defaultLabel: "Error",
  },
  shipped: {
    icon: Truck,
    className: "border-primary bg-background text-foreground",
    defaultLabel: "Queued",
  },
  delivered: {
    icon: Check,
    className: "border-foreground bg-foreground text-background",
    defaultLabel: "Delivered",
  },
  cancelled: {
    icon: XCircle,
    className: "border-border bg-muted text-muted-foreground",
    defaultLabel: "Cancelled",
  },
}

const sizeClasses = {
  sm: "gap-1 px-2 py-0.5 text-[11px]",
  md: "gap-1.5 px-2.5 py-1 text-xs",
  lg: "gap-2 px-3 py-1.5 text-sm",
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
}

export function StatusBadge({ data, appearance, className }: StatusBadgeProps) {
  const status = data?.status ?? "pending"
  const label = appearance?.label
  const showIcon = appearance?.showIcon ?? true
  const size = appearance?.size ?? "md"
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border font-medium shadow-none",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon ? (
        <Icon
          className={cn(
            iconSizes[size],
            status === "processing" && "motion-safe:animate-spin motion-reduce:animate-none"
          )}
        />
      ) : null}
      {label ?? config.defaultLabel}
    </span>
  )
}
