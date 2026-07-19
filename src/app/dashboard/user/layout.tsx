"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Button,
  Chip,
} from "@heroui/react";
import {
  LayoutDashboard,
  BookOpen,
  Star,
  ShoppingBag,
  Bookmark,
  BarChart3,
  Receipt,
  User,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  ArrowDownToLine,
  Loader2,
} from "lucide-react";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPremiumUser] = useState<boolean>(false); // mocked for display
  const [availableBalance] = useState<number>(47.88); // mocked for display

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-default-500 font-medium">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background pt-16">
      {/* Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-default-50 dark:bg-zinc-900/60 border-b border-default-100 dark:border-zinc-800 fixed top-16 left-0 right-0 z-30">
        <span className="font-bold text-sm text-foreground">User Dashboard</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-default-500 hover:text-foreground cursor-pointer"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full lg:w-64 bg-default-50/50 dark:bg-zinc-900/20 border-r border-default-100 dark:border-zinc-800 flex flex-col gap-6 p-6 shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 overflow-y-auto lg:h-screen lg:pt-24 mt-[72px] lg:mt-0 ${
          isSidebarOpen ? "block fixed inset-x-0 inset-y-0 top-16 z-40 bg-background h-[calc(100vh-4rem)] pt-6" : "hidden lg:flex"
        }`}
      >
        {/* User Card & Premium Badge */}
        <div className="flex flex-col gap-3 pb-6 border-b border-default-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar.Root className="w-10 h-10 rounded-full border-2 border-primary/20 shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary">
              <Avatar.Image src={session.user.image || ""} alt={session.user.name || "User"} />
              <Avatar.Fallback>{session.user.name?.charAt(0).toUpperCase() || "U"}</Avatar.Fallback>
            </Avatar.Root>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-foreground truncate">{session.user.name}</span>
              <span className="text-[11px] text-default-400 truncate">{session.user.email}</span>
            </div>
          </div>

          {/* Premium vs Standard Badge */}
          {isPremiumUser ? (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>PREMIUM MEMBER</span>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-default-200/60 dark:bg-zinc-800 text-default-600 dark:text-default-400 border border-default-300 dark:border-zinc-700">
              <span>STANDARD ACCOUNT</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-1.5 flex-1 pb-6">
          {[
            { label: "Overview", icon: LayoutDashboard, href: "/dashboard/user" },
            { label: "My Recipes", icon: BookOpen, href: "/dashboard/user/my-recipes" },
            { label: "Favorites", icon: Star, href: "/dashboard/user/favorites" },
            { label: "Purchased", icon: ShoppingBag, href: "/dashboard/user/purchased" },
            { label: "My Bookmarks", icon: Bookmark, href: "/dashboard/user/bookmarks" },
            { label: "Recipe Analytics", icon: BarChart3, href: "/dashboard/user/analytics" },
            { label: "Transactions", icon: Receipt, href: "/dashboard/user/transactions" },
            { label: "My Profile", icon: User, href: "/dashboard/user/profile" },
            { label: "Add Recipe", icon: PlusCircle, href: "/dashboard/user/add-recipe" },
          ].map((item) => {
            const isSelected = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth w-full text-left cursor-pointer no-underline ${
                  isSelected
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Chef Earnings Quick Widget on Sidebar */}
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-2 mt-auto shrink-0 mb-8 lg:mb-0">
          <div className="flex justify-between items-center text-xs">
            <span className="text-default-400 font-medium">Available Payout</span>
            <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
              ${availableBalance.toFixed(2)}
            </Chip>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Withdraw Money</span>
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
