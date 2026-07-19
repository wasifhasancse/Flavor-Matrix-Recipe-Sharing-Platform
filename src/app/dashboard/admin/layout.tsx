"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Flag,
  CreditCard,
  Menu,
  X,
  Shield,
  Loader2,
  LogOut,
  Settings,
  Wallet,
  Tags,
  Radio,
} from "lucide-react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 text-danger animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-default-500 font-medium">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-default-50 dark:bg-zinc-900/60 border-b border-default-100 dark:border-zinc-800 fixed top-16 left-0 right-0 z-30">
        <span className="font-bold text-sm text-foreground">Admin Console</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-default-500 hover:text-foreground cursor-pointer"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full lg:w-64 bg-default-50/50 dark:bg-zinc-900/40 border-r border-default-100 dark:border-zinc-800 flex flex-col gap-6 p-6 shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 overflow-y-auto lg:h-screen lg:pt-24 mt-[72px] lg:mt-0 ${
          isSidebarOpen ? "block fixed inset-x-0 inset-y-0 top-16 z-40 bg-background h-[calc(100vh-4rem)] pt-6" : "hidden lg:flex"
        }`}
      >
        <div className="flex flex-col gap-3 pb-6 border-b border-default-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center font-bold shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-foreground truncate">{session.user.name}</span>
              <span className="text-[10px] text-danger font-extrabold tracking-wider uppercase">System Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {[
            { label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
            { label: "User Management", icon: Users, href: "/dashboard/admin/users" },
            { label: "Recipe Approvals", icon: BookOpen, href: "/dashboard/admin/recipes" },
            { label: "Moderation Reports", icon: Flag, href: "/dashboard/admin/reports" },
            { label: "Platform Settings", icon: Settings, href: "/dashboard/admin/settings" },
            { label: "Revenue & Withdrawals", icon: Wallet, href: "/dashboard/admin/withdrawals" },
            { label: "Categories", icon: Tags, href: "/dashboard/admin/categories" },
            { label: "Broadcasts", icon: Radio, href: "/dashboard/admin/broadcasts" },
          ].map((item) => {
            const isSelected = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer no-underline ${
                  isSelected
                    ? "bg-danger text-white shadow-md shadow-danger/20 font-bold"
                    : "text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Transactions Direct Link */}
        <div className="pb-4">
          <Link href="/dashboard/admin/transactions" className="no-underline block" onClick={() => setIsSidebarOpen(false)}>
            <Button
              variant="outline"
              className={`w-full font-bold text-xs py-2.5 rounded-xl border border-default-200 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-pointer transition-smooth ${
                pathname === "/dashboard/admin/transactions" 
                  ? "bg-default-200 dark:bg-zinc-700 text-foreground border-default-400" 
                  : "hover:bg-default-100 dark:hover:bg-zinc-800 text-default-600"
              }`}
            >
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>Transaction Logs</span>
            </Button>
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="mt-auto pb-8 lg:pb-0">
          <Button
            variant="danger-soft"
            onClick={() => authClient.signOut()}
            className="w-full font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-smooth bg-danger/10 text-danger hover:bg-danger hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 w-full lg:ml-64 relative z-10 pt-4 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
