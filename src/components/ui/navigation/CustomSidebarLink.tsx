"use client"

import { SidebarLink } from "@/components/Sidebar"
import { cx } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import * as React from "react"

// Create a custom SidebarLink component that supports the suffix property
export const CustomSidebarLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof SidebarLink> & {
    suffix?: React.ReactNode
  }
>(({ children, isActive, icon, notifications, suffix, className, ...props }, ref) => {
  return (
    <SidebarLink
      ref={ref}
      isActive={isActive}
      icon={icon}
      notifications={notifications}
      className={className}
      {...props}
    >
      {children}
      {suffix}
    </SidebarLink>
  )
})

CustomSidebarLink.displayName = "CustomSidebarLink"

// Create a dropdown arrow component for the sidebar
export const SidebarDropdownArrow = ({ isOpen }: { isOpen: boolean }) => (
  <RiArrowDownSFill
    className={cx(
      "size-4 text-gray-500 transition-transform",
      isOpen && "rotate-180",
    )}
  />
)
