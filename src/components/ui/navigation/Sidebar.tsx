"use client"
import { siteConfig } from "@/app/siteConfig"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/Sidebar"
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { BookText, House, Link, PackageSearch } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"
import { UserProfile } from "./UserProfile"

const navigation = [
  {
    name: "Dashboard",
    href: "/overview",
    icon: House,
    notifications: false,
  },
  // {
  //   name: "Notifications",
  //   href: "",
  //   icon: PackageSearch,
  //   notifications: 5,
  // },
] as const

const navigation2 = [
  {
    name: "System Overview",
    href: siteConfig.baseLinks.details,
    icon: BookText,
    children: [
      {
        name: "Farms",
        href: siteConfig.baseLinks.systemOverview.farms,
      },
      {
        name: "Monitering",
        href: siteConfig.baseLinks.systemOverview.monitoring,
      },
      {
        name: "Device Insights",
        href: siteConfig.baseLinks.systemOverview.insights,
      },
    ],
  },
  {
    name: "Tables",
    href: siteConfig.baseLinks.details,
    icon: PackageSearch,
    children: [
      {
        name: "Pigs",
        href: siteConfig.baseLinks.details,
      },
    ],
  },
] as const

// navigation for sidebar element with shortcuts
const navigation3 = [
  {
    name: "PAAL Landing Page",
    href: "https://cafnrfaculty.missouri.edu/mupaa/",
    icon: Link,
    notifications: false,
  },
  {
    name: "System Documentation",
    href: "https://github.com/brodynelly/paal/wiki",
    icon: Link,
    notifications: false,
  },
  {
    name: "Device Table",
    href: "http://localhost:8080/system-overview/insights",
    icon: Link,
    notifications: false,
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = React.useState<string[]>([
    navigation2[0].name,
    navigation2[1].name,
  ])
  const isActive = React.useCallback((itemHref: string): boolean => {
    if (!itemHref) return false

    if (itemHref === siteConfig.baseLinks.settings?.general) {
      return pathname.startsWith("/settings")
    }

    return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
  }, [pathname])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev: string[]) =>
      prev.includes(name)
        ? prev.filter((item: string) => item !== name)
        : [...prev, name],
    )
  }
  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925 justify-center">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            {/* <Logo className="size-6 text-blue-500 dark:text-blue-500" /> */}
          </span>
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
              PAALABS
            </span>
            <span className="block text-xs text-gray-900 dark:text-gray-50">
              PAAL @ MIZZOU
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input
              type="search"
              placeholder="Search items..."
              className="[&>input]:sm:py-1.5"
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isActive(item.href)}
                    icon={item.icon}
                    notifications={item.notifications}

                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {navigation2.map((item) => (
                <SidebarMenuItem key={item.name}>
                  {/* @CHRIS/SEV: discussion whether to componentize (-> state mgmt) */}
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cx(
                      "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base text-gray-900 transition hover:bg-gray-200/50 sm:text-sm dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                      focusRing,
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className="size-[18px] shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                    <RiArrowDownSFill
                      className={cx(
                        openMenus.includes(item.name)
                          ? "rotate-0"
                          : "-rotate-90",
                        "size-5 shrink-0 transform text-gray-400 transition-transform duration-150 ease-in-out dark:text-gray-600",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {item.children && openMenus.includes(item.name) && (
                    <SidebarMenuSub>
                      <div className="absolute inset-y-0 left-4 w-px bg-gray-300 dark:bg-gray-800" />
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.name}>
                          <SidebarSubLink
                            href={child.href}
                            isActive={isActive(child.href)}
                          >
                            {child.name}
                          </SidebarSubLink>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup className="my-4">
          <SidebarGroupContent title="Shortcuts">
            <SidebarMenu className="">
              {navigation3.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isActive(item.href)}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}