"use client";

import { Briefcase, MapPin } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useFetch } from "@/hooks/use-fetch";
import { placementsApi } from "@/lib/api/placements";
import { extractErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";

export default function StudentPlacementsPage() {
  const { data, isLoading, error, refetch } = useFetch(() => placementsApi.list({ page: 0, size: 20 }), []);

  async function handleApply(id: string) {
    try {
      await placementsApi.apply(id);
      toast.success("Application submitted");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader title="Placements" description="Explore placement drives and track your applications." />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !data?.content || data.content.length === 0 ? (
        <EmptyState icon={Briefcase} title="No drives available" description="New placement drives will appear here." />
      ) : (
        <div className="space-y-3">
          {data.content.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold">{p.companyName}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{p.role} · {p.packageLpa}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {p.location} · Drive on {formatDate(p.driveDate)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Eligibility: {p.eligibility}</p>
                </div>
                {p.status === "OPEN" && (
                  <Button size="sm" onClick={() => handleApply(p.id)}>Apply now</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
