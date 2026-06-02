"use client";

import * as React from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "@/features/dashboard/workspace-switcher";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { useTaskStore } from "@/store/task-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { Workspace } from "@/types/workspace";
import type { Task } from "@/services/task.service";
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

type SearchAction = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  run: () => void;
};

type SearchResult = {
  workspaces: Workspace[];
  tasks: Task[];
  commands: Array<SearchAction & { score: number }>;
};

export function TopNav() {
  const router = useRouter();
  const { workspacesQuery, tasksQuery, userQuery } = useDashboardData();
  const workspaces = workspacesQuery.data ?? [];
  const user = userQuery?.data;
  const dashboardTasks = tasksQuery.data ?? [];
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const setTaskSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId);
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);

  const actions = React.useMemo<SearchAction[]>(
    () => [
      {
        id: "go-dashboard",
        label: "Go to Dashboard",
        description: "Portfolio overview",
        keywords: ["dashboard", "home", "overview"],
        run: () => router.push("/dashboard"),
      },
      {
        id: "go-tasks",
        label: "Go to Tasks",
        description: "Task execution board",
        keywords: ["tasks", "task", "todo", "board"],
        run: () => router.push("/tasks"),
      },
      {
        id: "go-workspaces",
        label: "Go to Workspaces",
        description: "Switch startup context",
        keywords: ["workspace", "workspaces", "startup", "ventures"],
        run: () => router.push("/workspaces"),
      },
      {
        id: "go-checkins",
        label: "Go to Check-ins",
        description: "Execution reflections",
        keywords: ["checkins", "check-ins", "streak", "productivity"],
        run: () => router.push("/checkins"),
      },
      {
        id: "go-outreach",
        label: "Go to Outreach",
        description: "Follow-ups and contact logs",
        keywords: ["outreach", "followup", "follow-up", "contacts", "leads"],
        run: () => router.push("/outreach"),
      },
      {
        id: "go-ai",
        label: "Go to AI Assistant",
        description: "Generate insights and content",
        keywords: ["ai", "insights", "summary", "content"],
        run: () => router.push("/ai"),
      },
      {
        id: "go-notifications",
        label: "Go to Notifications",
        description: "Review alerts and reminders",
        keywords: ["notifications", "alerts", "reminders", "inbox"],
        run: () => router.push("/notifications"),
      },
      {
        id: "go-settings",
        label: "Go to Settings",
        description: "Account and preferences",
        keywords: ["settings", "profile", "account"],
        run: () => router.push("/settings"),
      },
    ],
    [router]
  );

  const searchResults = React.useMemo<SearchResult>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { workspaces: [], tasks: [], commands: [] };

    const rank = (label: string, keywords: string[]) => {
      const normalizedLabel = label.toLowerCase();
      if (normalizedLabel === query) return 100;
      if (normalizedLabel.startsWith(query)) return 90;
      if (normalizedLabel.includes(query)) return 70;
      if (keywords.some((keyword) => keyword.includes(query) || query.includes(keyword))) return 50;
      return 0;
    };

    const commandResults = actions
      .map((action) => ({ ...action, score: rank(action.label, action.keywords) }))
      .filter((action) => action.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      workspaces: workspaces
        .map((workspace) => ({ workspace, score: rank(workspace.name, [workspace.name, "workspace", "startup"]) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.workspace),
      tasks: (dashboardTasks ?? [])
        .map((task) => ({ task, score: rank(task.title, [task.title, "task", task.status, String(task.priority)]) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.task),
      commands: commandResults,
    };
  }, [actions, dashboardTasks, searchQuery, workspaces]);

  const hasSearchResults =
    searchResults.workspaces.length > 0 || searchResults.tasks.length > 0 || searchResults.commands.length > 0;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-global-search]")) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) return;

    const commandMatch = actions.find((action) =>
      action.label.toLowerCase() === query.toLowerCase() ||
      action.keywords.some((keyword) => keyword === query.toLowerCase())
    );
    if (commandMatch) {
      commandMatch.run();
      setIsSearchOpen(false);
      return;
    }

    const exactWorkspace = workspaces.find((workspace) => workspace.name.toLowerCase() === query.toLowerCase());
    if (exactWorkspace) {
      setWorkspaceId(exactWorkspace.id);
      router.push("/workspaces");
      setIsSearchOpen(false);
      return;
    }

    const exactTask = (dashboardTasks ?? []).find((task) => task.title.toLowerCase() === query.toLowerCase());
    if (exactTask) {
      setWorkspaceId(exactTask.workspace_id);
      setTaskSearchQuery(exactTask.title);
      setSelectedTaskId(exactTask.id);
      router.push("/tasks");
      setIsSearchOpen(false);
      return;
    }

    setTaskSearchQuery(query);
    router.push("/tasks");
    setIsSearchOpen(false);
  };

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
        <div className="relative hidden flex-1 max-w-xl mx-auto items-center md:flex" data-global-search>
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks, workspaces, or type a command..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border transition-colors h-10 w-full rounded-lg"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearchSubmit();
              }
              if (event.key === "Escape") {
                setIsSearchOpen(false);
              }
            }}
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border bg-popover p-2 shadow-lg">
              {!hasSearchResults ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  No results found. Press Enter to search tasks by this text.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.commands.length > 0 && (
                    <div>
                      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Commands</p>
                      {searchResults.commands.map((action) => (
                        <button
                          key={action.id}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            action.run();
                            setIsSearchOpen(false);
                          }}
                        >
                          <span>
                            <span className="text-sm font-medium">{action.label}</span>
                            <span className="block text-xs text-muted-foreground">{action.description}</span>
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Enter</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.workspaces.length > 0 && (
                    <div>
                      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspaces</p>
                      {searchResults.workspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setWorkspaceId(workspace.id);
                            router.push("/workspaces");
                            setIsSearchOpen(false);
                          }}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {workspace.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-sm font-medium">{workspace.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div>
                      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tasks</p>
                      {searchResults.tasks.map((task) => (
                        <button
                          key={task.id}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setWorkspaceId(task.workspace_id);
                            setTaskSearchQuery(task.title);
                            setSelectedTaskId(task.id);
                            router.push("/tasks");
                            setIsSearchOpen(false);
                          }}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            T
                          </span>
                          <span className="text-sm font-medium truncate">{task.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
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
