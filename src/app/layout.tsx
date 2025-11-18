import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentul Laundry - Jasa Laundry Profesional",
  description: "Layanan laundry profesional di Sentul City. Cuci, setrika, dan dry cleaning dengan kualitas terbaik.",
  keywords: ["Sentul Laundry", "Laundry", "Cuci", "Setrika", "Dry Cleaning", "Laundry Profesional", "Sentul City"],
  authors: [{ name: "Sentul Laundry Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Sentul Laundry",
    description: "Layanan laundry profesional di Sentul City dengan kualitas terbaik",
    url: "https://sentul-laundry.com",
    siteName: "Sentul Laundry",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentul Laundry",
    description: "Layanan laundry profesional di Sentul City dengan kualitas terbaik",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
