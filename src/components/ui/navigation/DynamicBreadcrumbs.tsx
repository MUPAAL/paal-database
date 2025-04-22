"use client"

import { siteConfig } from "@/app/siteConfig"
import api from "@/lib/axios"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

interface BreadcrumbItem {
    label: string
    href: string
    current?: boolean
}

interface EntityInfo {
    id: string
    name?: string
    tag?: string
}

export function DynamicBreadcrumbs() {
    const pathname = usePathname()
    const [entityInfo, setEntityInfo] = useState<Record<string, EntityInfo>>({})
    const [isLoading, setIsLoading] = useState(false)

    // Extract dynamic IDs from the pathname
    const dynamicIds = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean)
        const ids: Record<string, string> = {}

        segments.forEach((segment, index) => {
            // Check if this is a numeric segment after a known entity type
            if (!isNaN(Number(segment))) {
                const prevSegment = segments[index - 1]
                if (prevSegment) {
                    ids[prevSegment] = segment
                }
            }
        })

        return ids
    }, [pathname])

    // Fetch entity information for dynamic segments
    useEffect(() => {
        const fetchEntityInfo = async () => {
            setIsLoading(true)
            const newEntityInfo: Record<string, EntityInfo> = {}

            try {
                // Fetch pig information if we have a pig ID
                if (dynamicIds.pigs) {
                    try {
                        const response = await api.get(`/pigs/${dynamicIds.pigs}`)
                        if (response.data) {
                            newEntityInfo.pigs = {
                                id: dynamicIds.pigs,
                                name: `Pig #${response.data.pigId}`,
                                tag: response.data.tag
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching pig info:", error)
                        // Fallback to generic name
                        newEntityInfo.pigs = {
                            id: dynamicIds.pigs,
                            name: `Pig ${dynamicIds.pigs}`
                        }
                    }
                }

                // Add similar blocks for other entity types (farms, barns, etc.)
                // For example:
                if (dynamicIds.farms) {
                    try {
                        const response = await api.get(`/farms/${dynamicIds.farms}`)
                        if (response.data) {
                            newEntityInfo.farms = {
                                id: dynamicIds.farms,
                                name: response.data.name
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching farm info:", error)
                        newEntityInfo.farms = {
                            id: dynamicIds.farms,
                            name: `Farm ${dynamicIds.farms}`
                        }
                    }
                }

                setEntityInfo(newEntityInfo)
            } catch (error) {
                console.error("Error fetching entity info:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (Object.keys(dynamicIds).length > 0) {
            fetchEntityInfo()
        }
    }, [dynamicIds])

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
            
            // Check if this is a dynamic segment (numeric ID)
            if (!isNaN(Number(segment))) {
                const prevSegment = segments[index - 1]
                
                if (prevSegment && entityInfo[prevSegment]) {
                    // Use the fetched entity name if available
                    items.push({
                        label: entityInfo[prevSegment].name || `${prevSegment.charAt(0).toUpperCase() + prevSegment.slice(1)} ${segment}`,
                        href: currentPath,
                        current: index === segments.length - 1
                    })
                } else {
                    // Generic label for numeric IDs without entity info
                    items.push({
                        label: `ID: ${segment}`,
                        href: currentPath,
                        current: index === segments.length - 1
                    })
                }
            } 
            // Check if this is a dynamic segment with brackets
            else if (segment.startsWith("[") && segment.endsWith("]")) {
                const paramName = segment.slice(1, -1) // Remove the brackets
                items.push({
                    label: paramName.charAt(0).toUpperCase() + paramName.slice(1),
                    href: currentPath,
                    current: index === segments.length - 1
                })
            } 
            // Regular segment
            else {
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
    }, [pathname, entityInfo])

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
