"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "@/components/feedback/form-error";
import { useTaskStore } from "@/store/task-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useCreateTask } from "../task-queries";
import { useWorkspaces } from "@/features/workspaces/workspace-queries";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  workspace_id: z.string().min(1, "Workspace is required"),
  priority: z.string().min(1, "Priority is required"),
  due_date: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskModal() {
  const { isTaskModalOpen, setTaskModalOpen } = useTaskStore();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const workspacesQuery = useWorkspaces();
  const workspaces = workspacesQuery.data ?? [];
  const { mutateAsync: createTask, isPending } = useCreateTask();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      workspace_id: workspaceId ?? "",
      priority: "medium",
      due_date: "",
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (isTaskModalOpen) {
      form.reset({
        title: "",
        description: "",
        workspace_id: workspaceId ?? workspaces[0]?.id ?? "",
        priority: "medium",
        due_date: "",
      });
    }
  }, [isTaskModalOpen, workspaceId, workspaces, form]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await createTask({
        ...values,
        priority: values.priority as import("@/services/task.service").TaskPriority,
      });
      setTaskModalOpen(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={setTaskModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              {...form.register("title")}
              className="font-medium"
              autoFocus
            />
            <FormError message={form.formState.errors.title?.message} />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Description (optional)"
              {...form.register("description")}
              className="text-sm"
            />
            <FormError message={form.formState.errors.description?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Workspace</label>
              <Select
                value={form.watch("workspace_id")}
                onValueChange={(val) => form.setValue("workspace_id", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.workspace_id?.message} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <Select
                value={form.watch("priority")}
                onValueChange={(val) => form.setValue("priority", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.priority?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Due Date</label>
            <Input
              type="date"
              {...form.register("due_date")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
