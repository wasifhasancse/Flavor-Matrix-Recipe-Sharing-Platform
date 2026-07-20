"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Button,
  Chip,
  Avatar,
} from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Shield,
  Sparkles,
  Calendar,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Upload,
  Lock,
  ArrowLeft,
  ChevronRight,
  Award,
  Clock,
  ShieldCheck,
  Check,
  Camera,
  MapPin,
  Utensils,
  BookOpen,
  Heart,
  Star,
  DollarSign,
  TrendingUp,
  Globe,
  Zap,
  Key,
} from "lucide-react";
import { UserSchema } from "@/types/database";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function UserProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  // User State matching Database Architecture UserSchema
  const [profile, setProfile] = useState<UserSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bio, setBio] = useState<string>(
    "Passionate culinary enthusiast specializing in authentic Italian pasta, artisan pastry, and Mediterranean fusion flavors."
  );
  const [location, setLocation] = useState<string>("Naples, Italy");

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editImage, setEditImage] = useState<string>("");
  const [editBio, setEditBio] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Subscription State
  const [planData, setPlanData] = useState<{ plan: string; isActive: boolean } | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load User Profile Data
  useEffect(() => {
    if (!session?.user) return;

    setIsLoading(true);

    const profileKey = `user_profile_${session.user.id}`;
    const storedProfile = localStorage.getItem(profileKey);
    const premiumKey = `is_premium_account_${session.user.id}`;
    const isPremiumStored = localStorage.getItem(premiumKey) === "true";

    const bioKey = `user_bio_${session.user.id}`;
    const storedBio = localStorage.getItem(bioKey);
    if (storedBio) setBio(storedBio);

    const locKey = `user_loc_${session.user.id}`;
    const storedLoc = localStorage.getItem(locKey);
    if (storedLoc) setLocation(storedLoc);

    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile({
        ...parsed,
        isPremium: isPremiumStored || parsed.isPremium || false,
      });
    } else {
      const initialProfile: UserSchema = {
        id: session.user.id,
        name: session.user.name || "Chef Gourmet",
        email: session.user.email || "chef@flavor-matrix.com",
        image: session.user.image || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
        role: "user",
        isBlocked: false,
        isPremium: isPremiumStored,
        createdAt: "2026-01-15T10:00:00.000Z",
        updatedAt: new Date().toISOString(),
      };
      setProfile(initialProfile);
      localStorage.setItem(profileKey, JSON.stringify(initialProfile));
    }

    // Fetch Subscription Status
    fetch("/api/subscription/verify")
      .then((res) => res.json())
      .then((data) => {
        setPlanData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch plan:", err);
        setIsLoading(false);
      });
  }, [session]);

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditImage(profile.image || "");
    setEditBio(bio);
    setEditLocation(location);
    setIsEditModalOpen(true);
  };

  // Handle ImgBB Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEditImage(
          "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80"
        );
        showToast("Profile image uploaded successfully!");
      } else {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.data?.url) {
          setEditImage(data.data.url);
          showToast("Profile image uploaded to ImgBB!");
        } else {
          showToast("Failed to upload image. Paste URL manually.", "error");
        }
      }
    } catch {
      showToast("Error uploading profile picture.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session?.user) return;

    if (!editName.trim()) {
      showToast("Please enter a valid profile name.", "error");
      return;
    }

    setIsSaving(true);

    const updatedProfile: UserSchema = {
      ...profile,
      name: editName.trim(),
      image: editImage.trim() || profile.image,
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setProfile(updatedProfile);
      setBio(editBio);
      setLocation(editLocation);

      const profileKey = `user_profile_${session.user.id}`;
      localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
      localStorage.setItem(`user_bio_${session.user.id}`, editBio);
      localStorage.setItem(`user_loc_${session.user.id}`, editLocation);

      setIsSaving(false);
      setIsEditModalOpen(false);
      showToast("Profile updated successfully!");
    }, 700);
  };


  // Date formatting helper
  const formattedCreationDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "January 15, 2026";

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading profile information...</p>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">You must be logged in to view your profile.</p>
        <Link href="/login" className="no-underline">
          <Button  className="btn-primary  text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border ambient-glow-orange flex items-center gap-3 text-xs font-bold text-white ${
              toastMessage.type === "success" ? "bg-emerald-600 border-emerald-500" : "bg-rose-600 border-rose-500"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <User className="h-7 w-7 text-primary" />
            <span>Chef Profile & Settings</span>
          </h1>
        </div>

        <Button
          
          onClick={handleOpenEditModal}
          className="btn-primary bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 ambient-glow-orange shadow-orange-500/20 border-none cursor-pointer"
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* HERO COVER BANNER & OVERLAPPING AVATAR PROFILE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-divider dark:border-zinc-800/80 bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md ambient-glow-orange overflow-hidden"
      >
        {/* Culinary Decorative Banner Header */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 relative overflow-hidden flex items-end p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
          
          {/* Floating Badges on Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {planData?.plan === "premium" && (
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-extrabold flex items-center gap-1.5 shadow-md">
                <Sparkles className="h-3.5 w-3.5 fill-amber-300" />
                <span>GOLD PREMIUM TIER</span>
              </div>
            )}
            {planData?.plan === "pro" && (
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-sky-300 border border-sky-400/30 text-[10px] font-extrabold flex items-center gap-1.5 shadow-md">
                <Award className="h-3.5 w-3.5" />
                <span>PRO CHEF TIER</span>
              </div>
            )}
            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>VERIFIED ACCOUNT</span>
            </div>
          </div>
        </div>

        {/* Profile Details Bar with Overlapping Avatar */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Overlapping Avatar */}
            <div className="relative group">
              <Avatar.Root className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-background shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-3xl text-primary ambient-glow-orange">
                <Avatar.Image src={profile.image || ""} alt={profile.name} className="h-full w-full object-cover" />
                <Avatar.Fallback>{profile.name.charAt(0).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              
              <button
                onClick={handleOpenEditModal}
                className="absolute bottom-2 right-2 p-2 rounded-xl bg-primary text-white ambient-glow-orange border-2 border-background hover:scale-110 transition-transform cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Text Info */}
            <div className="flex flex-col gap-1.5 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {profile.name}
                </h2>
                {planData?.plan === "premium" && <Award className="h-6 w-6 text-amber-500" />}
                {planData?.plan === "pro" && <Award className="h-6 w-6 text-sky-500" />}
              </div>

              <span className="text-xs text-default-400 font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>{profile.email}</span>
                <span>•</span>
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                <span>{location}</span>
              </span>

              {/* Badges Bar */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {planData?.plan === "premium" && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>PREMIUM MEMBER</span>
                  </div>
                )}
                {planData?.plan === "pro" && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-[10px] font-extrabold bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-500 border border-sky-500/30 shadow-sm">
                    <Award className="h-3.5 w-3.5 text-sky-500" />
                    <span>PRO MEMBER</span>
                  </div>
                )}
                {(planData?.plan === "free" || !planData?.plan) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-default-200/60 dark:bg-zinc-800 text-default-600 dark:text-default-400 border border-default-300 dark:border-zinc-700">
                    <span>STANDARD ACCOUNT</span>
                  </div>
                )}

                <Chip color="accent" variant="soft" size="sm" className="font-extrabold uppercase text-[10px]">
                  {profile.role.toUpperCase()}
                </Chip>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {planData?.plan !== "premium" && (
              <Link href="/pricing" className="no-underline w-full">
                <Button
                  
                  className="btn-secondary font-bold text-xs py-2.5 px-4 rounded-2xl border transition-all cursor-pointer border-amber-500/40 text-amber-500 hover:bg-amber-500/10 shadow-sm w-full"
                >
                  Upgrade Membership
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* QUICK CHEF STATS METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <Utensils className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-foreground">4</span>
            <span className="text-[11px] text-default-400 font-medium">Recipes Published</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Heart className="h-5 w-5 fill-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-foreground">520</span>
            <span className="text-[11px] text-default-400 font-medium">Likes Received</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Star className="h-5 w-5 fill-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-foreground">12</span>
            <span className="text-[11px] text-default-400 font-medium">Saved Favorites</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-foreground">$59.86</span>
            <span className="text-[11px] text-default-400 font-medium">Recipe Sales</span>
          </div>
        </div>
      </div>

      {/* MULTI-SECTION CARDS (Bio & Details, Premium Perks, Account Security) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bio & Personal Information */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Biography & Specialty Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 ambient-glow-orange flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-primary" />
                <span>Culinary Biography & Specialty</span>
              </h3>
              <button
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit</span>
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-default-600 dark:text-default-400 leading-relaxed font-normal">
              {bio}
            </p>
          </div>

          {/* Account Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-default-400 flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Full Display Name
              </span>
              <span className="text-sm font-bold text-foreground">{profile.name}</span>
            </div>

            <div className="p-6 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-default-400 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-emerald-500" />
                Email Address
              </span>
              <span className="text-sm font-bold text-foreground truncate">{profile.email}</span>
            </div>

            <div className="p-6 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-default-400 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-amber-500" />
                Account Role
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground capitalize">{profile.role}</span>
                <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
                  Verified
                </Chip>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-default-400 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-purple-500" />
                Member Joined Date
              </span>
              <span className="text-sm font-bold text-foreground">{formattedCreationDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Membership Tier Perks & Security Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Membership Status & Unlocked Perks Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 backdrop-blur-md border border-amber-500/30 ambient-glow-orange flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 fill-amber-400" />
                <h3 className="font-extrabold text-base text-amber-600 dark:text-amber-400">
                  {planData?.plan === "premium" ? "Premium Chef Benefits" : planData?.plan === "pro" ? "Pro Chef Benefits" : "Standard Account Tier"}
                </h3>
              </div>
              <Chip color="warning" variant="soft" size="sm" className="font-extrabold text-[10px]">
                {planData?.plan === "premium" ? "Active Premium Tier" : planData?.plan === "pro" ? "Active Pro Tier" : "Free Account"}
              </Chip>
            </div>

            {/* Perks List */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Unlimited Recipe Publishing", unlocked: planData?.plan === "premium" },
                { label: "10 Recipe Publishing / Month", unlocked: planData?.plan === "pro" },
                { label: "80% Revenue Share on Recipe Sales", unlocked: planData?.plan === "premium" || planData?.plan === "pro" },
                { label: "Featured Badge on Recipe Cards", unlocked: planData?.plan === "premium" || planData?.plan === "pro" },
                { label: "Instant Stripe Direct Withdrawals", unlocked: true },
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                      perk.unlocked
                        ? "bg-amber-500 text-white"
                        : "bg-default-200 dark:bg-zinc-800 text-default-400"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className={perk.unlocked ? "text-foreground font-bold" : "text-default-400"}>
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>

            {planData?.plan !== "premium" && (
              <Link href="/pricing" className="no-underline w-full">
                <Button
                  
                  className="btn-primary mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 ambient-glow-orange shadow-amber-500/20 border-none cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Unlock Premium Lifetime Access</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Account Security Banner */}
          <div className="p-6 rounded-3xl bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 shadow-md flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-xs text-foreground">Multi-Layer Account Protection</span>
              <span className="text-[11px] text-default-400">
                Better-Auth session encryption & verified Stripe integration active.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UPDATE PROFILE HEROUI MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-foreground">Edit Chef Profile</h3>
                    <span className="text-xs text-default-400">Update name, avatar, location & biography</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                {/* Full Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">
                    Full Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-semibold outline-none focus:border-primary"
                    required
                  />
                </div>

                {/* Location Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Naples, Italy"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-semibold outline-none focus:border-primary"
                  />
                </div>

                {/* Biography */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Culinary Biography & Specialty</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Describe your culinary style..."
                    className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary min-h-[80px]"
                  />
                </div>

                {/* Profile Image Field with Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Profile Picture File / URL</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3 py-2 border border-default-200 dark:border-zinc-800 rounded-xl cursor-pointer bg-default-50 hover:bg-default-100 text-xs font-semibold text-foreground">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4" />}
                      <span>Upload ImgBB</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isUploading} />
                    </label>
                    <input
                      type="url"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      placeholder="Or paste image URL..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  {editImage && (
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar.Root className="w-12 h-12 rounded-xl border overflow-hidden">
                        <Avatar.Image src={editImage} alt="Preview" className="h-full w-full object-cover" />
                        <Avatar.Fallback>P</Avatar.Fallback>
                      </Avatar.Root>
                      <span className="text-[11px] text-emerald-500 font-bold">Preview Thumbnail Ready</span>
                    </div>
                  )}
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex gap-2 justify-end border-t border-default-100 dark:border-zinc-800 pt-4 mt-2">
                  <Button
                    type="button"
                    
                     onClick={() => setIsEditModalOpen(false)}
                    isDisabled={isSaving}
                    className="btn-secondary font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    
                    isDisabled={isSaving || isUploading}
                    className="btn-primary  hover:/90 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
