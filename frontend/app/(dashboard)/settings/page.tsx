import { AppShell } from "@/components/layouts/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
          Profile, workspace preferences, and UI settings will live here.
        </div>
      </div>
    </AppShell>
  );
}

