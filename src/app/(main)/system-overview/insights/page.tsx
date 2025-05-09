"use client"

import { DataTable } from "@/components/ui/data-table-support/DataTable"
import { columns } from "@/components/ui/data-table-support/columns"
import { subscribeToDevices } from "@/lib/socket"
import { RiCheckboxCircleFill, RiErrorWarningFill } from "@remixicon/react"
import { useEffect, useState } from "react"

const getStatusIcon = (status: string) => {
    if (status === "complete") {
        return (
            <RiCheckboxCircleFill className="size-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />
        )
    }
    return (
        <RiErrorWarningFill className="size-[18px] shrink-0 text-red-600 dark:text-red-400" />
    )
}

export default function Audits() {
    const [devices, setDevices] = useState([])
    interface DeviceMetrics {
        totalDevices: number;
        deviceStatus: { status: string; percentage: number; count: number }[];
        performance: {
            runtimeExpected: number;
            criticalCondition: number;
        };
        volumeTrends: {
            today: number;
            yesterday: number;
        };
    }

    const updateMetrics = (deviceData: any[]) => {
        const totalDevices = deviceData.length
        const onlineDevices = deviceData.filter(d => d.status === 'online').length
        const warningDevices = deviceData.filter(d => d.status === 'warning').length
        const offlineDevices = deviceData.filter(d => d.status === 'offline').length

        setDeviceMetrics({
            totalDevices,
            deviceStatus: [
                { status: "Devices Up", percentage: (onlineDevices / totalDevices) * 100, count: onlineDevices },
                { status: "Device Maintenance", percentage: (warningDevices / totalDevices) * 100, count: warningDevices },
                { status: "Down", percentage: (offlineDevices / totalDevices) * 100, count: offlineDevices }
            ],
            performance: {
                runtimeExpected: 92.5,
                criticalCondition: 7.5
            },
            volumeTrends: {
                today: 1850,
                yesterday: 1600
            }
        })
    }


    const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics>({
        totalDevices: 0,
        deviceStatus: [],
        performance: {
            runtimeExpected: 0,
            criticalCondition: 0
        },
        volumeTrends: {
            today: 0,
            yesterday: 0
        }
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch('/api/devices')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                setDevices(data)
                updateMetrics(data)
                setIsLoading(false)
            } catch (error) {
                console.error('Error fetching device data:', error)
                setError('Failed to fetch device data')
                setIsLoading(false)
            }
        }

        fetchInitialData()
    }, [])

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToDevices((data) => {
            setDevices(data)
            updateMetrics(data)
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <section aria-label="Audits overview">

                <DataTable data={devices} columns={columns} />

        </section>
    )
}