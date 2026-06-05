"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/feedback/form-error";
import { useCreateWorkspace } from "@/features/workspaces/workspace-queries";
import { useWorkspaceStore } from "@/store/workspace-store";

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(50, "Workspace name is too long"),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

type WorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WorkspaceModal({ isOpen, onClose }: WorkspaceModalProps) {
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: WorkspaceFormValues) => {
    try {
      const workspace = await createWorkspace({
        name: values.name,
      });
      if (workspace && workspace.id) {
        setWorkspaceId(workspace.id);
      }
      onClose();
    } catch (error) {
      console.error("Failed to create workspace", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Workspaces organize tasks, check-ins, and outreach for a specific startup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="e.g., Techpronnet"
              {...form.register("name")}
              autoFocus
            />
            <FormError message={form.formState.errors.name?.message} />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
