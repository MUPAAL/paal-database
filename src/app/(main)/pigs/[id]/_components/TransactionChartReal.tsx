"use client"
import { BarChartVariant } from "@/components/BarChartVariantFull"
import { Tooltip } from "@/components/Tooltip"
import api from "@/lib/axios"
import { AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
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
        
        // Fetch posture data
        const response = await api.get(`/pigs/${pigId}/posture`)
        
        if (type === "amount") {
          // Group data by date
          const groupedByDate = response.data.reduce((acc: any, item: any) => {
            const date = new Date(item.timestamp).toISOString().split('T')[0]
            if (!acc[date]) {
              acc[date] = { date, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
            }
            
            // Increment the count for this posture score
            const score = item.score.toString()
            acc[date][score] = (acc[date][score] || 0) + 1
            
            return acc
          }, {})
          
          // Convert to array and sort by date
          let processedData = Object.values(groupedByDate)
          processedData.sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          
          // If showing percentages, convert counts to percentages
          if (showPercentage) {
            processedData = processedData.map((day: any) => {
              const total = [1, 2, 3, 4, 5].reduce((sum, score) => 
                sum + (day[score.toString()] || 0), 0
              )
              
              const percentages: any = { date: day.date }
              for (let score = 1; score <= 5; score++) {
                const scoreStr = score.toString()
                percentages[scoreStr] = total > 0 
                  ? ((day[scoreStr] || 0) / total) * 100 
                  : 0
              }
              
              return percentages
            })
          }
          
          setChartData(processedData)
        } else if (type === "category") {
          // For category chart, group by posture category
          const categories = ["Standing", "Lying", "Sitting", "Moving", "Other"]
          const counts = { "Standing": 0, "Lying": 0, "Sitting": 0, "Moving": 0, "Other": 0 }
          
          response.data.forEach((item: any) => {
            const score = item.score
            if (score === 1) counts["Standing"]++
            else if (score === 2) counts["Lying"]++
            else if (score === 3) counts["Sitting"]++
            else if (score === 4) counts["Moving"]++
            else counts["Other"]++
          })
          
          const categoryData = categories.map(category => ({
            key: category,
            value: counts[category as keyof typeof counts]
          }))
          
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
