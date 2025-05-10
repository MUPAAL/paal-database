"use client"

import { useEffect, useState } from "react"

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/pigs/analytics/summary')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAnalyticsData(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        setError('Failed to fetch analytics data. Please try again later.')
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
        Pig Analytics
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <p className="mb-4">This page will display analytics and summary data for all pigs.</p>
        {analyticsData && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-medium">Total Pigs</h2>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{analyticsData.totalPigs}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-medium">Average Age</h2>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{analyticsData.averageAge} months</p>
            </div>
            {/* Add more analytics cards as needed */}
          </div>
        )}
      </div>
    </>
  )
}
