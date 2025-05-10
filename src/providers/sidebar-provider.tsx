// src/providers/sidebar-provider.tsx
"use client"

import { useIsMobile } from "@/lib/useMobile"
import * as React from "react"

type SidebarContextType = {
    isOpen: boolean
    isMobile: boolean | null
    toggle: () => void
    close: () => void
    open: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile() // Uses your existing hook
    const [isOpen, setIsOpen] = React.useState(false)

    // Initialize state based on viewport
    React.useEffect(() => {
        // Only set initial state after we know if mobile
        if (isMobile !== null) {
            setIsOpen(!isMobile) // Open by default on desktop, closed on mobile
        }
    }, [isMobile])

    // Auto-close when switching to mobile view
    React.useEffect(() => {
        if (isMobile) {
            setIsOpen(false)
        } else {
            setIsOpen(true) // Auto-open when switching to desktop
        }
    }, [isMobile])

    const toggle = React.useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    const close = React.useCallback(() => {
        setIsOpen(false)
    }, [])

    const open = React.useCallback(() => {
        setIsOpen(true)
    }, [])

    // Memoize context value to prevent unnecessary re-renders
    const value = React.useMemo(() => ({
        isOpen,
        isMobile,
        toggle,
        close,
        open
    }), [isOpen, isMobile, toggle, close, open])

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}