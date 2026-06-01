import * as React from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useOutreachStore } from "@/store/outreach-store";
import { useCreateOutreach } from "@/features/outreach/outreach-queries";
import type { OutreachCreatePayload } from "@/services/outreach.service";

const OUTREACH_TYPES = ["client", "partnership", "investor", "vendor", "other"];

export function OutreachModal() {
  const { isCreateModalOpen, setCreateModalOpen } = useOutreachStore();
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const createMutation = useCreateOutreach();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Omit<OutreachCreatePayload, "workspace_id">>({
    defaultValues: {
      contact_channel: "client",
      status: "pending",
    }
  });

  const typeValue = watch("contact_channel");

  const onSubmit = (data: Omit<OutreachCreatePayload, "workspace_id">) => {
    if (!workspaceId) return;
    createMutation.mutate(
      { ...data, workspace_id: workspaceId },
      {
        onSuccess: () => {
          setCreateModalOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Outreach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Name <span className="text-red-500">*</span></label>
            <Input {...register("contact_name", { required: true })} placeholder="e.g. John Doe" />
            {errors.contact_name && <span className="text-xs text-red-500">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company (Optional)</label>
            <Input {...register("contact_company")} placeholder="e.g. Tech Corp" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Outreach Type</label>
              <Select value={typeValue} onValueChange={(val) => setValue("contact_channel", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {OUTREACH_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Follow-Up Date</label>
              <Input type="date" {...register("follow_up_date")} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Initial Notes</label>
            <Textarea {...register("notes")} placeholder="Context for this outreach..." rows={3} />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Outreach
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
