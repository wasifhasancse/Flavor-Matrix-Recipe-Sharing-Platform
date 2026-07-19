"use client";

import React from "react";
import { Link, Button } from "@heroui/react";
import { ChefHat, Mail } from "lucide-react";
import { usePathname } from "next/navigation";

// Inline Custom SVGs to prevent dependency/lucide-react export issues
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  const footerLinks = {
    explore: [
      { label: "All Recipes", href: "/recipes" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Categories", href: "/categories" },
      { label: "Trending", href: "/trending" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
      { label: "Community Guide", href: "/community" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Settings", href: "/cookies" },
    ],
  };

  return (
    <footer className="w-full bg-gradient-subtle transition-smooth py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
        {/* Brand Information Column */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 text-foreground">
            <div className="flex items-center justify-center p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/10">
              <ChefHat className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-gradient-primary">
              Flavor Matrix
            </span>
          </Link>
          <p className="text-sm text-default-500 max-w-sm">
            Discover, share, and collaborate on delicious recipes worldwide. Bring your culinary ideas to life with our dynamic taste engine.
          </p>
          {/* Social Media Links */}
          <div className="flex gap-4 mt-2">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Facebook"
              className="hover:text-primary transition-colors text-default-500 flex items-center justify-center"
            >
              <FacebookIcon />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Instagram"
              className="hover:text-primary transition-colors text-default-500 flex items-center justify-center"
            >
              <InstagramIcon />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Twitter/X"
              className="hover:text-primary transition-colors text-default-500 flex items-center justify-center"
            >
              <XIcon />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="YouTube"
              className="hover:text-primary transition-colors text-default-500 flex items-center justify-center"
            >
              <YoutubeIcon />
            </Button>
          </div>
        </div>

        {/* Link Columns */}
        <div className="flex flex-col gap-4">
          <span className="font-semibold text-sm tracking-wider uppercase text-foreground">Explore</span>
          <div className="flex flex-col gap-2">
            {footerLinks.explore.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-default-500 hover:text-primary transition-colors justify-start"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-semibold text-sm tracking-wider uppercase text-foreground">Company</span>
          <div className="flex flex-col gap-2">
            {footerLinks.company.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-default-500 hover:text-primary transition-colors justify-start"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-semibold text-sm tracking-wider uppercase text-foreground">Legal</span>
          <div className="flex flex-col gap-2">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-default-500 hover:text-primary transition-colors justify-start"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Column */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4">
          <span className="font-semibold text-sm tracking-wider uppercase text-foreground">Newsletter</span>
          <p className="text-sm text-default-500">
            Subscribe to receive new recipes, cooking tips, and platform updates.
          </p>
          <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-default-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-default-100 dark:bg-zinc-900 border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground"
              />
            </div>
            <Button variant="primary" size="sm" type="submit" className="font-medium bg-primary text-primary-foreground w-full">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-default-100 dark:border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-default-400">
          &copy; {currentYear} Flavor Matrix. All rights reserved. Made for passionate home chefs.
        </p>
        <div className="flex gap-4">
          <span className="text-xs text-default-400 hover:text-primary cursor-pointer transition-colors">English (US)</span>
          <span className="text-xs text-default-400 hover:text-primary cursor-pointer transition-colors">USD ($)</span>
        </div>
      </div>
    </footer>
  );
}
