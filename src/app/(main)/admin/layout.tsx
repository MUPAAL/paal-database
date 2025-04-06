"use client"

import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/users" },
  { name: "Farms", href: "/admin/farms" },
  { name: "System", href: "/admin/system" },
]

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is admin
  useEffect(() => {
    const user = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!user || !token) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(user)
      if (userData.role !== "admin") {
        router.push("/overview")
        return
      }
      setIsAdmin(true)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Admin Dashboard
        </h1>
        <div className="mt-6">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Admin Dashboard
      </h1>
      <TabNavigation className="mt-4 sm:mt-6 lg:mt-10">
        {adminNavigation.map((item) => (
          <TabNavigationLink
            key={item.name}
            asChild
            active={
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            }
          >
            <Link href={item.href}>{item.name}</Link>
          </TabNavigationLink>
        ))}
      </TabNavigation>
      <div className="pt-6">{children}</div>
    </div>
  )
}
