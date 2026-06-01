import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthForm } from "./auth-form";

const push = vi.fn();
const refresh = vi.fn();
const setAuthToken = vi.fn();
const login = vi.fn();
const register = vi.fn();
const setToken = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
  useSearchParams: () => ({
    get: (key: string) => searchParams.get(key),
  }),
}));

vi.mock("@/services/auth.service", () => ({
  login: (...args: unknown[]) => login(...args),
  register: (...args: unknown[]) => register(...args),
}));

vi.mock("@/lib/auth", () => ({
  setAuthToken: (...args: unknown[]) => setAuthToken(...args),
}));

vi.mock("@/store/auth-store", () => ({
  useAuthStore: {
    getState: () => ({
      setToken,
    }),
  },
}));

describe("AuthForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    setAuthToken.mockReset();
    login.mockReset();
    register.mockReset();
    setToken.mockReset();
    searchParams.delete("next");
  });

  it("submits the login form and stores the token", async () => {
    login.mockResolvedValue({
      token: { access_token: "login-token" },
    });

    const user = userEvent.setup();

    render(<AuthForm mode="login" />);

    await user.type(screen.getByPlaceholderText("Username or Email"), "founder@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "founder@example.com",
        password: "password123",
      });
    });

    expect(setAuthToken).toHaveBeenCalledWith("login-token");
    expect(setToken).toHaveBeenCalledWith("login-token");
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });

  it("submits the register form and stores the token", async () => {
    register.mockResolvedValue({
      token: { access_token: "register-token" },
    });

    const user = userEvent.setup();

    render(<AuthForm mode="register" />);

    await user.type(screen.getByPlaceholderText("Full name"), "Founder One");
    await user.type(screen.getByPlaceholderText("Username or Email"), "founder@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.type(screen.getByPlaceholderText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        full_name: "Founder One",
        email: "founder@example.com",
        password: "password123",
      });
    });

    expect(setAuthToken).toHaveBeenCalledWith("register-token");
    expect(setToken).toHaveBeenCalledWith("register-token");
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });
});
