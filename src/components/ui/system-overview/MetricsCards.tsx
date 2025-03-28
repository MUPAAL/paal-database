"use client"
import axios from "axios"
import { useEffect, useState } from "react"

type Category = "red" | "orange" | "emerald" | "gray"

type Metric = {
    label: string
    value: number
    percentage: string
    fraction: string
}

const getCategory = (value: number): Category => {
    if (value < 0.3) return "red"
    if (value < 0.7) return "orange"
    return "emerald"
}

const categoryConfig = {
    red: {
        activeClass: "bg-red-500 dark:bg-red-500",
        bars: 1,
    },
    orange: {
        activeClass: "bg-orange-500 dark:bg-orange-500",
        bars: 2,
    },
    emerald: {
        activeClass: "bg-emerald-500 dark:bg-emerald-500",
        bars: 3,
    },
    gray: {
        activeClass: "bg-gray-300 dark:bg-gray-800",
        bars: 0,
    },
} as const

function Indicator({ number }: { number: number }) {
    const category = getCategory(number)
    const config = categoryConfig[category]
    const inactiveClass = "bg-gray-300 dark:bg-gray-800"

    return (
        <div className="flex gap-0.5">
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={`h-3.5 w-1 rounded-sm ${index < config.bars ? config.activeClass : inactiveClass
                        }`}
                />
            ))}
        </div>
    )
}

function MetricCard({ metric }: { metric: Metric }) {
    return (
        <div>
            <dt className="text-sm text-gray-500 dark:text-gray-500">
                {metric.label}
            </dt>
            <dd className="mt-1.5 flex items-center gap-2">
                <Indicator number={metric.value} />
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {metric.percentage}{" "}
                    <span className="font-medium text-gray-400 dark:text-gray-600">
                        - {metric.fraction}
                    </span>
                </p>
            </dd>
        </div>
    )
}

export function MetricsCards() {
    const [metrics, setMetrics] = useState<Metric[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const { data } = await axios.get("/api/stats") // or your actual backend route

                const totalFarms = data.farmBarnStallStats.totalFarms || 0
                const totalBarns = data.farmBarnStallStats.totalBarns || 0
                const totalStalls = data.farmBarnStallStats.totalStalls || 0

                const barnStats = (data.barnStats || {}) as Record<string, number>
                const stallStats = data.stallStats || {}
                
                const activeBarns = Object.values(barnStats).filter((count: number) => count > 0).length
                
                let activeStalls = 0
                const typedStallStats = stallStats as Record<string, Record<string, number>>
                Object.values(typedStallStats).forEach((stalls) => {
                    Object.values(stalls).forEach((count) => {
                        if (count > 0) activeStalls++
                    })
                })

                // Optional: If supporting multiple farms, calculate active farms properly.
                const activeFarms = activeBarns > 0 ? 1 : 0 // Adjust later if needed

                const computedMetrics: Metric[] = [
                    {
                        label: "Farms Active",
                        value: totalFarms ? activeFarms / totalFarms : 0,
                        percentage: totalFarms ? `${Math.round((activeFarms / totalFarms) * 100)}%` : "0%",
                        fraction: `${activeFarms}/${totalFarms}`,
                    },
                    {
                        label: "Barns Active",
                        value: totalBarns ? activeBarns / totalBarns : 0,
                        percentage: totalBarns ? `${Math.round((activeBarns / totalBarns) * 100)}%` : "0%",
                        fraction: `${activeBarns}/${totalBarns}`,
                    },
                    {
                        label: "Stalls Active",
                        value: totalStalls ? activeStalls / totalStalls : 0,
                        percentage: totalStalls ? `${Math.round((activeStalls / totalStalls) * 100)}%` : "0%",
                        fraction: `${activeStalls}/${totalStalls}`,
                    },
                ]

                setMetrics(computedMetrics)
            } catch (error) {
                console.error("🐛 Error fetching metrics:", error)
                setMetrics([
                    {
                        label: "Farms Active",
                        value: 0,
                        percentage: "0%",
                        fraction: "0/0",
                    },
                    {
                        label: "Barns Active",
                        value: 0,
                        percentage: "0%",
                        fraction: "0/0",
                    },
                    {
                        label: "Stalls Active",
                        value: 0,
                        percentage: "0%",
                        fraction: "0/0",
                    },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    if (loading) return <p className="text-sm text-gray-500">Loading metrics...</p>

    return (
        <>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Overview
            </h1>
            <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
                {metrics.map((metric) => (
                    <MetricCard key={metric.label} metric={metric} />
                ))}
            </dl>
        </>
    )
}
