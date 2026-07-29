import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  PUBLISHED: { label: "Published", variant: "success" },
  PRESENT: { label: "Present", variant: "success" },
  SELECTED: { label: "Selected", variant: "success" },
  GRADED: { label: "Graded", variant: "success" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  ENDED: { label: "Ended", variant: "secondary" },
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING: { label: "Pending", variant: "warning" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  INACTIVE: { label: "Inactive", variant: "outline" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  LATE: { label: "Late", variant: "warning" },
  SCHEDULED: { label: "Scheduled", variant: "outline" },
  LIVE: { label: "Live now", variant: "destructive" },
  OPEN: { label: "Open", variant: "success" },
  APPLIED: { label: "Applied", variant: "warning" },
  SHORTLISTED: { label: "Shortlisted", variant: "warning" },
  DROPPED: { label: "Dropped", variant: "destructive" },
  ABSENT: { label: "Absent", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  CLOSED: { label: "Closed", variant: "outline" },
  NOT_SUBMITTED: { label: "Not submitted", variant: "outline" },
  ARCHIVED: { label: "Archived", variant: "outline" },
  EXCUSED: { label: "Excused", variant: "outline" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
