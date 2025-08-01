// src/components/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        defaultTheme="light"
        storageKey="project-ui-theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}