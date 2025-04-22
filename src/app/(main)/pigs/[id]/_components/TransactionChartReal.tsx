"use client"
import { BarChartVariant } from "@/components/BarChartVariantFull"
import { Tooltip } from "@/components/Tooltip"
import api from "@/lib/axios"
import { AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"
import { DEFAULT_RANGE, RANGE_DAYS, RangeKey } from "./dateRanges"

type ChartType = "amount" | "category"

interface ChartDataItem {
  key?: string
  value?: number
  date?: string
  [key: string]: number | string | undefined
}

interface ChartConfig {
  title: string
  tooltipContent: string
  color: AvailableChartColorsKeys
  valueFormatter: (value: number) => string
  xValueFormatter: (value: string) => string
  layout?: "vertical" | "horizontal"
}

export function TransactionChart({
  type,
  yAxisWidth,
  showYAxis,
  className,
  showPercentage = false,
}: {
  type: ChartType
  yAxisWidth?: number
  showYAxis?: boolean
  className?: string
  showPercentage?: boolean
}) {
  const params = useParams()
  const pigId = params.id
  const [range] = useQueryState<RangeKey>("range", {
    defaultValue: DEFAULT_RANGE,
    parse: (value): RangeKey =>
      Object.keys(RANGE_DAYS).includes(value)
        ? (value as RangeKey)
        : DEFAULT_RANGE,
  })

  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chartConfigs: Record<ChartType, ChartConfig> = {
    amount: {
      title: "Daily Posture Distribution",
      tooltipContent: "Distribution of posture values (1-5) recorded each day",
      color: "blue",
      valueFormatter: (number: number) => `${number}%`,
      xValueFormatter: (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      },
    },
    category: {
      title: "Posture by Category",
      tooltipContent: "Posture distribution by category",
      color: "blue",
      valueFormatter: (number: number) => number.toString(),
      xValueFormatter: (value: string) => value,
      layout: "vertical",
    },
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const days = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE]

        // Fetch aggregated posture data from the correct endpoint
        // Make sure we're using the full URL with the correct port
        const response = await api.get(`/pigs/${pigId}/posture/aggregated`)

        // Log the first few items for debugging
        console.log('Aggregated posture data sample:', JSON.stringify(response.data.slice(0, 3)))

        if (type === "amount") {
          // Process the aggregated data for the chart
          let processedData: ChartDataItem[] = response.data.map((dayData: any) => {
            // Create a chart data item with the date
            const chartItem: any = { date: dayData.date }

            // If showing percentages, use the pre-calculated percentages
            if (showPercentage) {
              // Add percentage values for each score
              for (let score = 1; score <= 5; score++) {
                chartItem[score.toString()] = dayData.percentages[score] || 0
              }
            } else {
              // Otherwise use the raw counts
              for (let score = 1; score <= 5; score++) {
                chartItem[score.toString()] = dayData.counts[score] || 0
              }
            }

            return chartItem as ChartDataItem
          })

          // Sort by date
          processedData.sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )

          setChartData(processedData)
        } else if (type === "category") {
          // For category chart, aggregate all data
          const categories = ["Standing", "Lying", "Sitting", "Moving", "Other"]
          const counts = { "Standing": 0, "Lying": 0, "Sitting": 0, "Moving": 0, "Other": 0 }

          // Sum up all counts across all days
          response.data.forEach((dayData: any) => {
            counts["Standing"] += dayData.counts[1] || 0
            counts["Lying"] += dayData.counts[2] || 0
            counts["Sitting"] += dayData.counts[3] || 0
            counts["Moving"] += dayData.counts[4] || 0
            counts["Other"] += dayData.counts[5] || 0
          })

          const categoryData: ChartDataItem[] = categories.map(category => ({
            key: category,
            value: counts[category as keyof typeof counts]
          })) as ChartDataItem[]

          setChartData(categoryData)
        }
      } catch (error) {
        console.error(`Error fetching posture data:`, error)
        setError(`Failed to fetch posture data`)
      } finally {
        setIsLoading(false)
      }
    }

    if (pigId) {
      fetchData()
    }
  }, [pigId, range, type, showPercentage])

  const config = chartConfigs[type]

  // Determine categories based on chart type
  const categories = useMemo(() => {
    if (type === "amount") {
      return ["1", "2", "3", "4", "5"]
    } else {
      return ["value"]
    }
  }, [type])

  // Determine colors based on chart type
  const colors = useMemo(() => {
    if (type === "amount") {
      return ["blue", "cyan", "indigo", "violet", "purple"]
    } else {
      return ["blue"]
    }
  }, [type])

  // If there's no data, show a message
  if (!isLoading && chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No posture data available</p>
      </div>
    )
  }

  return (
    <div className={cx(className, "w-full")}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <h2
            id={`${type}-chart-title`}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {config.title}
          </h2>
          <Tooltip side="bottom" content={config.tooltipContent}>
            <InfoIcon className="size-4 text-gray-600 dark:text-gray-400" />
          </Tooltip>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <BarChartVariant
          data={chartData}
          index={type === "amount" ? "date" : "key"}
          categories={categories}
          showLegend={type === "amount"}
          colors={colors as AvailableChartColorsKeys[]}
          yAxisWidth={yAxisWidth}
          valueFormatter={config.valueFormatter}
          xValueFormatter={config.xValueFormatter}
          showYAxis={showYAxis}
          className="m-4 h-64"
          layout={config.layout}
          barCategoryGap="6%"
          aria-labelledby={`${type}-chart-title`}
        />
      )}
    </div>
  )
}
