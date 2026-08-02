"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetch } from "@/hooks/use-fetch";
import { useDebounce } from "@/hooks/use-debounce";
import { studentFeesApi, feeStructuresApi } from "@/lib/api/finance";
import { studentsApi } from "@/lib/api/students";
import { coursesApi } from "@/lib/api/courses";
import { extractErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StudentFee, FeeStatus } from "@/types";

const STATUS_OPTIONS: FeeStatus[] = ["PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED", "CANCELLED"];

export default function AdminStudentFeesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [assignOpen, setAssignOpen] = useState(false);

  const { data, isLoading, error, refetch } = useFetch(
    () =>
      studentFeesApi.list({
        status: status === "all" ? undefined : (status as FeeStatus),
        courseId: courseFilter === "all" ? undefined : courseFilter,
        page: 0,
        size: 50,
      }),
    [status, courseFilter]
  );
  const { data: courses } = useFetch(() => coursesApi.list({ page: 0, size: 200 }), []);

  // --- assign form state ---
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedStudentSearch = useDebounce(studentSearch);
  const { data: students } = useFetch(
    () => studentsApi.list({ search: debouncedStudentSearch || undefined, page: 0, size: 30 }),
    [debouncedStudentSearch]
  );
  const [studentId, setStudentId] = useState("");
  const [assignCourseId, setAssignCourseId] = useState<string>("none");
  const [feeStructureId, setFeeStructureId] = useState<string>("custom");
  const { data: feeStructures } = useFetch(
    () => feeStructuresApi.list({ courseId: assignCourseId === "none" ? undefined : assignCourseId, activeOnly: true, page: 0, size: 100 }),
    [assignCourseId]
  );
  const [customAmount, setCustomAmount] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  function resetAssignForm() {
    setStudentSearch("");
    setStudentId("");
    setAssignCourseId("none");
    setFeeStructureId("custom");
    setCustomAmount("");
    setStartDate(new Date().toISOString().slice(0, 10));
  }

  async function onAssign() {
    if (!studentId) {
      toast.error("Select a student");
      return;
    }
    if (feeStructureId === "custom" && (!customAmount || Number(customAmount) <= 0)) {
      toast.error("Enter a total amount, or pick a fee structure template");
      return;
    }
    setSubmitting(true);
    try {
      await studentFeesApi.assign({
        studentId,
        courseId: assignCourseId === "none" ? undefined : assignCourseId,
        feeStructureId: feeStructureId === "custom" ? undefined : feeStructureId,
        totalAmount: feeStructureId === "custom" ? Number(customAmount) : undefined,
        startDate,
      });
      toast.success("Fee assigned to student");
      setAssignOpen(false);
      resetAssignForm();
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<StudentFee>[] = [
    {
      key: "student",
      header: "Student",
      render: (f) => (
        <div>
          <p className="font-medium">{f.studentName}</p>
          <p className="text-xs text-muted-foreground font-mono">{f.studentIdNumber ?? "—"}</p>
        </div>
      ),
    },
    { key: "course", header: "Course", render: (f) => f.courseTitle ?? "—" },
    { key: "net", header: "Net payable", render: (f) => formatCurrency(f.netPayable, f.currency) },
    {
      key: "progress",
      header: "Paid",
      render: (f) => {
        const pct = f.netPayable > 0 ? Math.min(100, Math.round((f.amountPaid / f.netPayable) * 100)) : 0;
        return (
          <div className="flex w-36 items-center gap-2">
            <Progress value={pct} className="h-1.5" />
            <span className="w-9 text-xs text-muted-foreground">{pct}%</span>
          </div>
        );
      },
    },
    { key: "balance", header: "Balance due", render: (f) => formatCurrency(f.balanceDue, f.currency) },
    { key: "status", header: "Status", render: (f) => <StatusBadge status={f.status} /> },
    { key: "created", header: "Assigned", render: (f) => formatDate(f.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Student Fees"
        description="Every fee assigned to a student — installments, discounts, fines, and payment progress."
        actions={<Button className="gap-2" onClick={() => setAssignOpen(true)}><Plus className="h-4 w-4" /> Assign fee</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses?.content.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          rowKey={(f) => f.id}
          emptyTitle="No student fees found"
          onRowClick={(f) => router.push(`/admin/finance/student-fees/${f.id}`)}
        />
      )}

      <Dialog open={assignOpen} onOpenChange={(open) => { setAssignOpen(open); if (!open) resetAssignForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign a fee</DialogTitle>
            <DialogDescription>
              Pick a fee structure template to copy its amount and installments, or set a custom total amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="studentSearch">Student</Label>
              <Input id="studentSearch" placeholder="Search by name or Student ID..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students?.content.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} {s.studentId ? `(${s.studentId})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Course (optional)</Label>
              <Select value={assignCourseId} onValueChange={(v) => { setAssignCourseId(v); setFeeStructureId("custom"); }}>
                <SelectTrigger><SelectValue placeholder="No specific course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific course</SelectItem>
                  {courses?.content.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fee structure</Label>
              <Select value={feeStructureId} onValueChange={setFeeStructureId}>
                <SelectTrigger><SelectValue placeholder="Custom amount" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom amount (no template)</SelectItem>
                  {feeStructures?.content.map((fs) => (
                    <SelectItem key={fs.id} value={fs.id}>{fs.name} — {formatCurrency(fs.totalAmount, fs.currency)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {feeStructureId === "custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="customAmount">Total amount</Label>
                <Input id="customAmount" type="number" min={0} step="0.01" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Billed as a single installment due immediately. Use a fee structure template for multi-installment plans.</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <p className="text-xs text-muted-foreground">Installment due dates are calculated from this date.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button type="button" onClick={onAssign} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
