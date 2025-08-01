// src/components/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"
// 1. Import ThemeProvider from the 'next-themes' library
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 2. Use the ThemeProvider from 'next-themes' */}
      <ThemeProvider
        attribute="class" // This is crucial: it tells the provider to toggle the 'dark' class on the <html> tag
        defaultTheme="system" // It's better to default to the user's system preference
        enableSystem // Allows for the 'system' option
        disableTransitionOnChange // Prevents a flash of unstyled content on theme change
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
