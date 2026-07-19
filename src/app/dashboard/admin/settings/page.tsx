"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Settings, ShieldAlert, Users, BookOpen, Save } from "lucide-react";

import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function AdminSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationsOpen: true,
    strictModeration: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setSettings(d.settings);
        }
      })
      .catch((err) => console.error("Failed to fetch settings", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast("Settings saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = (session?.user as any)?.role === "admin";

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500">Loading configurations...</p>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldAlert className="h-16 w-16 text-warning mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-default-500">Administrator privileges are required.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-default-100 dark:border-zinc-800 pb-6">
        <DynamicBreadcrumb />
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Platform Settings
        </h1>
        <p className="text-default-500 font-medium max-w-2xl mt-1 text-sm sm:text-base">
          Configure global platform rules, maintenance windows, and moderation strictness. 
          Changes here affect all users immediately.
        </p>
      </div>

      {/* Main Settings Panel */}
      <div className="bg-default-50 dark:bg-zinc-900/40 rounded-3xl p-6 sm:p-8 border border-default-200 dark:border-zinc-800 flex flex-col gap-8">
        
        {/* Maintenance Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-default-200 dark:border-zinc-800">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-danger/10 text-danger rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Maintenance Mode</h3>
              <p className="text-sm text-default-500 mt-1 max-w-md">
                Lock the entire platform down. Only administrators will be able to log in. Normal users will see a maintenance screen.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.maintenanceMode}
              onChange={() => handleToggle("maintenanceMode")}
            />
            <div className="w-11 h-6 bg-default-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
          </label>
        </div>

        {/* User Registrations */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-default-200 dark:border-zinc-800">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Open Registrations</h3>
              <p className="text-sm text-default-500 mt-1 max-w-md">
                Allow new users to sign up. Disabling this stops all new account creation globally.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.registrationsOpen}
              onChange={() => handleToggle("registrationsOpen")}
            />
            <div className="w-11 h-6 bg-default-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Strict Moderation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-warning/10 text-warning rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Strict Recipe Moderation</h3>
              <p className="text-sm text-default-500 mt-1 max-w-md">
                Require all newly submitted recipes to be manually approved by an admin before they are publicly visible.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={settings.strictModeration}
              onChange={() => handleToggle("strictModeration")}
            />
            <div className="w-11 h-6 bg-default-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
          </label>
        </div>

      </div>

      {/* Save Actions */}
      <div className="flex justify-end pt-4">
        <button
          className="bg-primary px-8 font-bold text-white rounded-xl py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-primary/90"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving Config..." : "Save Platform Configuration"}
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-black/20 font-medium text-sm flex items-center gap-2 border border-zinc-800">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
