import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AiChatAssistant } from "@/components/shared/AiChatAssistant";

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
  description: "Discover, share, and profile culinary creations with home chefs around the world.",
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
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16 flex flex-col">
            {children}
          </main>
          <AiChatAssistant />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
