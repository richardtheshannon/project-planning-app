// src/app/layout.tsx

import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

// Font configurations remain the same
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
  weight: ["400", "500", "700"],
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
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={cn(
          // The body remains a full-height flex container
          "h-full flex flex-col bg-background font-sans antialiased",
          playfairDisplay.variable,
          montserrat.variable,
          roboto.variable,
          robotoMono.variable
        )}
      >
        <Providers>
            {/* STEP 1: Wrap children in a <main> tag. */}
            {/* STEP 2: Move the flex-grow classes here. This <main> element will now expand to fill all available space. */}
            <main className="flex flex-col flex-grow">
                {children}
            </main>
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
