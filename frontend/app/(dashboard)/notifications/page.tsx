import { AppShell } from "@/components/layouts/app-shell";
import { NotificationView } from "@/features/notifications/notification-view";

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationView />
    </AppShell>
  );
}

