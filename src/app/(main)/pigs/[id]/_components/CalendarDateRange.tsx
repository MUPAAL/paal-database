"use client"

import { Button } from "@/components/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { Calendar } from "@/components/ui/calendar"
import api from "@/lib/axios"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function CalendarDateRange() {
  const params = useParams()
  const pigId = params.id
  const searchParams = useSearchParams()
  const router = useRouter()

  // State for the date range
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  // State for available dates
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get the start and end dates from URL params
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")

  // Parse URL params on component mount
  useEffect(() => {
    if (startParam) {
      const parsedStart = parse(startParam, "yyyy-MM-dd", new Date())
      if (isValid(parsedStart)) {
        setDateRange(prev => ({ ...prev, from: parsedStart }))
      }
    }

    if (endParam) {
      const parsedEnd = parse(endParam, "yyyy-MM-dd", new Date())
      if (isValid(parsedEnd)) {
        setDateRange(prev => ({ ...prev, to: parsedEnd }))
      }
    }
  }, [startParam, endParam])

  // Fetch available dates from the API
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setIsLoading(true)
        // Fetch aggregated posture data to get available dates
        const response = await api.get(`/pigs/${pigId}/posture/aggregated`)

        if (response.data && Array.isArray(response.data)) {
          console.log('Available dates response:', response.data.slice(0, 3))

          // Extract dates from the aggregated data
          const dates = response.data.map((item: any) => {
            const date = new Date(item.date)
            console.log(`Parsed date: ${item.date} -> ${date.toISOString()}`)
            return date
          }).filter((date: Date) => {
            const isValidDate = isValid(date)
            if (!isValidDate) {
              console.log('Invalid date found:', date)
            }
            return isValidDate
          })

          console.log(`Found ${dates.length} valid dates`)
          setAvailableDates(dates)
        }
      } catch (error) {
        console.error("Error fetching available dates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (pigId) {
      fetchAvailableDates()
    }
  }, [pigId])

  // Update URL when date range changes

  const handleDateRangeChange = (range: DateRange) => {
    console.log('Date range changed:', range)
    setDateRange(range)

    // Build the new URL with the updated date range
    const params = new URLSearchParams(searchParams.toString())

    if (range.from) {
      const formattedDate = format(range.from, "yyyy-MM-dd")
      console.log('Setting start param:', formattedDate)
      params.set("start", formattedDate)
    } else {
      console.log('Clearing start param')
      params.delete("start")
    }

    if (range.to) {
      const formattedDate = format(range.to, "yyyy-MM-dd")
      console.log('Setting end param:', formattedDate)
      params.set("end", formattedDate)
    } else {
      console.log('Clearing end param')
      params.delete("end")
    }

    // Update the URL
    const newUrl = `/pigs/${pigId}?${params.toString()}`
    console.log('Navigating to:', newUrl)
    router.push(newUrl)
  }

  // Function to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Disable dates that are not in the available dates list
    const isAvailable = availableDates.some(availableDate =>
      availableDate.getFullYear() === date.getFullYear() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getDate() === date.getDate()
    )

    // For debugging
    if (date.getDate() === 1 || date.getDate() === 15) {
      console.log(`Date ${date.toISOString().split('T')[0]} is ${isAvailable ? 'available' : 'disabled'}`)
    }

    return !isAvailable
  }

  // Format the date range for display
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
    }

    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM d, yyyy")}`
    }

    if (dateRange.to) {
      return `Until ${format(dateRange.to, "MMM d, yyyy")}`
    }

    return "Select date range"
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Date Range</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal md:w-[300px]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isLoading ? "Loading dates..." : formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={availableDates.length > 0 ? availableDates[0] : undefined}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={handleDateRangeChange}
            disabled={isDateDisabled}
            numberOfMonths={2}
            className="border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
