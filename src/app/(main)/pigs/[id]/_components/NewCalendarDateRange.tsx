"use client"

import { DateRangePicker } from "@/components/DatePicker"
import api from "@/lib/axios"
import { format, isValid, parse } from "date-fns"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

export function NewCalendarDateRange() {
  const params = useParams()
  const pigId = params.id
  const searchParams = useSearchParams()
  const router = useRouter()

  // State for the date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  // State for available dates
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [minDate, setMinDate] = useState<Date | undefined>(undefined)
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined)

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
    } else {
      setDateRange(prev => ({ ...prev, from: undefined }))
    }
    
    if (endParam) {
      const parsedEnd = parse(endParam, "yyyy-MM-dd", new Date())
      if (isValid(parsedEnd)) {
        setDateRange(prev => ({ ...prev, to: parsedEnd }))
      }
    } else {
      setDateRange(prev => ({ ...prev, to: undefined }))
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
          // Extract dates from the aggregated data
          const dates = response.data.map((item: any) => {
            const date = new Date(item.date)
            return date
          }).filter((date: Date) => isValid(date))

          setAvailableDates(dates)
          
          // Set min and max dates for the date picker
          if (dates.length > 0) {
            const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime())
            setMinDate(sortedDates[0])
            setMaxDate(sortedDates[sortedDates.length - 1])
          }
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

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) return
    
    // Build the new URL with the updated date range
    const params = new URLSearchParams(searchParams.toString())
    
    if (range.from) {
      const formattedDate = format(range.from, "yyyy-MM-dd")
      params.set("start", formattedDate)
    } else {
      params.delete("start")
    }
    
    if (range.to) {
      const formattedDate = format(range.to, "yyyy-MM-dd")
      params.set("end", formattedDate)
    } else {
      params.delete("end")
    }
    
    // Update the URL
    const newUrl = `/pigs/${pigId}?${params.toString()}`
    router.push(newUrl)
  }

  // Function to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Disable dates that are not in the available dates list
    return !availableDates.some(availableDate => 
      availableDate.getFullYear() === date.getFullYear() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getDate() === date.getDate()
    )
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Date Range</span>
      <DateRangePicker
        value={dateRange}
        onChange={handleDateRangeChange}
        className="w-full md:w-[300px]"
        toDate={maxDate}
        fromDate={minDate}
        align="start"
        disabled={isLoading}
        disabledDays={isDateDisabled}
        placeholder={isLoading ? "Loading dates..." : "Select date range"}
      />
    </div>
  )
}
