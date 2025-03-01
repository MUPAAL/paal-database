"use client"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { LineChart } from "@/components/LineChart"
import api from "@/lib/axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface PigData {
  _id: string;  // The MongoDB ObjectId as a string
  pigId: number; // Numeric pig ID
  tag: string;
  breed: string;
  age: number;
  lastUpdate: string;  // ISO 8601 formatted date-time string
  active: boolean;
  currentLocation: {
    farmId: string;
    barnId: string;
    stallId: string;
  };
  __v: number; // Version key, can be omitted in some cases
}


interface BCSData {
  _id: string;  // The MongoDB ObjectId as a string
  pigId: number;  // Numeric pig ID
  timestamp: string;  // ISO 8601 formatted date-time string
  score: number;  // BCS score value
  __v: number; // Version key, can be omitted in some cases
}

interface PostureData {
  _id: string;  // The MongoDB ObjectId as a string
  pigId: number;  // Numeric pig ID
  timestamp: string;  // ISO 8601 formatted date-time string
  score: number;  // Posture score
  __v: number; // Version key, can be omitted in some cases
}

export default function PigDashboard() {
  const params = useParams()
  const [pig, setPig] = useState<PigData | null>(null)
  const [bcsHistory, setBcsHistory] = useState<BCSData[]>([])
  const [postureHistory, setPostureHistory] = useState<PostureData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPigData = async () => {
      try {
        const [pigResponse, bcsResponse, postureResponse] = await Promise.all([
          api.get(`/pigs/${params.id}`),
          api.get(`/pigs/${params.id}/bcs`),
          api.get(`/pigs/${params.id}/posture`)
        ])

        setPig(pigResponse.data)
        setBcsHistory(bcsResponse.data)
        setPostureHistory(postureResponse.data)
      } catch (error) {
        console.error('Error fetching pig data:', error)
        setError('Failed to fetch pig data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPigData()
    }
  }, [params.id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!pig) {
    return <div>Pig not found</div>
  }

  const getBCSStatusBadge = (score: number) => {
    if (score >= 4) return <Badge variant="error">Critical</Badge>
    if (score >= 3) return <Badge variant="success">Healthy</Badge>
    return <Badge variant="warning">Attention Needed</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Pig {pig.pigId}
          </h1>
          <p className="text-sm text-gray-500">
            Group {pig.currentLocation.stallId} • {pig.breed}
          </p>
        </div>
        {getBCSStatusBadge(pig.age)}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-medium">BCS History</h3>
          <div className="h-[300px] w-full">
            <LineChart
              data={bcsHistory.map(record => ({
                date: record.timestamp,
                "BCS Score": record.score
              }))}
              index="date"
              categories={["BCS Score"]}
              colors={["indigo"]}
              valueFormatter={(value) => value.toFixed(1)}
              showLegend={false}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Posture History</h3>
          <div className="h-[300px] w-full">
            <LineChart
              data={postureHistory.map(record => ({
                date: record.timestamp,
                "Posture": record.score
              }))}
              index="date"
              categories={["Posture"]}
              colors={["blue"]}
              valueFormatter={(value) => value.toString()}
              showLegend={false}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Current Status</h3>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {pig.age} months
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current BCS</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {postureHistory.at.length.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Posture</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {postureHistory.at.length.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {new Date(pig.lastUpdate).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Health Analysis</h3>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}