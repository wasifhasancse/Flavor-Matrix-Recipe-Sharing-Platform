import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/providers";
import { AiChatAssistant } from "@/components/shared/AiChatAssistant";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dns from "node:dns";
import "./globals.css";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flavor Matrix | Recipe Sharing & Flavor Profile Platform",
  description:
    "Discover, share, and profile culinary creations with home chefs around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-300">
        <Providers>
          <Navbar />
          <main className="flex-grow min-w-0 overflow-x-hidden pt-16 flex flex-col">
            {children}
          </main>
          <AiChatAssistant />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
