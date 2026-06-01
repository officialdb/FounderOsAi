const defaultBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type ApiClientOptions = {
  token?: string | null;
};

import { clearAuthToken } from "@/lib/auth";

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
  clientOptions: ApiClientOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${defaultBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(clientOptions.token ? { Authorization: `Bearer ${clientOptions.token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearAuthToken();
      window.location.href = "/login";
    }
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

