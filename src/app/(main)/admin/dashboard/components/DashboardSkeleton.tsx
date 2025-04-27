"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Building2, Server, Users } from "lucide-react";

export default function DashboardSkeleton() {
  return (
    <>
      <section aria-labelledby="current-status-skeleton">
        <h1
          id="current-status-skeleton"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Admin Dashboard
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4">
          {/* Users Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                    User Metrics
                  </dt>
                </div>
                <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <dd className="mt-2 flex items-baseline gap-2">
                <Skeleton className="h-8 w-16" />
                <span className="text-sm text-gray-500">total users</span>
              </dd>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Active Users
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Inactive Users
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                Manage user accounts.{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  View users
                </span>
              </p>
            </div>
          </div>

          {/* Farms Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                    Farm Metrics
                  </dt>
                </div>
                <div className="bg-green-100 p-3 rounded-full dark:bg-green-900">
                  <Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <dd className="mt-2 flex items-baseline gap-2">
                <Skeleton className="h-8 w-16" />
                <span className="text-sm text-gray-500">total farms</span>
              </dd>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Active Farms
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Inactive Farms
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                Manage farm settings.{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  View farms
                </span>
              </p>
            </div>
          </div>

          {/* System Status Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                    System Status
                  </dt>
                </div>
                <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900">
                  <Server className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <dd className="mt-2 flex items-baseline gap-2">
                <Skeleton className="h-8 w-16" />
                <span className="text-sm text-gray-500">system health</span>
              </dd>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Server
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Database
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Storage
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      CPU
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                View system details.{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  View details
                </span>
              </p>
            </div>
          </div>

          {/* Activity Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                    Activity Overview
                  </dt>
                </div>
                <div className="bg-orange-100 p-3 rounded-full dark:bg-orange-900">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
              <dd className="mt-2 flex items-baseline gap-2">
                <span className="text-xl text-gray-900 dark:text-gray-50">
                  Recent
                </span>
                <span className="text-sm text-gray-500">system activity</span>
              </dd>
              <ul role="list" className="mt-4 space-y-3">
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      User Activity
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
                <li>
                  <p className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      System Events
                    </span>
                    <Skeleton className="h-5 w-16" />
                  </p>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                Last updated: <Skeleton className="inline-block h-4 w-24" />
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-actions-skeleton" className="mt-10">
        <h2
          id="quick-actions-skeleton"
          className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Quick Actions
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Users Action Skeleton */}
          <div className="flex flex-col p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
            <div className="mb-3">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-50">Manage Users</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove users from the system</p>
          </div>

          {/* Farms Action Skeleton */}
          <div className="flex flex-col p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
            <div className="mb-3">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-50">Manage Farms</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove farms from the system</p>
          </div>

          {/* System Action Skeleton */}
          <div className="flex flex-col p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
            <div className="mb-3">
              <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-50">System Settings</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure system settings and preferences</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="recent-activity-skeleton" className="mt-10">
        <h2
          id="recent-activity-skeleton"
          className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Recent Activity
        </h2>
        <div className="mt-4">
          <div className="flex flex-col bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 sm:text-lg dark:text-gray-50">
                  System Events
                </h2>
              </div>
              <div className="bg-gray-100 p-2 rounded-full dark:bg-gray-800">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
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
          </div>
        </div>
      </section>
    </>
  );
}
