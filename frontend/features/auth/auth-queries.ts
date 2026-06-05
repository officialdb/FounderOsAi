"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { fetchCurrentUser } from "@/services/auth.service";

export function useCurrentUser() {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => fetchCurrentUser(token ?? ""),
    enabled: Boolean(token),
  });
}
