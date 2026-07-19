"use client";

import React, { useState, Suspense } from "react";
import { TextField, Label, Input, Button, Link as NextUILink } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // @ts-ignore - Better Auth typing issue
      const { error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email.");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-content1 border border-divider shadow-2xl flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-4 relative z-10">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h2>
          <p className="text-default-500 text-sm max-w-[260px]">
            We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Please check your inbox.
          </p>
          <Link 
            href="/login"
            className="w-full mt-6 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 flex items-center justify-center h-12 rounded-xl transition-all hover:opacity-90"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-2 text-center relative z-10">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Forgot Password
            </h1>
            <p className="text-sm text-default-500">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium z-10 relative">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            {/* Email */}
            <TextField className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-default-700">Email Address</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-default-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
                  required
                />
              </div>
            </TextField>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all"
              isDisabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </>
      )}

      {/* Footer Return Link */}
      {!isSubmitted && (
        <div className="relative z-10 text-center mt-2">
          <Link
            href="/login"
            className="text-sm text-default-500 hover:text-foreground font-medium transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex-grow flex items-center justify-center pt-28 pb-12 px-4 bg-background relative transition-colors min-h-screen">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-amber-500/5 blur-[100px]"></div>
      </div>
      
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-default-500 font-medium">Loading form...</p>
          </div>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}
