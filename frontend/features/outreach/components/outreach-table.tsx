import * as React from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useOutreachLogs } from "@/features/outreach/outreach-queries";
import { useOutreachStore } from "@/store/outreach-store";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderGit2 } from "lucide-react";

export function OutreachTable() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: logs, isLoading } = useOutreachLogs(workspaceId);
  const { setActiveRecordId, statusFilter, typeFilter } = useOutreachStore();

  if (isLoading) {
    return (
      <div className="rounded-md border p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  let filteredLogs = logs ?? [];
  if (statusFilter !== "all") {
    filteredLogs = filteredLogs.filter((l) => l.status === statusFilter);
  }
  if (typeFilter !== "all") {
    filteredLogs = filteredLogs.filter((l) => l.contact_channel === typeFilter);
  }

  if (filteredLogs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
          <FolderGit2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">No outreach found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          {logs?.length === 0
            ? "You haven't added any outreach records yet. Click 'New Outreach' to start."
            : "No records match your current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Follow-Up</TableHead>
            <TableHead className="text-right">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log) => (
            <TableRow
              key={log.id}
              onClick={() => setActiveRecordId(log.id)}
              className="cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <TableCell className="font-medium">{log.contact_name}</TableCell>
              <TableCell className="text-muted-foreground">{log.contact_company ?? "—"}</TableCell>
              <TableCell className="capitalize text-muted-foreground">{log.contact_channel}</TableCell>
              <TableCell>
                <StatusBadge status={log.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {log.follow_up_date ? format(new Date(log.follow_up_date), "MMM d, yyyy") : "—"}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {format(new Date(log.created_at), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
