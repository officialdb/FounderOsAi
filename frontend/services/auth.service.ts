import { apiRequest } from "@/services/api-client";
import type { AuthResponse, User } from "@/types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name?: string | null;
};

export async function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(token: string) {
  return apiRequest<User>("/auth/me", {}, { token });
}

export async function logout() {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export type PasswordResetRequestPayload = {
  email: string;
};

export type PasswordResetConfirmPayload = {
  token: string;
  new_password: string;
};

export async function requestPasswordReset(payload: PasswordResetRequestPayload) {
  return apiRequest<{ message: string; reset_token?: string | null }>("/auth/password-reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload) {
  return apiRequest<{ message: string }>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
