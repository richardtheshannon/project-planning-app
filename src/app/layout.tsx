// src/app/layout.tsx

import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster" // 1. Import the Toaster

export const metadata: Metadata = {
  title: "Project Planning App",
  description: "A comprehensive project management application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster /> {/* 2. Add the Toaster here */}
      </body>
    </html>
  )
}
