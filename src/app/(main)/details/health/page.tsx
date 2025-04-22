"use client"

import { useEffect, useState } from "react"

export default function HealthStatusPage() {
  const [healthData, setHealthData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // This would need to be updated to fetch all health status data, not just for a specific pig
        const response = await fetch('/api/pigs/health-status')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setHealthData(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching health status data:', error)
        setError('Failed to fetch health status data. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>)
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h1 className="text-lg font-semibold">Error</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Pig Health Status Data
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <p className="mb-4">This page will display health status data for all pigs.</p>
        {/* Add your health status data table or visualization here */}
      </div>
    </>
  )
}
