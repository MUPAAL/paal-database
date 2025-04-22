"use client"

import { Badge } from "@/components/Badge"
import { ProgressBar } from "@/components/ProgressBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/axios"
import { Activity, Heart, Scale, Thermometer } from "lucide-react"
import { useEffect, useState } from "react"

interface HealthStatusCardProps {
  pigId: number | undefined
}

interface HealthStatusData {
  status: string
  timestamp: string
  notes: string
  metrics: {
    temperature?: number
    respiratoryRate?: number
    weight?: number
  }
}

export function HealthStatusCard({ pigId }: HealthStatusCardProps) {
  const [data, setData] = useState<HealthStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!pigId) return

      try {
        setIsLoading(true)
        setError(null)

        const response = await api.get(`/pigs/${pigId}/health-status/latest`)
        setData(response.data)
      } catch (error) {
        console.error("Error fetching health status data:", error)
        setError("Failed to fetch health status data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pigId])

  // Helper function to get status variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "success"
      case "at risk":
        return "warning"
      case "critical":
        return "error"
      case "no movement":
        return "error"
      default:
        return "default"
    }
  }

  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "healthy":
        return "Healthy"
      case "at risk":
        return "At Risk"
      case "critical":
        return "Critical"
      case "no movement":
        return "No Movement"
      default:
        return "Unknown"
    }
  }

  // Helper function to calculate health score
  const calculateHealthScore = (status: string, metrics: any) => {
    // Base score based on status
    let score = 0
    switch (status) {
      case "healthy":
        score = 85
        break
      case "at risk":
        score = 60
        break
      case "critical":
        score = 30
        break
      case "no movement":
        score = 20
        break
      default:
        score = 50
    }

    // Adjust score based on metrics if available
    if (metrics) {
      // Temperature adjustment (normal range: 38-39.5°C)
      if (metrics.temperature) {
        const temp = metrics.temperature
        if (temp >= 38 && temp <= 39.5) {
          score += 5
        } else if (temp < 37.5 || temp > 40) {
          score -= 10
        } else {
          score -= 5
        }
      }

      // Respiratory rate adjustment (normal range: 15-25 bpm)
      if (metrics.respiratoryRate) {
        const rate = metrics.respiratoryRate
        if (rate >= 15 && rate <= 25) {
          score += 5
        } else if (rate > 30) {
          score -= 10
        } else {
          score -= 5
        }
      }
    }

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score))
  }

  // Calculate mobility score (simplified version)
  const calculateMobilityScore = (status: string) => {
    switch (status) {
      case "healthy":
        return 90
      case "at risk":
        return 70
      case "critical":
        return 40
      case "no movement":
        return 10
      default:
        return 50
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-[200px] flex-col items-center justify-center">
            <p className="text-red-500">{error || "No health status data available"}</p>
            <p className="text-sm text-gray-500 mt-2">Try adding a health record for this pig</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthScore = calculateHealthScore(data.status, data.metrics)
  const mobilityScore = calculateMobilityScore(data.status)
  const statusVariant = getStatusVariant(data.status)
  const statusLabel = getStatusLabel(data.status)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health Status
          </CardTitle>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Overall Health</span>
            <span className="text-gray-900 dark:text-gray-100">{healthScore}%</span>
          </div>
          <ProgressBar
            value={healthScore}
            color={
              healthScore >= 80 ? "emerald" :
                healthScore >= 60 ? "blue" :
                  healthScore >= 40 ? "amber" : "red"
            }
            className="[&>*]:h-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Mobility</span>
            <span className="text-gray-900 dark:text-gray-100">{mobilityScore}%</span>
          </div>
          <ProgressBar
            value={mobilityScore}
            color={
              mobilityScore >= 80 ? "emerald" :
                mobilityScore >= 60 ? "blue" :
                  mobilityScore >= 40 ? "amber" : "red"
            }
            className="[&>*]:h-2"
          />
        </div>

        {/* Metrics Section */}
        {data.metrics && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {data.metrics.temperature && (
              <div className="flex flex-col items-center rounded-md border border-gray-200 p-2 dark:border-gray-800">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="mt-1 text-xs text-gray-500">Temperature</span>
                <span className="font-medium">{data.metrics.temperature}°C</span>
              </div>
            )}

            {data.metrics.respiratoryRate && (
              <div className="flex flex-col items-center rounded-md border border-gray-200 p-2 dark:border-gray-800">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="mt-1 text-xs text-gray-500">Resp. Rate</span>
                <span className="font-medium">{data.metrics.respiratoryRate} bpm</span>
              </div>
            )}

            {data.metrics.weight && (
              <div className="flex flex-col items-center rounded-md border border-gray-200 p-2 dark:border-gray-800">
                <Scale className="h-4 w-4 text-green-500" />
                <span className="mt-1 text-xs text-gray-500">Weight</span>
                <span className="font-medium">{data.metrics.weight} kg</span>
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        {data.notes && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
              {data.notes}
            </p>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
