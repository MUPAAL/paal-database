"use client"

import { Button } from "@/components/Button"
import { Calendar } from "@/components/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/Popover"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

export function DateRangeSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Initialize date range from URL params or default to last 30 days
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")
    
    if (startParam && endParam) {
      return {
        from: new Date(startParam),
        to: new Date(endParam)
      }
    }
    
    // Default to last 30 days
    return {
      from: addDays(new Date(), -30),
      to: new Date()
    }
  })

  // Update URL when date range changes
  useEffect(() => {
    if (date?.from && date?.to) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("start", format(date.from, "yyyy-MM-dd"))
      params.set("end", format(date.to, "yyyy-MM-dd"))
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [date, pathname, router, searchParams])

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
