import { AppShell } from "@/components/layouts/app-shell";
import { WorkspacesView } from "@/features/workspaces/workspaces-view";

export default function WorkspacesPage() {
  return (
    <AppShell>
      <WorkspacesView />
    </AppShell>
  );
}

