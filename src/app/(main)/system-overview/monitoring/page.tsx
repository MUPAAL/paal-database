"use client"
import { BarChart } from "@/components/BarChart"
import { Button } from "@/components/Button"
import { ComboChart } from "@/components/ComboChart"
import { ConditionalBarChart } from "@/components/ConditionalBarChart"
import {
    CustomTooltip,
    CustomTooltip2,
    CustomTooltip4
} from "@/components/CustomToolTips"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/Select"
import api from "@/lib/axios"
import { formatters } from "@/lib/utils"
import { SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"

interface ChartData {
    name: string
    [key: string]: string | number
}

export default function Monitoring() {
    const [dataFilter, setDataFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [farmDistribution, setFarmDistribution] = useState<ChartData[]>([])
    const [barnCapacity, setBarnCapacity] = useState<ChartData[]>([])
    const [stallHealth, setStallHealth] = useState<ChartData[]>([])
    const [pigData, setPigData] = useState<ChartData[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch all data
                const responses = await Promise.allSettled([
                    api.get('/farms/distribution', { params: { filter: dataFilter } }),
                    api.get('/barns/capacity', { params: { filter: dataFilter } }),
                    api.get('/stalls/health', { params: { filter: dataFilter } }),
                    api.get('/pigs/overview', { params: { filter: dataFilter } })
                ])

                // Process each response
                const [farmRes, barnRes, stallRes, pigRes] = responses

                // Handle farm data
                if (farmRes.status === 'fulfilled' && farmRes.value.data) {
                    setFarmDistribution(transformFarmData(farmRes.value.data))
                } else if (farmRes.status === 'rejected') {
                    console.warn('Failed to load farm data', farmRes.reason)
                    setFarmDistribution([])
                }

                // Handle barn data
                if (barnRes.status === 'fulfilled' && barnRes.value.data) {
                    setBarnCapacity(transformBarnData(barnRes.value.data))
                } else if (barnRes.status === 'rejected') {
                    console.warn('Failed to load barn data', barnRes.reason)
                    setBarnCapacity([])
                }

                // Handle stall data
                if (stallRes.status === 'fulfilled' && stallRes.value.data) {
                    setStallHealth(transformStallData(stallRes.value.data))
                } else if (stallRes.status === 'rejected') {
                    console.warn('Failed to load stall data', stallRes.reason)
                    setStallHealth([])
                } else {
                    setStallHealth([])
                }

                // Handle pig data
                if (pigRes.status === 'fulfilled') {
                    if (pigRes.value.data) {
                        setPigData(transformPigData(pigRes.value.data))
                    } else {
                        console.warn('No pig data received')
                        setPigData([])
                    }
                } else {
                    console.warn('Failed to load pig data', pigRes.reason)
                    setPigData([])
                }

            } catch (err) {
                console.error('Error in fetchData:', err)
                setError('Failed to load monitoring data')
                setFarmDistribution([])
                setBarnCapacity([])
                setStallHealth([])
                setPigData([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [dataFilter])

    // Safer data transformation functions
    const transformFarmData = (data: any): ChartData[] => {
        if (!Array.isArray(data)) return []
        return data.map(item => ({
            name: item.name || 'Unknown',
            percentage: item.percentage || 0,
            pigCount: item.pigCount || 0
        }))
    }

    const transformBarnData = (data: any): ChartData[] => {
        if (!Array.isArray(data)) return []
        return data.map(item => ({
            name: item.name || 'Unknown',
            Current: item.current || 0,
            Capacity: item.capacity || 0,
            utilization: item.utilization || 0
        }))
    }

    const transformStallData = (data: any): ChartData[] => {
        if (!Array.isArray(data)) return []
        return data.map(item => ({
            name: item.name || 'Unknown',
            Healthy: item.healthy || 0,
            Unhealthy: item.unhealthy || 0
        }))
    }

    const transformPigData = (data: any): ChartData[] => {
        if (!Array.isArray(data)) return []
        return data.map(item => ({
            name: item.category || 'Unknown',
            Population: item.count || 0,
            Breeding: item.breedingCount || 0
        }))
    }

    if (loading) return <div className="p-6">Loading farm monitoring data...</div>
    if (error) return <div className="p-6 text-red-500">{error}</div>
    return (
        <section aria-label="Farm Monitoring Dashboard">
            <div className="flex flex-col items-center justify-between gap-2 p-6 sm:flex-row">
                <Select value={dataFilter} onValueChange={setDataFilter}>
                    <SelectTrigger className="py-1.5 sm:w-44">
                        <SelectValue placeholder="Data filter..." />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">All Data</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="region1">Region 1</SelectItem>
                        <SelectItem value="region2">Region 2</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="secondary"
                    className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
                >
                    <SlidersHorizontal
                        className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
                        aria-hidden="true"
                    />
                    Report Filters
                </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-14 gap-y-10 border-t border-gray-200 p-6 md:grid-cols-2 dark:border-gray-800">
                {/* Barn Capacity Utilization */}
                <div className="flex flex-col justify-between">
                    <div>
                        <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            Barn Capacity Utilization
                        </dt>
                        <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
                            Current capacity vs maximum capacity per barn
                        </dd>
                    </div>
                    {barnCapacity.length > 0 ? (
                        <>
                            <BarChart
                                data={barnCapacity}
                                index="name"
                                categories={["Current", "Capacity"]}
                                colors={["blue", "indigo"]}
                                yAxisWidth={45}
                                customTooltip={CustomTooltip}
                                yAxisLabel="Number of pigs"
                                barCategoryGap="20%"
                                valueFormatter={(value) => formatters.unit(value)}
                                className="mt-4 hidden h-60 md:block"
                            />
                            <BarChart
                                data={barnCapacity}
                                index="name"
                                categories={["Current", "Capacity"]}
                                colors={["blue", "indigo"]}
                                showYAxis={false}
                                customTooltip={CustomTooltip}
                                barCategoryGap="20%"
                                className="mt-4 h-60 md:hidden"
                            />
                        </>
                    ) : (
                        <div className="mt-4 h-60 flex items-center justify-center text-gray-500">
                            No barn capacity data available
                        </div>
                    )}
                </div>

                {/* Stall Health Status */}
                <div className="flex flex-col justify-between">
                    <div>
                        <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            Stall Health Status
                        </dt>
                        <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
                            Health status distribution across all stalls
                        </dd>
                    </div>
                    {stallHealth.length > 0 ? (
                        <>
                            <ComboChart
                                data={stallHealth}
                                index="name"
                                enableBiaxial={true}
                                barSeries={{
                                    categories: ["Healthy"],
                                    yAxisLabel: "Number of pigs",
                                    valueFormatter: (value) => formatters.unit(value),
                                }}
                                lineSeries={{
                                    categories: ["Unhealthy"],
                                    colors: ["indigo"],
                                    showYAxis: false,
                                }}
                                customTooltip={CustomTooltip2}
                                className="mt-4 hidden h-60 md:block"
                            />
                            <ComboChart
                                data={stallHealth}
                                index="name"
                                enableBiaxial={true}
                                barSeries={{
                                    categories: ["Healthy"],
                                    showYAxis: false,
                                }}
                                lineSeries={{
                                    categories: ["Unhealthy"],
                                    colors: ["blue"],
                                    showYAxis: false,
                                }}
                                customTooltip={CustomTooltip2}
                                className="mt-4 h-60 md:hidden"
                            />
                        </>
                    ) : (
                        <div className="mt-4 h-60 flex items-center justify-center text-gray-500">
                            No stall health data available
                        </div>
                    )}
                </div>

                {/* Pig Data Overview */}
                <div className="flex flex-col justify-between">
                    <div>
                        <dt className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            Pig Data Overview
                        </dt>
                        <dd className="mt-0.5 text-sm/6 text-gray-500 dark:text-gray-500">
                            Current pig population and breeding status
                        </dd>
                    </div>
                    {pigData.length > 0 ? (
                        <>
                            <ConditionalBarChart
                                data={pigData}
                                index="name"
                                categories={["Population", "Breeding"]}
                                colors={["emerald", "amber"]}
                                customTooltip={CustomTooltip4}
                                valueFormatter={(value) => formatters.unit(value)}
                                yAxisWidth={55}
                                yAxisLabel="Number of pigs"
                                barCategoryGap="30%"
                                className="mt-4 hidden h-60 md:block"
                            />
                            <ConditionalBarChart
                                data={pigData}
                                index="name"
                                categories={["Population", "Breeding"]}
                                colors={["emerald", "amber"]}
                                customTooltip={CustomTooltip4}
                                valueFormatter={(value) => formatters.unit(value)}
                                showYAxis={false}
                                barCategoryGap="30%"
                                className="mt-4 h-60 md:hidden"
                            />
                        </>
                    ) : (
                        <div className="mt-4 h-60 flex items-center justify-center text-gray-500">
                            No pig data available
                        </div>
                    )}
                </div>
            </dl>
        </section>
    )
}