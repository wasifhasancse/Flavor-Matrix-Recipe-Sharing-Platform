"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TextField, Label, Input, Button, Link } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, User as UserIcon } from "lucide-react";

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            router.push(callbackURL);
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to sign in. Please check your credentials.");
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL,
      });
    } catch (err) {
      setError("Failed to initiate Google sign in.");
      setIsGoogleLoading(false);
    }
  };

  const handleDemoLogin = (role: "admin" | "user") => {
    if (role === "admin") {
      setEmail("admin@gmail.com");
      setPassword("Abc@12345678");
    } else {
      setEmail("user@gmail.com");
      setPassword("Abc@12345678");
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
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-content1 border border-divider shadow-lg flex flex-col md:flex-row overflow-hidden">

      {/* Left side: Branding & Image (hidden on small screens) */}
      <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1581340387417-e188200eb0f0"
          alt="Flavor Matrix Splash"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent z-10"></div>

        {/* Branding Content */}
        <div className="relative z-20 flex flex-col justify-end p-12 h-full text-white">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Welcome back to Flavor Matrix.
          </h2>
          <p className="text-zinc-300 text-lg mb-8 max-w-sm">
            Access your personalized recipe collection, connect with fellow food lovers, and continue your culinary journey.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-400 bg-black/40 backdrop-blur-md p-4 rounded-2xl w-max border border-white/10">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-zinc-900"><ShieldCheck className="w-4 h-4 text-white" /></div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-zinc-900"><Lock className="w-4 h-4 text-white" /></div>
            </div>
            Secure & Encrypted Access
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center gap-6 relative bg-background/50 backdrop-blur-sm">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        {/* Header */}
        <div className="flex flex-col gap-1 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Sign In
          </h1>
          <p className="text-sm text-default-500">
            Enter your credentials to access your account
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
          {/* Email */}
          <TextField className="flex flex-col gap-1">
            <Label className="text-sm font-medium text-default-700">Email Address</Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-default-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
                required
              />
            </div>
          </TextField>

          {/* Password */}
          <TextField className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-default-700">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-default-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/50 border border-default-200 dark:border-zinc-700 focus:border-primary focus:bg-background outline-none transition-all text-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 rounded-md text-default-400 hover:text-foreground transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </TextField>

          {/* Demo Credentials */}
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">Quick Access (Demo)</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-xl border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-all duration-300"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("user")}
                className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-xl border border-default-200 dark:border-zinc-700 bg-default-50 dark:bg-zinc-800/50 hover:bg-default-100 dark:hover:bg-zinc-800 text-default-700 dark:text-default-300 font-semibold transition-all duration-300"
              >
                <UserIcon className="w-4 h-4" />
                User
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 shadow-md shadow-orange-500/40 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all duration-300 mt-2"
            isDisabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-default-200 dark:border-zinc-800" />
          </div>
          <span className="relative px-3 text-xs uppercase bg-background text-default-400">
            Or continue with
          </span>
        </div>

        {/* Social Button */}
        <Button
          onPress={handleGoogleSignIn}
          
          size="lg"
          className="btn-secondary w-full font-bold border-2 border-default-200 hover:bg-default-100 transition-colors"
          isDisabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Sign In with Google
        </Button>

        {/* Footer */}
        <p className="text-center text-sm text-default-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${searchParams.toString() ? "?" + searchParams.toString() : ""}`}
            className="text-primary font-bold hover:underline inline-flex items-center justify-center gap-1 transition-all hover:gap-2"
          >
            Sign up <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-grow flex items-center justify-center pt-16 pb-12 px-4 bg-background relative transition-colors min-h-screen">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[40%] rounded-full bg-amber-500/5 blur-[100px]"></div>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-default-500 font-medium">Loading form...</p>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
