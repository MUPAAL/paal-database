"use client"

import { siteConfig } from "@/app/siteConfig"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface BreadcrumbItem {
    label: string
    href: string
    current?: boolean
}

export function Breadcrumbs() {
    const pathname = usePathname()

    const breadcrumbs = useMemo(() => {
        // Always start with Home
        const items: BreadcrumbItem[] = [
            { label: "Home", href: siteConfig.baseLinks.home }
        ]

        // Skip processing if we're on the home page
        if (pathname === "/" || pathname === "") {
            return items
        }

        // Split the pathname into segments
        const segments = pathname.split("/").filter(Boolean)

        // Map known routes to their proper names
        const routeMap: Record<string, string> = {
            "overview": "Overview",
            "details": "Details",
            "support": "Support",
            "settings": "Settings",
            "general": "General",
            "devices": "Devices",
            "alerts": "Alerts",
            "system-overview": "System Overview",
            "monitoring": "Monitoring",
            "insights": "Insights",
            "pigs": "Pigs",
            "admin": "Admin",
            "farms": "Farms",
            "barns": "Barns",
            "stalls": "Stalls",
            "users": "Users",
            "health": "Health"
        }

        // Build up the breadcrumb path
        let currentPath = ""

        segments.forEach((segment, index) => {
            currentPath += `/${segment}`

            // Check if this is a dynamic segment (starts with [)
            if (segment.startsWith("[") && segment.endsWith("]")) {
                // For dynamic routes like [id], we'll use a generic label
                // In a real app, you might fetch the actual entity name
                const paramName = segment.slice(1, -1) // Remove the brackets
                items.push({
                    label: paramName.charAt(0).toUpperCase() + paramName.slice(1),
                    href: currentPath,
                    current: index === segments.length - 1
                })
            } else {
                // Use the mapped name or capitalize the segment
                const label = routeMap[segment] ||
                    (segment.charAt(0).toUpperCase() + segment.slice(1))

                items.push({
                    label,
                    href: currentPath,
                    current: index === segments.length - 1
                })
            }
        })

        return items
    }, [pathname])

    return (
        <>
            <nav aria-label="Breadcrumb" className="ml-2">
                <ol role="list" className="flex items-center space-x-3 text-sm">
                    {breadcrumbs.map((breadcrumb, index) => (
                        <li key={breadcrumb.href} className="flex">
                            {index > 0 && (
                                <ChevronRight
                                    className="mx-2 size-4 shrink-0 text-gray-600 dark:text-gray-400"
                                    aria-hidden="true"
                                />
                            )}
                            <div className="flex items-center">
                                <Link
                                    href={breadcrumb.href}
                                    aria-current={breadcrumb.current ? 'page' : undefined}
                                    className={breadcrumb.current
                                        ? "text-gray-900 dark:text-gray-50 font-medium"
                                        : "text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"}
                                >
                                    {breadcrumb.label}
                                </Link>
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    )
}