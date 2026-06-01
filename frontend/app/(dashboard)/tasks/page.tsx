import { AppShell } from "@/components/layouts/app-shell";
import { TasksView } from "@/features/tasks/tasks-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | FounderOS",
  description: "Execution-focused task management.",
};

export default function TasksPage() {
  return (
    <AppShell>
      <TasksView />
    </AppShell>
  );
}
