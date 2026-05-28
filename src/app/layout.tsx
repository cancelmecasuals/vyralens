import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VyraLens — See What Goes Viral Before Everyone Else",
  description: "The world's most powerful viral content intelligence platform. Find, analyze, and recreate viral content across every platform with one keyword search.",
  keywords: "viral content, content creator tools, social media analytics, TikTok viral, Instagram viral, YouTube trends",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
