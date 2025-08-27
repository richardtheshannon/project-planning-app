import type { Metadata } from "next";
// STEP 1: Import both Roboto and Nunito fonts from next/font/google.
import { Roboto, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

// STEP 2: Configure Roboto for titles. 
// We assign it the CSS variable '--font-roboto'.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

// STEP 3: Configure Nunito for paragraphs.
// We assign it the CSS variable '--font-nunito'.
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
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
        // ✅ MODIFIED: Removed 'h-full', 'flex', and 'flex-col'.
        // This allows the body to grow and the browser to handle scrolling naturally.
        className={cn(
          "bg-background font-sans antialiased",
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