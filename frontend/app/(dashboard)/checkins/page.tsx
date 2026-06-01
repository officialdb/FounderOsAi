import { AppShell } from "@/components/layouts/app-shell";
import { CheckinsView } from "@/features/checkins/checkins-view";

export default function CheckinsPage() {
  return (
    <AppShell>
      <CheckinsView />
    </AppShell>
  );
}
