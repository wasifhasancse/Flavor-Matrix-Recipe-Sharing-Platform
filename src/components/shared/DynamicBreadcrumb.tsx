"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage or auth pages
  if (!pathname || pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const paths = pathname.split("/").filter(Boolean);

  // Custom Dashboard Back Link for deeper dashboard routes
  const isDashboardDeepRoute = isDashboard && paths.length > 2;

  return (
    <div className={`w-full bg-background border-b border-default-100 dark:border-zinc-800 ${isDashboard ? 'lg:pl-64' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-default-400 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {isDashboardDeepRoute ? (
          <Link href={`/dashboard/${paths[1]}`} className="hover:text-primary transition-smooth flex items-center gap-1 shrink-0">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link href="/" className="hover:text-primary transition-smooth flex items-center gap-1 shrink-0">
            <Home className="h-3.5 w-3.5" />
          </Link>
        )}

        {paths.map((path, index) => {
          // If we are showing the custom dashboard back link, skip the first two paths (dashboard, user/admin)
          if (isDashboardDeepRoute && index < 2) return null;

          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <React.Fragment key={path}>
              <ChevronRight className="h-3 w-3 shrink-0" />
              {isLast ? (
                <span className="text-foreground font-semibold shrink-0">{formattedPath}</span>
              ) : (
                <Link href={href} className="hover:text-primary transition-smooth shrink-0">
                  {formattedPath}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
