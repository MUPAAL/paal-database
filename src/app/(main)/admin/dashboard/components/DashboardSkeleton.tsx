"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Building2, CheckCircle, Server, Users } from "lucide-react";

export default function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card Skeleton */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <div className="h-8 mt-1 flex items-center">
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="h-5 mt-1 flex items-center">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </Card>

        {/* Farms Card Skeleton */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Farms</p>
              <div className="h-8 mt-1 flex items-center">
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="h-5 mt-1 flex items-center">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full dark:bg-green-900">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </Card>

        {/* System Status Card Skeleton */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
              <div className="h-8 mt-1 flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-300 mr-1" />
                <Skeleton className="h-7 w-20" />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                <div className="flex items-center">
                  <span className="font-medium">Server:</span>
                  <Skeleton className="h-4 w-16 ml-1" />
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Database:</span>
                  <Skeleton className="h-4 w-16 ml-1" />
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Storage:</span>
                  <Skeleton className="h-4 w-16 ml-1" />
                </div>
                <div className="flex items-center">
                  <span className="font-medium">CPU:</span>
                  <Skeleton className="h-4 w-16 ml-1" />
                </div>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900">
              <Server className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </Card>

        {/* Activity Card Skeleton */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activity</p>
              <div className="h-8 mt-1 flex items-center">
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="h-5 mt-1 flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: </span>
                <Skeleton className="h-4 w-24 ml-1" />
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full dark:bg-orange-900">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Skeleton */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Users Action Skeleton */}
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium">Manage Users</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add, edit, or remove users
            </p>
          </div>

          {/* Farms Action Skeleton */}
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-medium">Manage Farms</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add, edit, or remove farms
            </p>
          </div>

          {/* System Action Skeleton */}
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Server className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-medium">System Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure system settings
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Activity Skeleton */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border-b last:border-b-0">
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <div className="h-5 mb-2 flex items-center">
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="h-4 mb-1 flex items-center">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="h-3 flex items-center">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
