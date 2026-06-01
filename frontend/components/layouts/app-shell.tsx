import * as React from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { TopNav } from "@/components/shared/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-card/40 lg:block">
          <Sidebar />
        </aside>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

