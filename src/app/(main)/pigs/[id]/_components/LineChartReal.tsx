"use client"
import { LineChart as ExternalLineChart } from "@/components/LineChart"
import api from "@/lib/axios"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { DEFAULT_RANGE, RANGE_DAYS, RangeKey } from "./dateRanges"

interface LineChartProps {
  type: "bcs" | "vulva" | "breathing"
  yAxisWidth?: number
  showYAxis?: boolean
  className?: string
}

interface DataPoint {
  date: string
  value: number
}

export function LineChart({
  type,
  yAxisWidth,
  showYAxis,
  className,
}: LineChartProps) {
  const params = useParams()
  const pigId = params.id
  const [range] = useQueryState<RangeKey>("range", {
    defaultValue: DEFAULT_RANGE,
    parse: (value): RangeKey =>
      Object.keys(RANGE_DAYS).includes(value)
        ? (value as RangeKey)
        : DEFAULT_RANGE,
  })
  const [data, setData] = useState<DataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const days = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE]
        
        let endpoint = ""
        switch (type) {
          case "bcs":
            endpoint = `/pigs/${pigId}/bcs`
            break
          case "breathing":
            endpoint = `/pigs/${pigId}/breath-rate`
            break
          case "vulva":
            endpoint = `/pigs/${pigId}/vulva-swelling`
            break
        }
        
        const response = await api.get(endpoint)
        
        // Transform the data into the format expected by the chart
        const formattedData = response.data.map((item: any) => ({
          date: new Date(item.timestamp).toISOString().split('T')[0],
          value: type === "bcs" ? item.score : 
                 type === "breathing" ? item.rate : 
                 type === "vulva" ? (item.value === "low" ? 1 : item.value === "moderate" ? 2 : 3) : 0
        }))
        
        // Sort by date
        formattedData.sort((a: DataPoint, b: DataPoint) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        
        setData(formattedData)
      } catch (error) {
        console.error(`Error fetching ${type} data:`, error)
        setError(`Failed to fetch ${type} data`)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (pigId) {
      fetchData()
    }
  }, [pigId, range, type])

  const valueFormatter = (value: number) => {
    switch (type) {
      case "bcs":
        return value.toFixed(1)
      case "vulva":
        return value === 1 ? "Low" : value === 2 ? "Moderate" : "High"
      case "breathing":
        return `${value.toFixed(1)} bpm`
      default:
        return value.toString()
    }
  }

  const chartTitle = {
    bcs: "Body Condition Score",
    vulva: "Vulva Swelling",
    breathing: "Breathing Rate"
  }[type]

  // If there's no data, show a message
  if (!isLoading && data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No {chartTitle.toLowerCase()} data available</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <ExternalLineChart
          data={data}
          index="date"
          categories={["value"]}
          colors={["blue"]}
          valueFormatter={valueFormatter}
          yAxisWidth={yAxisWidth}
          showYAxis={showYAxis}
          showLegend={false}
          showGridLines={false}
          startEndOnly={false}
          showTooltip={true}
          autoMinValue={true}
          allowDecimals={false}
          enableLegendSlider={true}
          xAxisLabel="Date"
          yAxisLabel={chartTitle}
        />
      )}
    </div>
  )
}
