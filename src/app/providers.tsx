"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // The ThemeProvider needs to wrap the SessionProvider
    // attribute="class" tells next-themes to change the class on the <html> element
    // defaultTheme="system" allows the app to default to the user's system preference
    // enableSystem allows for the system preference to be used
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
