"use client";

import { Briefcase, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useFetch } from "@/hooks/use-fetch";
import { placementsApi } from "@/lib/api/placements";
import { formatDate } from "@/lib/utils";
import { PlacementDrive } from "@/types";

export default function AdminPlacementsPage() {
  const { data, isLoading, error, refetch } = useFetch(() => placementsApi.list({ page: 0, size: 20 }), []);

  const columns: Column<PlacementDrive>[] = [
    {
      key: "company",
      header: "Company / Role",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <div>
            <p className="font-medium">{p.companyName}</p>
            <p className="text-xs text-muted-foreground">{p.role}</p>
          </div>
        </div>
      ),
    },
    { key: "package", header: "Package", render: (p) => p.packageLpa },
    { key: "location", header: "Location", render: (p) => p.location },
    { key: "date", header: "Drive date", render: (p) => formatDate(p.driveDate) },
    { key: "applicants", header: "Applicants", render: (p) => p.applicantsCount ?? 0 },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Placements"
        description="Coordinate placement drives and track applicants."
        actions={<Button className="gap-2"><Plus className="h-4 w-4" /> New drive</Button>}
      />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} data={data?.content ?? []} isLoading={isLoading} rowKey={(p) => p.id} emptyTitle="No placement drives yet" />
      )}
    </div>
  );
}
