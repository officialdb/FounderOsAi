"use client";

import * as React from "react";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "@/features/dashboard/workspace-switcher";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "./notification-bell";

export function TopNav() {
  const router = useRouter();
  const { workspacesQuery, userQuery } = useDashboardData();
  const workspaces = workspacesQuery.data ?? [];
  const user = userQuery?.data;
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Left side: Workspace Switcher */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs">
            FO
          </div>
          {(!isMounted || workspacesQuery.isLoading) ? (
            <div className="w-[240px] h-10 rounded-md bg-muted animate-pulse" />
          ) : (
            <WorkspaceSwitcher workspaces={workspaces} />
          )}
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks, workspaces, or type a command..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border transition-colors h-10 w-full rounded-lg"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5 h-9 rounded-lg">
            <Plus className="h-4 w-4" />
            <span className="font-medium text-xs">Create</span>
          </Button>
          
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer border border-border/50 hover:border-primary/50 transition-colors">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name ?? user?.email ?? 'User'}`} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name ?? "Founder"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? "founder@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground" 
                onClick={() => {
                  clearAuthToken();
                  router.push("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
