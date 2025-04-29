"use client"
import { BarChartVariant } from "@/components/BarChartVariantFull"
import { Tooltip } from "@/components/Tooltip"
import { AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { DateRangeSelectorSimple } from "./DateRangeSelectorSimple"

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
  const searchParams = useSearchParams()
  const pigId = params.id

  // Get date range from URL params
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")

  // State for posture data
  const [postureData, setPostureData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false);

  // Reset the dataFetchedRef when the date range changes
  useEffect(() => {
    dataFetchedRef.current = false;
  }, [startParam, endParam]);

  // Fetch posture data
  useEffect(() => {
    // Skip fetching if we've already fetched data and nothing has changed
    if (dataFetchedRef.current && postureData && postureData.length > 0) {
      return;
    }

    const fetchPostureData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Create URL parameters for date filtering
        const params = new URLSearchParams()

        if (startParam) {
          params.append('start', startParam)
        }

        if (endParam) {
          params.append('end', endParam)
        }

        const queryString = params.toString()
        // Use the direct endpoint for the aggregated posture data
        const url = `http://localhost:8080/api/pigs/${pigId}/posture/aggregated${queryString ? `?${queryString}` : ''}`
        console.log('Fetching posture data with URL:', url)

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Extract the data and date range from the response
        let filteredData = Array.isArray(data) ? data : (data.data || [])

        // Store the available date range
        if (data.dateRange) {
          // Also store in global variable for backward compatibility
          window.pigPostureDateRange = data.dateRange
        }

        // Check if we have any data
        if (filteredData.length === 0) {
          console.log('No posture data available for this pig')
          setError('No posture data available for this pig in the specified date range')
        } else {
          setPostureData(filteredData)
        }

        dataFetchedRef.current = true;
      } catch (error) {
        console.error(`Error fetching posture data:`, error)
        setError(`Failed to fetch posture data`)
      } finally {
        setIsLoading(false)
      }
    }

    if (pigId) {
      fetchPostureData()
    }
  }, [pigId, startParam, endParam])

  const chartConfigs: Record<ChartType, ChartConfig> = {
    amount: {
      title: "Daily Posture Distribution",
      tooltipContent: "Distribution of posture types recorded each day",
      color: "emerald",
      valueFormatter: (number: number) => `${number.toFixed(2)}%`,
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
      valueFormatter: (number: number) => number.toFixed(2),
      xValueFormatter: (value: string) => value,
      layout: "vertical",
    },
  }

  // Process the data for the chart
  const chartData = useMemo(() => {
    if (!postureData || postureData.length === 0) {
      return []
    }

    if (type === "amount") {
      // Process the aggregated data for the chart
      let processedData: ChartDataItem[] = postureData.map((dayData: any) => {
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

      return processedData
    } else if (type === "category") {
      // For category chart, aggregate all data
      const categories = ["Standing", "Lying", "Sitting", "Moving", "Other"]
      const counts = { "Standing": 0, "Lying": 0, "Sitting": 0, "Moving": 0, "Other": 0 }

      // Sum up all counts across all days
      postureData.forEach((dayData: any) => {
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

      return categoryData
    }

    return []
  }, [postureData, type, showPercentage])

  const config = chartConfigs[type]

  // Define posture category labels
  const postureCategoryLabels = {
    "1": "Standing",
    "2": "Lying",
    "3": "Sitting",
    "4": "Moving",
    "5": "Other"
  }

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
      // More visually appealing color palette for posture data
      return ["emerald", "amber", "blue", "violet", "pink"]
    } else {
      return ["emerald"]
    }
  }, [type])

  // If there's no data, show a message
  if (!isLoading && (!chartData || chartData.length === 0)) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No posture data available</p>
      </div>
    )
  }

  return (
    <div className={cx(className, "w-full")}>
      <div className="flex items-center justify-between mb-4">
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
        {type === "amount" && (
          <div className="flex-shrink-0">
            <DateRangeSelectorSimple />
          </div>
        )}
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
          customTooltip={(props) => {
            if (!props.active || !props.payload?.length) return null;

            return (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-2 font-medium">{props.label}</p>
                {props.payload.map((entry: any, index) => {
                  const categoryKey = entry.dataKey as string;
                  const categoryLabel = type === "amount" ?
                    (postureCategoryLabels as any)[categoryKey] || categoryKey :
                    categoryKey;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{categoryLabel}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}{showPercentage ? '%' : ''}</span>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
      )}
    </div>
  )
}
