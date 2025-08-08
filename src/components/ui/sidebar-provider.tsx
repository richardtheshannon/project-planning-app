"use client"

import * as React from "react"

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SidebarProvider({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: SidebarProviderProps) {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)

  const open = openProp !== undefined ? openProp : _open
  
  const setOpen: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
    (value) => {
      const newValue = typeof value === "function" ? value(open) : value
      if (onOpenChange) {
        onOpenChange(newValue)
      } else {
        _setOpen(value)
      }
    },
    [open, onOpenChange]
  )

  React.useEffect(() => {
    const checkMobile = () => {
      const isMobileNow = window.innerWidth < 768;
      setIsMobile(isMobileNow);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}
