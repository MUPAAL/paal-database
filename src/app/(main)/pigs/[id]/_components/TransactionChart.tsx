"use client"
import { BarChartVariant } from "@/components/BarChartVariantFull"
import { Tooltip } from "@/components/Tooltip"
import { Transaction } from "@/data/schema"
import api from "@/lib/axios"
import { AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx, formatters } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"
import { number } from "zod"
import { DEFAULT_RANGE, RANGE_DAYS, RangeKey } from "./dateRanges"

interface ChartDataItem {
  key?: string
  value?: number
  date?: string
  [key: string]: number | string | undefined
}

type ChartType = "amount" | "count" | "category" | "merchant"

interface ChartConfig {
  title: string
  tooltipContent: string
  processData: (pigId: number, range: number) => Promise<ChartDataItem[]>
  valueFormatter: (value: number) => string
  layout?: "horizontal" | "vertical"
  color: string
  xValueFormatter?: (value: string) => string
}

interface Filters {
  expenseStatus: string
  minAmount: number
  maxAmount: number
  selectedCountries: string[]
}

const fetchPostureSummary = async (pigId: number, range: number) => {
  const res = await api.get(`/pigs/pigs/${pigId}/posture-summary?range=${range}`)
  if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch posture data")
  return res.data
}


// Generate random integer values (1-5) for each day
const generateDailyIntegerData = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate random counts for each value (1-5)
    const total = 100 // Total observations per day
    const values = [0, 1, 2, 3, 4, 5]
    let remaining = total
    const counts: { [key: number]: number } = {}

    values.forEach((value, index) => {
      if (index === values.length - 1) {
        counts[value] = remaining
      } else {
        const count = Math.floor(Math.random() * (remaining - (values.length - index - 1)))
        counts[value] = count
        remaining -= count
      }
    })

    data.push({
      date: date.toISOString().split('T')[0],
      ...counts
    })
  }

  console.log(data)

  return data
}

const chartConfigs: Record<ChartType, ChartConfig> = {
  amount: {
    title: "Daily Integer Value Distribution",
    tooltipContent: "Distribution of integer values (1-5) recorded each day",
    color: "blue",
    processData: async (pigId: number, range: number): Promise<ChartDataItem[]> => {
      return await fetchPostureSummary(pigId, range)
    },
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
  count: {
    title: "Transaction Count",
    tooltipContent:
      "Total number of transactions for the selected period and amount range.",
    processData: async (pigId: number, range: number) => {
      const countedData: Record<string, number> = {}
      number.forEach((number) => {
        const date = transaction.transaction_date.split("T")[0]
        if (isTransactionValid(transaction, filterDate, filters)) {
          countedData[date] = (countedData[date] || 0) + 1
        }
      })
      return Object.entries(countedData).map(([date, value]) => ({
        key: date,
        value,
      }))
    },
    valueFormatter: (number: number) =>
      Intl.NumberFormat("us").format(number).toString(),
    color: "blue",
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
    title: "Top 5 Posture Scores",
    tooltipContent: "Most frequently observed posture scores over the selected date range.",
    layout: "vertical",
    color: "emerald",
    processData: async (pigId: number, range: number): Promise<ChartDataItem[]> => {
      const postureData = await fetchPostureSummary(pigId, range)

      // Aggregate posture counts across all days
      const totalCounts: Record<string, number> = {}

      for (const day of postureData) {
        for (const [score, count] of Object.entries(day)) {
          if (score === "date") continue
          totalCounts[score] = (totalCounts[score] || 0) + (count as number)
        }
      }

      // Sort top 5 scores by frequency
      return Object.entries(totalCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, value]) => ({ key, value }))
    },
    valueFormatter: (number: number) => number.toString(),
  },
  merchant: {
    title: "Top 5 Merchants by Transaction Amount",
    tooltipContent:
      "Total amount of transactions for the top 5 merchants in the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const merchantTotals: Record<string, number> = {}
      transactions.forEach((transaction) => {
        if (isTransactionValid(transaction, filterDate, filters)) {
          merchantTotals[transaction.merchant] =
            (merchantTotals[transaction.merchant] || 0) + transaction.amount
        }
      })
      return Object.entries(merchantTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([merchant, value]) => ({ key: merchant, value }))
    },
    valueFormatter: (number: number) =>
      formatters.currency({ number: number, maxFractionDigits: 0 }),
    layout: "vertical",
    color: "orange",
  },
}

const isTransactionValid = (
  transaction: Transaction,
  filterDate: Date,
  filters: Filters,
) => {
  const { expenseStatus, minAmount, maxAmount, selectedCountries } = filters
  const transactionDate = new Date(transaction.transaction_date)
  return (
    transactionDate >= filterDate &&
    (expenseStatus === "all" || transaction.expense_status === expenseStatus) &&
    transaction.amount >= minAmount &&
    transaction.amount <= maxAmount &&
    (selectedCountries.length === 0 ||
      selectedCountries.includes(transaction.country))
  )
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
  const [range] = useQueryState<RangeKey>("range", {
    defaultValue: DEFAULT_RANGE,
    parse: (value): RangeKey =>
      Object.keys(RANGE_DAYS).includes(value)
        ? (value as RangeKey)
        : DEFAULT_RANGE,
  })
  const [expenseStatus] = useQueryState("expense_status", {
    defaultValue: "all",
  })
  const [amountRange] = useQueryState("amount_range", {
    defaultValue: "0-Infinity",
  })
  const [selectedCountries] = useQueryState<string[]>("countries", {
    defaultValue: [],
    parse: (value: string) => (value ? value.split("+") : []),
    serialize: (value: string[]) => value.join("+"),
  })

  const [minAmount, maxAmount] = useMemo(() => {
    const [min, max] = amountRange.split("-").map(Number)
    return [min, max === Infinity ? Number.MAX_SAFE_INTEGER : max]
  }, [amountRange])

  const config = chartConfigs[type]
  const [chartData, setChartData] = useState<ChartDataItem[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const days = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE]
        const data = await chartConfigs[type].processData(1, days) // Replace 1 with dynamic pigId if needed

        if (type === "amount" && showPercentage) {
          const percentageData = data.map(day => {
            const total = Object.entries(day)
              .filter(([key]) => !isNaN(Number(key)))
              .reduce((sum, [, count]) => sum + (count as number), 0)

            const percentages: any = { date: day.date }
            Object.entries(day)
              .filter(([key]) => !isNaN(Number(key)))
              .forEach(([value, count]) => {
                percentages[value] = ((count as number) / total) * 100
              })

            return percentages
          })

          setChartData(percentageData)
        } else {
          setChartData(data)
        }
      } catch (err) {
        console.error("Failed to fetch chart data", err)
      }
    }

    loadData()
  }, [range, type, showPercentage])
  const categories =
    type === "amount"
      ? ["0", "1", "2", "3", "4", "5"]
      : type === "category"
        ? chartData.map((item) => item.key as string)
        : ["value"]

  const colors: AvailableChartColorsKeys[] = type === "amount"
    ? ["blue", "emerald", "violet", "amber", "gray"]
    : [config.color as AvailableChartColorsKeys]

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
      <BarChartVariant
        data={chartData}
        index={type === "amount" ? "date" : "key"}
        categories={categories}
        showLegend={type === "amount"}
        colors={colors}
        yAxisWidth={yAxisWidth}
        valueFormatter={config.valueFormatter}
        xValueFormatter={config.xValueFormatter}
        showYAxis={showYAxis}
        className="m-4 h-64"
        layout={config.layout}
        barCategoryGap="6%"
        aria-labelledby={`${type}-chart-title`}
        role="figure"
        aria-roledescription="chart"
      />
    </div>
  )
}