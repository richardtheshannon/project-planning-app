// src/app/layout.tsx

import type { Metadata } from "next";
// 1. Import the font functions from next/font/google
import { Playfair_Display, Montserrat, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

// 2. Configure each font with subsets and a CSS variable name
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: 'swap',
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // It's good practice to specify needed weights
  variable: "--font-roboto",
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Project Planning App",
  description: "A comprehensive project management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Added suppressHydrationWarning for compatibility with the theme provider
    <html lang="en" suppressHydrationWarning>
      {/* 3. Combine all font variable classes in the body tag */}
      <body
        className={`antialiased ${playfairDisplay.variable} ${montserrat.variable} ${roboto.variable} ${robotoMono.variable}`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
