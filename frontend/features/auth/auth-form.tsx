"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/feedback/form-error";
import { login, register } from "@/services/auth.service";
import { setAuthToken } from "@/lib/auth";
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "@/lib/schemas/auth";
import { useAuthStore } from "@/store/auth-store";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirmPassword: "" },
  });

  const isLogin = mode === "login";

  const onLoginSubmit = loginForm.handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email: values.email, password: values.password });
      setAuthToken(response.token.access_token);
      useAuthStore.getState().setToken(response.token.access_token);
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const onRegisterSubmit = registerForm.handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await register({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
      });
      setAuthToken(response.token.access_token);
      useAuthStore.getState().setToken(response.token.access_token);
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen bg-background">
      {/* Left Column: Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Welcome back!" : "Create an account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Simplify your workflow and boost your productivity with FounderOS. Get started for free.
            </p>
          </div>

          <form className="space-y-4" onSubmit={isLogin ? onLoginSubmit : onRegisterSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <Input className="rounded-full h-12 px-6" placeholder="Full name" {...registerForm.register("full_name")} />
                <FormError message={registerForm.formState.errors.full_name?.message} />
              </div>
            )}

            <div className="space-y-2">
              <Input className="rounded-full h-12 px-6" placeholder="Username or Email" type="email" {...(isLogin ? loginForm.register("email") : registerForm.register("email"))} />
              <FormError message={isLogin ? loginForm.formState.errors.email?.message : registerForm.formState.errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Input className="rounded-full h-12 px-6" placeholder="Password" type="password" {...(isLogin ? loginForm.register("password") : registerForm.register("password"))} />
              <FormError message={isLogin ? loginForm.formState.errors.password?.message : registerForm.formState.errors.password?.message} />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Input className="rounded-full h-12 px-6" placeholder="Confirm password" type="password" {...registerForm.register("confirmPassword")} />
                <FormError message={registerForm.formState.errors.confirmPassword?.message} />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  Forgot Password?
                </Link>
              </div>
            )}

            <FormError message={serverError ?? undefined} />

            <Button className="w-full rounded-full h-12 text-base font-semibold" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Register"}
            </Button>
          </form>

          {/* Social Logins */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2">
                <span className="font-bold text-lg">G</span>
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2">
                <span className="font-bold text-lg"></span>
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2">
                <span className="font-bold text-lg">f</span>
              </Button>
            </div>
          </div>

          <div className="text-center text-sm">
            {isLogin ? (
              <p className="text-muted-foreground">
                Not a member? <Link href="/register" className="font-semibold text-foreground hover:underline">Register now</Link>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Already have an account? <Link href="/login" className="font-semibold text-foreground hover:underline">Login</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Illustration Panel */}
      <div className="hidden lg:flex w-1/2 p-6">
        <div className="relative flex h-full w-full flex-col items-center justify-center rounded-[2.5rem] bg-secondary/10 px-8 py-12 text-center">
          <div className="relative mb-8 w-full max-w-[500px] flex-1">
            <Image
              src="/auth-illustration.png"
              alt="FounderOS Authentication Illustration"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
          
          <div className="mb-8 flex gap-2">
            <div className="h-2 w-6 rounded-full bg-foreground/20"></div>
            <div className="h-2 w-6 rounded-full bg-foreground"></div>
            <div className="h-2 w-6 rounded-full bg-foreground/20"></div>
          </div>

          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Make your work easier and organized with FounderOS
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
}
