// src/components/ui/navigation/SidebarToggle.tsx
"use client"

import { useSidebar } from "@/providers/sidebar-provider"
import { Button } from "@/components/Button"
import { Menu, X } from "lucide-react"

export function SidebarToggle() {
  const { isOpen, isMobile, toggle } = useSidebar()

  if (!isMobile) return null

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      className="mr-2"
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  )
}