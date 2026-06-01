"use client";

import { LayoutList, LayoutGrid, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskStore } from "@/store/task-store";
import { useDashboardData } from "@/features/dashboard/dashboard-query";

export function TaskFilters() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    toggleStatusFilter,
    priorityFilter,
    togglePriorityFilter,
    viewMode,
    setViewMode,
  } = useTaskStore();

  const { workspacesQuery } = useDashboardData();
  const workspaces = workspacesQuery.data ?? [];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b">
      <div className="flex items-center w-full sm:w-auto flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-9 bg-background w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("pending")}
              onCheckedChange={() => toggleStatusFilter("pending")}
            >
              Pending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("in_progress")}
              onCheckedChange={() => toggleStatusFilter("in_progress")}
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("completed")}
              onCheckedChange={() => toggleStatusFilter("completed")}
            >
              Completed
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Filter Priority</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={priorityFilter.includes("high")}
              onCheckedChange={() => togglePriorityFilter("high")}
            >
              High
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={priorityFilter.includes("critical")}
              onCheckedChange={() => togglePriorityFilter("critical")}
            >
              Critical
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "board")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="board">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
