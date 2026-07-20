"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Radio, Send, ShieldAlert, History } from "lucide-react";

import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function AdminBroadcastsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/broadcasts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBroadcasts(data.broadcasts);
      }
    } catch (err) {
      console.error("Failed to fetch broadcasts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (isAdmin && token) {
      fetchBroadcasts();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, token, isPending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/broadcasts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Broadcast sent successfully!", "success");
        setSubject("");
        setMessage("");
        fetchBroadcasts();
      } else {
        throw new Error(data.error || "Failed to send broadcast");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldAlert className="h-16 w-16 text-danger mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      <div className="flex flex-col gap-1 border-b border-default-100 dark:border-zinc-800 pb-6">
        <DynamicBreadcrumb />
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2 flex items-center gap-3">
          <Radio className="h-8 w-8 text-indigo-500" />
          Platform Broadcasts
        </h1>
        <p className="text-default-500 font-medium">Send global newsletters and announcements to all users.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
        {/* Compose Broadcast */}
        <div className="flex flex-col gap-6">
          <div className="bg-default-50 dark:bg-zinc-900/50 p-6 sm:p-8 rounded-3xl border border-default-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Send className="h-5 w-5 text-indigo-500" /> Compose Message
            </h3>
            <form onSubmit={handleSend} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-wider mb-2 block">Subject Line</label>
                <input
                  type="text"
                  className="w-full bg-default-100 hover:bg-default-200 focus:bg-white dark:focus:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 rounded-xl p-4 text-base font-semibold transition-all outline-none text-foreground"
                  placeholder="e.g. Major Platform Update 2.0!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-wider mb-2 block">Message Content</label>
                <textarea
                  className="w-full bg-default-100 hover:bg-default-200 focus:bg-white dark:focus:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 rounded-xl p-4 text-base transition-all resize-y min-h-[200px] outline-none text-foreground"
                  placeholder="Type your announcement here... This will be visible to all users."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSending || !subject.trim() || !message.trim()}
                className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {isSending ? "Broadcasting..." : "Broadcast to All Users"}
              </button>
            </form>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="flex flex-col gap-6">
          <div className="bg-default-50 dark:bg-zinc-900/50 rounded-3xl border border-default-200 dark:border-zinc-800 overflow-hidden h-full">
            <div className="p-6 border-b border-default-200 dark:border-zinc-800 bg-default-100/50 dark:bg-zinc-800/30">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-default-500" /> Broadcast History
              </h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px] flex flex-col gap-4">
              {broadcasts.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center">
                  <Radio className="h-12 w-12 text-default-300 mb-4" />
                  <h3 className="text-lg font-bold text-foreground">No broadcasts sent</h3>
                  <p className="text-default-500 mt-2">Your announcement history will appear here.</p>
                </div>
              ) : (
                broadcasts.map((b, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-default-200 dark:border-zinc-700 shadow-sm">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="text-lg font-bold text-foreground leading-tight">{b.subject}</h4>
                      <span className="text-xs font-semibold text-default-400 whitespace-nowrap bg-default-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-default-600 dark:text-default-400 whitespace-pre-wrap leading-relaxed">
                      {b.message}
                    </p>
                    <div className="mt-4 pt-3 border-t border-default-100 dark:border-zinc-700 flex justify-between items-center text-xs text-default-400">
                      <span>Sent by: {b.adminEmail}</span>
                      <span>ID: {b._id.slice(-6)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-6 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 border text-white ${toast.type === "success" ? "bg-zinc-900 border-indigo-500" : "bg-danger border-danger-600"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
