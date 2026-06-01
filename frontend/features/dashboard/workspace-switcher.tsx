"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Briefcase } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { Workspace } from "@/types/workspace";
import { WorkspaceModal } from "./workspace-modal";
import { useRouter } from "next/navigation";

type WorkspaceSwitcherProps = {
  workspaces: Workspace[];
};

export function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);
  const selectedWorkspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0] ?? null;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Select a workspace"
            className="w-[240px] justify-between border-border bg-card/50 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedWorkspace ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {selectedWorkspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{selectedWorkspace.name}</span>
                </>
              ) : (
                <span className="truncate font-medium text-muted-foreground">No workspaces</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="end">
          <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Workspaces</DropdownMenuLabel>
          {workspaces.length > 0 && <DropdownMenuSeparator />}
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => setWorkspaceId(workspace.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {workspace.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{workspace.name}</span>
              {workspaceId === workspace.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          {workspaces.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem 
            className="cursor-pointer text-muted-foreground"
            onSelect={() => router.push("/workspaces")}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            View all workspaces
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer font-medium"
            onSelect={(e) => {
              // Prevent DropdownMenu from stealing focus back immediately when Dialog opens
              e.preventDefault(); 
              setIsModalOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <WorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
