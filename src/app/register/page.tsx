"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TextField, Label, Input, Button, Link } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Image as ImageIcon, UserPlus, Loader2, ArrowLeft, Check, X } from "lucide-react";

function RegisterFormContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/";

  const { data: session, isPending } = authClient.useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push(callbackURL);
      router.refresh();
    }
  }, [session, callbackURL, router]);

  // Validation checks
  const isMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = isMinLength && hasUppercase && hasLowercase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all strength criteria.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          image: imageUrl || undefined,
        },
        {
          onSuccess: () => {
            router.push(callbackURL);
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to register. Please check your credentials.");
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isPending || session) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-default-100 dark:border-zinc-800 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create an Account
        </h1>
        <p className="text-sm text-default-500">
          Join Flavor Matrix to discover and share recipes
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <TextField className="flex flex-col gap-1">
          <Label className="text-sm font-medium text-default-700">Display Name <span className="text-danger">*</span></Label>
          <div className="relative flex items-center">
            <User className="absolute left-3 h-4 w-4 text-default-400" />
            <Input
              type="text"
              placeholder="Chef Gourmet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
              required
            />
          </div>
        </TextField>

        {/* Email */}
        <TextField className="flex flex-col gap-1">
          <Label className="text-sm font-medium text-default-700">Email Address <span className="text-danger">*</span></Label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-default-400" />
            <Input
              type="email"
              placeholder="chef@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
              required
            />
          </div>
        </TextField>

        {/* Image URL */}
        <TextField className="flex flex-col gap-1">
          <Label className="text-sm font-medium text-default-700">Avatar Image URL</Label>
          <div className="relative flex items-center">
            <ImageIcon className="absolute left-3 h-4 w-4 text-default-400" />
            <Input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
            />
          </div>
        </TextField>

        {/* Password */}
        <TextField className="flex flex-col gap-1">
          <Label className="text-sm font-medium text-default-700">Password <span className="text-danger">*</span></Label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-default-400" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
              required
            />
          </div>

          {/* Password Validation Requirements Checkbox List */}
          {password.length > 0 && (
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1.5">
                {isMinLength ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <X className="h-3.5 w-3.5 text-danger" />
                )}
                <span className={isMinLength ? "text-success font-medium" : "text-default-400"}>
                  Minimum 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUppercase ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <X className="h-3.5 w-3.5 text-danger" />
                )}
                <span className={hasUppercase ? "text-success font-medium" : "text-default-400"}>
                  At least 1 uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowercase ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <X className="h-3.5 w-3.5 text-danger" />
                )}
                <span className={hasLowercase ? "text-success font-medium" : "text-default-400"}>
                  At least 1 lowercase letter
                </span>
              </div>
            </div>
          )}
        </TextField>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all mt-2"
          isDisabled={isLoading || !isPasswordValid}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Sign Up
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-default-500">
        Already have an account?{" "}
        <Link
          href={`/login${searchParams.toString() ? "?" + searchParams.toString() : ""}`}
          className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
        >
          <ArrowLeft className="h-3 w-3" /> Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 bg-default-50 dark:bg-black transition-colors">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-default-500 font-medium">Loading form...</p>
          </div>
        }
      >
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
