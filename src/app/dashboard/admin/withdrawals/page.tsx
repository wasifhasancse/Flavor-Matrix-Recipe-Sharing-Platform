"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { DollarSign, Wallet, ArrowDownToLine, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function AdminWithdrawalsPage() {
  const { data: session, isPending } = authClient.useSession();
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalWithdrawn: 0,
    availableBalance: 0,
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFinancials = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/revenue", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:5000/api/admin/withdrawals", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const listData = await listRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (listData.success) setWithdrawals(listData.withdrawals);
    } catch (err) {
      console.error("Failed to fetch financials", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (isAdmin && token) {
      fetchFinancials();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, token, isPending]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      showToast("Please enter a valid amount.", "error");
      return;
    }
    
    setIsWithdrawing(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          note: withdrawNote
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast("Withdrawal successful!", "success");
        setWithdrawAmount("");
        setWithdrawNote("");
        fetchFinancials(); // Refresh balance and list
      } else {
        throw new Error(data.error || "Withdrawal failed");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
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
          <Wallet className="h-8 w-8 text-emerald-500" />
          Revenue & Withdrawals
        </h1>
        <p className="text-default-500 font-medium">Manage platform earnings and payout withdrawals securely.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-default-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-default-200 dark:border-zinc-800 flex flex-col gap-2">
          <span className="text-sm font-bold text-default-500 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Total Revenue
          </span>
          <span className="text-4xl font-black text-foreground">${stats.totalRevenue.toFixed(2)}</span>
        </div>
        <div className="bg-default-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-default-200 dark:border-zinc-800 flex flex-col gap-2">
          <span className="text-sm font-bold text-default-500 uppercase tracking-wider flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-danger" /> Total Withdrawn
          </span>
          <span className="text-4xl font-black text-foreground">${stats.totalWithdrawn.toFixed(2)}</span>
        </div>
        <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20 flex flex-col gap-2">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Available Balance
          </span>
          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">${stats.availableBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Withdraw Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-default-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-default-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-emerald-500" /> Request Payout
            </h3>
            <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-wider mb-2 block">Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-default-400" />
                  </div>
                  <input 
                    type="number"
                    className="w-full bg-default-100 hover:bg-default-200 focus:bg-white dark:focus:bg-zinc-900 border-2 border-transparent focus:border-emerald-500 rounded-xl p-3 pl-9 text-sm transition-all outline-none text-foreground"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="1"
                    max={stats.availableBalance}
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-wider mb-2 block">Note (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-default-100 hover:bg-default-200 focus:bg-white dark:focus:bg-zinc-900 border-2 border-transparent focus:border-emerald-500 rounded-xl p-3 text-sm transition-all outline-none text-foreground"
                  placeholder="e.g. Monthly Payout"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={isWithdrawing || stats.availableBalance <= 0}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Withdraw Funds
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="lg:col-span-2">
          <div className="bg-default-50 dark:bg-zinc-900/50 rounded-3xl border border-default-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-default-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-foreground">Payout History</h3>
            </div>
            
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Wallet className="h-12 w-12 text-default-300 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No withdrawals yet</h3>
                <p className="text-default-500 mt-2">When you request a payout, it will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-default-100 dark:bg-zinc-800/50">
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-default-500">Date</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-default-500">Amount</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-default-500">Admin Email</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-default-500">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800">
                    {withdrawals.map((w, i) => (
                      <tr key={i} className="hover:bg-default-100/50 dark:hover:bg-zinc-800/30">
                        <td className="p-4 text-sm text-foreground">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-sm font-bold text-danger">-${w.amount.toFixed(2)}</td>
                        <td className="p-4 text-sm text-default-600">{w.adminEmail}</td>
                        <td className="p-4 text-sm text-default-500">{w.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-6 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 border text-white ${toast.type === "success" ? "bg-zinc-900 border-emerald-500" : "bg-danger border-danger-600"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
