import { cn } from "@/lib/utils"

type Status = "pending" | "paid" | "success" | "failed" | "locked" | "released" | "refunded" | "unpaid"

const statusStyles: Record<Status, string> = {
  pending: "bg-warning/10 text-warning-foreground border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  success: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  locked: "bg-warning/10 text-warning-foreground border-warning/20",
  released: "bg-success/10 text-success border-success/20",
  refunded: "bg-muted text-muted-foreground border-border",
  unpaid: "bg-muted text-muted-foreground border-border",
}

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  paid: "Paid",
  success: "Success",
  failed: "Failed",
  locked: "Locked",
  released: "Released",
  refunded: "Refunded",
  unpaid: "Unpaid",
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
