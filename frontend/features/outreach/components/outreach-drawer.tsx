import * as React from "react";
import { format } from "date-fns";
import { Loader2, Trash2, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./status-badge";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useOutreachStore } from "@/store/outreach-store";
import { useOutreachLogs, useUpdateOutreach, useDeleteOutreach } from "@/features/outreach/outreach-queries";

export function OutreachDrawer() {
  const { activeRecordId, setActiveRecordId } = useOutreachStore();
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  
  const { data: logs } = useOutreachLogs(workspaceId);
  const updateMutation = useUpdateOutreach();
  const deleteMutation = useDeleteOutreach();

  const activeLog = logs?.find((l) => l.id === activeRecordId);

  const [notes, setNotes] = React.useState("");
  const [followUpDate, setFollowUpDate] = React.useState("");

  React.useEffect(() => {
    if (activeLog) {
      setNotes(activeLog.notes ?? "");
      setFollowUpDate(activeLog.follow_up_date ?? "");
    }
  }, [activeLog]);

  if (!activeLog || !workspaceId) return null;

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({
      id: activeLog.id,
      workspaceId,
      payload: { status: newStatus },
    });
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({
      id: activeLog.id,
      workspaceId,
      payload: { notes, follow_up_date: followUpDate || null },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this outreach record?")) {
      deleteMutation.mutate(
        { id: activeLog.id, workspaceId },
        { onSuccess: () => setActiveRecordId(null) }
      );
    }
  };

  return (
    <Sheet open={!!activeRecordId} onOpenChange={(open) => !open && setActiveRecordId(null)}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <span>{activeLog.contact_name}</span>
            <StatusBadge status={activeLog.status} />
          </SheetTitle>
          <div className="text-sm text-muted-foreground flex gap-2 items-center">
            {activeLog.contact_company ?? "Independent"} • <span className="capitalize">{activeLog.contact_channel}</span>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={activeLog.status === "contacted" ? "default" : "outline"} onClick={() => handleStatusChange("contacted")}>Contacted</Button>
              <Button size="sm" variant={activeLog.status === "follow_up" ? "default" : "outline"} onClick={() => handleStatusChange("follow_up")}>Needs Follow-Up</Button>
              <Button size="sm" variant={activeLog.status === "responded" ? "default" : "outline"} onClick={() => handleStatusChange("responded")}>Responded</Button>
              <Button size="sm" variant={activeLog.status === "closed" ? "default" : "outline"} onClick={() => handleStatusChange("closed")}>Close</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Follow-Up Date
              </label>
              <Input 
                type="date" 
                value={followUpDate} 
                onChange={(e) => setFollowUpDate(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes & Activity</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={8}
                placeholder="Log your conversations here..."
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSaveNotes} 
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Details
            </Button>
          </div>

          <div className="pt-8 border-t">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(activeLog.created_at), "PPp")}
              </p>
              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
