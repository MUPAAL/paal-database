"use client"
import { siteConfig } from "@/app/siteConfig"
import { useAuth } from "@/components/AuthProvider"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { LogoutButton } from "@/components/LogoutButton"
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
import { cx } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { BookText, House, Link, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"
import { UserProfile } from "./UserProfile"

// Define a type for navigation items to ensure consistency
type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  notifications?: boolean;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/overview",
    icon: House,
    notifications: false,
  },
  {
    name: "Pig Table",
    href: "/details",
    icon: House,
    notifications: false,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings,
    notifications: false,
    adminOnly: true,
  },
]

// Define a type for navigation items with children
type NavigationItemWithChildren = NavigationItem & {
  children?: Array<{
    name: string;
    href: string;
  }>;
}

const navigation2: NavigationItemWithChildren[] = [
  {
    name: "System Overview",
    href: siteConfig.baseLinks.systemOverview.farms,
    icon: BookText,
    notifications: false,
    children: [
      {
        name: "Farms",
        href: siteConfig.baseLinks.systemOverview.farms,
      },
      {
        name: "Monitoring",
        href: siteConfig.baseLinks.systemOverview.monitoring,
      },
      {
        name: "Insights",
        href: siteConfig.baseLinks.systemOverview.insights,
      },
    ],
  },
]

const navigation3: NavigationItem[] = [
  {
    name: "Insights",
    href: "http://localhost:8080/system-overview/insights",
    icon: Link,
    notifications: false,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  // Only run on client-side
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const [openMenus, setOpenMenus] = React.useState<string[]>([
    navigation2[0].name,
    navigation2[1]?.name,
  ])

  const isActive = React.useCallback((itemHref: string): boolean => {
    if (!mounted || !itemHref) return false
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
  }, [pathname, mounted])

  const toggleMenu = React.useCallback((name: string) => {
    setOpenMenus((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name)
      }
      return [...prev, name]
    })
  }, [])

  // Filter navigation items based on user role
  const filteredNavigation = React.useMemo(() => {
    return navigation.filter(item => {
      // If item is admin-only, only show it to admin users
      if ('adminOnly' in item && item.adminOnly) {
        return user?.role === 'admin'
      }
      return true
    })
  }, [user])

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
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
        <SidebarGroup className="my-4">
          <SidebarGroupContent title="System">
            <SidebarMenu>
              {navigation2.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isActive(item.href)}
                    icon={item.icon}
                    onClick={
                      item.children
                        ? (e) => {
                          e.preventDefault()
                          toggleMenu(item.name)
                        }
                        : undefined
                    }
                    suffix={
                      item.children ? (
                        <RiArrowDownSFill
                          className={cx(
                            "size-4 text-gray-500 transition-transform",
                            openMenus.includes(item.name) && "rotate-180",
                          )}
                        />
                      ) : null
                    }
                  >
                    {item.name}
                  </SidebarLink>
                  {item.children && (
                    <SidebarMenuSub
                      className={cx(
                        "overflow-hidden transition-all",
                        openMenus.includes(item.name)
                          ? "max-h-96"
                          : "max-h-0",
                      )}
                    >
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
        <div className="px-3 py-2">
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
