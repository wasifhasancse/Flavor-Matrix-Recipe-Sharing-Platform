"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TextField, Label, Input, Button, Link } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Image as ImageIcon, UserPlus, Loader2, ArrowLeft, Check, X, Eye, EyeOff, Sparkles, Flame } from "lucide-react";

function RegisterFormContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-content1 border border-divider shadow-2xl flex flex-col md:flex-row-reverse overflow-hidden">

      {/* Right side: Branding & Image (hidden on small screens) */}
      <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d"
          alt="Flavor Matrix Kitchen Splash"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent z-10"></div>

        {/* Branding Content */}
        <div className="relative z-20 flex flex-col justify-end p-12 h-full text-white">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Join the Flavor Matrix.
          </h2>
          <p className="text-zinc-300 text-lg mb-8 max-w-sm">
            Discover a world of exquisite recipes, share your own culinary masterpieces, and connect with a passionate community.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-400 bg-black/40 backdrop-blur-md p-4 rounded-2xl w-max border border-white/10">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-zinc-900"><Flame className="w-4 h-4 text-white" /></div>
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center border-2 border-zinc-900"><Sparkles className="w-4 h-4 text-white" /></div>
            </div>
            10k+ Active Chefs
          </div>
        </div>
      </div>

      {/* Left side: Form */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center gap-6 relative bg-background/50 backdrop-blur-sm">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/3"></div>

        {/* Header */}
        <div className="flex flex-col gap-1 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
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
            size="lg"
            className="w-full font-bold shadow-md shadow-primary/40 mt-4 text-white"
            isDisabled={isLoading || !isPasswordValid}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            Sign Up
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-default-500 mt-6">
          Already have an account?{" "}
          <Link
            href={`/login${searchParams.toString() ? "?" + searchParams.toString() : ""}`}
            className="text-primary font-bold hover:underline inline-flex items-center gap-1 transition-all hover:gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex-grow flex items-center justify-center pt-28 pb-12 px-4 bg-background relative transition-colors min-h-screen">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-amber-500/5 blur-[100px]"></div>
      </div>

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
