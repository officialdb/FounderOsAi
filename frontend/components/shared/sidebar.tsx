"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Send,
  Sparkles,
  BarChart,
  Bell,
  Settings,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workspaces", href: "/workspaces", icon: Briefcase },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Check-ins", href: "/checkins", icon: ClipboardList },
  { label: "Outreach", href: "/outreach", icon: Send },
  { label: "AI Assistant", href: "/ai", icon: Sparkles },
  { label: "Analytics", href: "/analytics", icon: BarChart },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 py-6 px-4">
      <div className="px-3 mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main Menu</h2>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 mt-auto">
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">FOS</span>
          </div>
          <div>
            <p className="text-sm font-medium">Pro Plan</p>
            <p className="text-xs text-muted-foreground">Manage billing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

