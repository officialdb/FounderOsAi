const defaultBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type ApiClientOptions = {
  token?: string | null;
};

import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${defaultBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { token?: { access_token?: string } };
  const accessToken = data.token?.access_token;
  if (!accessToken) {
    return false;
  }

  setAuthToken(accessToken);
  useAuthStore.getState().setToken(accessToken);
  return true;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
  clientOptions: ApiClientOptions = {},
  skipRefresh = false,
): Promise<TResponse> {
  const response = await fetch(`${defaultBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(clientOptions.token ? { Authorization: `Bearer ${clientOptions.token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !skipRefresh && Boolean(clientOptions.token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const nextToken = getAuthToken();
        return apiRequest<TResponse>(path, options, { token: nextToken }, true);
      }
      clearAuthToken();
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}
