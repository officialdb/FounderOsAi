"use client";

import * as React from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { TopNav } from "@/components/shared/top-nav";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopNav />
      <div 
        className={cn(
          "mx-auto flex-1 grid w-full max-w-[1600px] transition-all duration-300 ease-in-out grid-cols-1",
          sidebarOpen ? "lg:grid-cols-[280px_1fr]" : "lg:grid-cols-[80px_1fr]"
        )}
      >
        {/* Hidden on mobile, handled by mobile menu if it exists, but for lg we show the sidebar */}
        <aside className="hidden border-r bg-card/40 lg:block overflow-y-auto overflow-x-hidden relative h-[calc(100vh-64px)] sticky top-[64px]">
          <Sidebar />
        </aside>
        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}

