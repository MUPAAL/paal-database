"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { format, isValid, parse } from "date-fns"

// Define the shape of our context
interface PostureDataContextType {
  postureData: any[] | null
  isLoading: boolean
  error: string | null
  dateRange: {
    minDate: Date | null
    maxDate: Date | null
  }
}

// Create the context
const PostureDataContext = createContext<PostureDataContextType>({
  postureData: null,
  isLoading: false,
  error: null,
  dateRange: {
    minDate: null,
    maxDate: null
  }
})

// Hook to use the context
export const usePostureData = () => useContext(PostureDataContext)

// Provider component
export function PostureDataProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const searchParams = useSearchParams()
  const pigId = params.id

  // Get date range from URL params
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")

  // Parse date range
  const startDate = startParam ? parse(startParam, "yyyy-MM-dd", new Date()) : undefined
  const endDate = endParam ? parse(endParam, "yyyy-MM-dd", new Date()) : undefined

  // State for posture data
  const [postureData, setPostureData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ minDate: Date | null; maxDate: Date | null }>({
    minDate: new Date('2022-07-22'),
    maxDate: new Date('2022-08-25')
  })

  // Fetch posture data
  useEffect(() => {
    const fetchPostureData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Create URL parameters for date filtering
        const params = new URLSearchParams()

        if (startDate && isValid(startDate)) {
          params.append('start', format(startDate, 'yyyy-MM-dd'))
        }

        if (endDate && isValid(endDate)) {
          params.append('end', format(endDate, 'yyyy-MM-dd'))
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
          const { minDate, maxDate } = data.dateRange
          setDateRange({
            minDate: minDate ? new Date(minDate) : new Date('2022-07-22'),
            maxDate: maxDate ? new Date(maxDate) : new Date('2022-08-25')
          })
          
          // Also store in global variable for backward compatibility
          window.pigPostureDateRange = data.dateRange
        }

        setPostureData(filteredData)
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
  }, [pigId, startDate, endDate])

  return (
    <PostureDataContext.Provider value={{ postureData, isLoading, error, dateRange }}>
      {children}
    </PostureDataContext.Provider>
  )
}
