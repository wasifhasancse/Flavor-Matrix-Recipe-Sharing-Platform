"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { authClient } from "@/lib/auth-client";
import { ChefHat, LayoutDashboard, LogOut, Settings, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Scroll detection to add elevation/shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleOutsideClick = () => {
      setIsProfileOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isProfileOpen]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const userRole = (session?.user as { role?: string })?.role;
  const dashboardLink = userRole === "admin" ? "/dashboard/admin" : "/dashboard/user";
  const isDashboard = pathname?.startsWith("/dashboard");

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Recipes", href: "/recipes" },
    { label: "Community", href: "/community" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-default-200 dark:border-zinc-800 shadow-sm"
          : "bg-background/40 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className={`${isDashboard ? "w-full" : "max-w-7xl mx-auto"} px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between`}>
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2 hover:opacity-90 text-foreground">
            <div className="flex items-center justify-center p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ChefHat className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient-primary">
              Flavor Matrix
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden sm:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-orange-500 font-semibold"
                    : "text-foreground/70 hover:text-foreground font-medium"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {!isPending && session && (
            <Link
              href={dashboardLink}
              className={`text-sm transition-colors ${
                pathname === dashboardLink
                  ? "text-orange-500 font-semibold"
                  : "text-foreground/70 hover:text-foreground font-medium"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Actions: Theme Switcher & Auth States */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          {!isPending && (
            <>
              {session ? (
                /* Authenticated State with Custom Dropdown */
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    className="focus:outline-none flex items-center"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full ring-2 ring-primary object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full ring-2 ring-primary bg-primary text-primary-foreground font-semibold flex items-center justify-center text-xs cursor-pointer hover:scale-105 transition-transform">
                        {(session.user.name || session.user.email || "U").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>
                  {isProfileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2 border-b border-default-100 dark:border-zinc-800">
                        <p className="font-semibold text-xs text-default-500">Signed in as</p>
                        <p className="font-semibold text-sm text-foreground truncate">{session.user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={dashboardLink}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-default-100 dark:hover:bg-zinc-800 transition-colors w-full justify-start font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-default-100 dark:hover:bg-zinc-800 transition-colors w-full justify-start font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>
                      <hr className="border-default-100 dark:border-zinc-800 my-1" />
                      <div className="px-1">
                        <Button
                          variant="danger-soft"
                          size="sm"
                          className="w-full justify-start text-left font-medium"
                          onPress={() => {
                            setIsProfileOpen(false);
                            handleSignOut();
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" /> Log Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated State */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="font-medium text-sm text-foreground/70 hover:text-foreground hidden md:inline-flex px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="font-medium text-sm bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-lg px-4 py-1.5 flex items-center justify-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer/Menu Panel */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-16 bg-white dark:bg-zinc-900 border-b border-default-200 dark:border-zinc-800 shadow-lg z-45 flex flex-col p-4 gap-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full text-lg py-2 ${
                    isActive ? "text-orange-500 font-semibold" : "text-foreground/70 font-medium hover:text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <hr className="border-default-100 dark:border-zinc-800" />
          {!isPending && (
            <div>
              {session ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/settings"
                    className="w-full text-lg py-2 text-foreground/70 font-medium hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Button
                    variant="danger-soft"
                    className="w-full justify-start text-left mt-2 font-medium"
                    onPress={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/login"
                    className="w-full font-medium border border-default-200 dark:border-zinc-800 rounded-lg py-2 flex items-center justify-center text-foreground hover:bg-default-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="w-full font-medium bg-primary text-primary-foreground rounded-lg py-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
