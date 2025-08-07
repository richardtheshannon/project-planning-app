// src/app/layout.tsx

import type { Metadata } from "next";
// UPDATED: Import Nunito and remove Playfair_Display and Montserrat
import { Roboto, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

// UPDATED: Configure Roboto for titles (serif)
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"], // Added 900 for bolder titles
  variable: "--font-roboto",
  display: 'swap',
});

// NEW: Configure Nunito for paragraphs (sans)
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
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
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <meta name="theme-color" content="#333333" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          "h-full flex flex-col bg-background font-sans antialiased",
          // UPDATED: Pass the new font variables to the body
          roboto.variable,
          nunito.variable
        )}
      >
        <Providers>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
