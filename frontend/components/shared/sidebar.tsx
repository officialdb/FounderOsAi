"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div className={cn("flex h-full flex-col gap-6 py-6 transition-all duration-300", sidebarOpen ? "px-4" : "px-2")}>
      <div className={cn("flex items-center mb-2", sidebarOpen ? "justify-between px-3" : "justify-center px-0")}>
        {sidebarOpen && (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main Menu</h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex flex-col gap-1 flex-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
                sidebarOpen ? "gap-3 px-3" : "justify-center px-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className={cn("mt-auto", sidebarOpen ? "px-3" : "px-0 flex justify-center")}>
        <div className={cn("flex items-center rounded-lg bg-muted/40", sidebarOpen ? "gap-3 p-3" : "p-2 justify-center")}>
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">FOS</span>
          </div>
          {sidebarOpen && (
            <div className="truncate">
              <p className="text-sm font-medium truncate">Pro Plan</p>
              <p className="text-xs text-muted-foreground truncate">Manage billing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

