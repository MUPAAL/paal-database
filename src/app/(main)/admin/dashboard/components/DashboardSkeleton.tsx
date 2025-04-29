"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Building2, ChevronRight, Server, Settings, Users } from "lucide-react";

export default function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      <section aria-labelledby="current-status-skeleton">
        <div className="flex items-center justify-between mb-6">
          <h1
            id="current-status-skeleton"
            className="scroll-mt-10 text-2xl font-bold text-gray-900 dark:text-gray-50"
          >
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Users Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                      User Metrics
                    </dt>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Active and inactive users</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/60 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <dd className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  <Skeleton className="h-8 w-16" />
                </span>
                <span className="text-sm text-gray-500">total users</span>
              </dd>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Active Users
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full" />
                </li>
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Inactive Users
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                Manage user accounts.{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  View users
                </span>
              </p>
            </div>
          </div>

          {/* Farms Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                      Farm Metrics
                    </dt>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Active and inactive farms</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/60 p-3 rounded-xl">
                  <Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <dd className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  <Skeleton className="h-8 w-16" />
                </span>
                <span className="text-sm text-gray-500">total farms</span>
              </dd>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Active Farms
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-green-500 dark:[&>div]:bg-green-600" />
                </li>
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Inactive Farms
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-green-500 dark:[&>div]:bg-green-600" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                Manage farm settings.{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  View farms
                </span>
              </p>
            </div>
          </div>

          {/* System Status Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                      System Status
                    </dt>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Server performance metrics</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/60 p-3 rounded-xl">
                  <Server className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <dd className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  <Skeleton className="h-8 w-16" />
                </span>
                <span className="text-sm text-gray-500">system health</span>
              </dd>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Server
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-purple-500 dark:[&>div]:bg-purple-600" />
                </li>
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Database
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-purple-500 dark:[&>div]:bg-purple-600" />
                </li>
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Storage
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-purple-500 dark:[&>div]:bg-purple-600" />
                </li>
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      CPU
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-purple-500 dark:[&>div]:bg-purple-600" />
                </li>
              </ul>
            </div>
            <div>
              <p className="mt-6 text-xs text-gray-500">
                View system details.{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  View details
                </span>
              </p>
            </div>
          </div>

          {/* Activity Card Skeleton */}
          <div className="flex flex-col justify-between bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                      Activity Overview
                    </dt>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">User and system events</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/60 p-3 rounded-xl">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
              <dd className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  <Skeleton className="h-8 w-16" />
                </span>
                <span className="text-sm text-gray-500">active entities</span>
              </dd>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      User Activity
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-orange-500 dark:[&>div]:bg-orange-600" />
                </li>
                <li>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Farm Activity
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      <Skeleton className="h-5 w-16 inline-block" />
                    </span>
                  </div>
                  <Skeleton className="h-2 w-full mt-2 rounded-full [&>div]:bg-orange-500 dark:[&>div]:bg-orange-600" />
                </li>
              </ul>
            </div>
            <div>
              <div className="mt-6 text-xs text-gray-500">
                Last updated: <Skeleton className="inline-block h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-actions-skeleton" className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="quick-actions-skeleton"
            className="scroll-mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50"
          >
            Quick Actions
          </h2>
          <div className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
            <span>View all</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Users Action Skeleton */}
          <div className="flex flex-col p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm cursor-pointer">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/60 p-3 rounded-xl mb-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-lg">Manage Users</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add, edit, or remove users from the system. Manage permissions and access control.</p>
            <div className="mt-auto pt-4">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                <span className="truncate">Learn more</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>

          {/* Farms Action Skeleton */}
          <div className="flex flex-col p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm cursor-pointer">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/60 p-3 rounded-xl mb-4">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-lg">Manage Farms</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add, edit, or remove farms from the system. Configure farm settings and locations.</p>
            <div className="mt-auto pt-4">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                <span className="truncate">Learn more</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>

          {/* System Action Skeleton */}
          <div className="flex flex-col p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm cursor-pointer">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/60 p-3 rounded-xl mb-4">
              <Server className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-lg">System Settings</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Configure system settings and preferences. Manage backups and system maintenance.</p>
            <div className="mt-auto pt-4">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center">
                <span className="truncate">Learn more</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="recent-activity-skeleton" className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="recent-activity-skeleton"
            className="scroll-mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50"
          >
            Recent Activity
          </h2>
          <div className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
            <span>View all activities</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-col bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <h2 className="font-bold text-gray-900 text-lg dark:text-gray-50">
                  System Events
                </h2>
                <p className="text-sm text-gray-500 mt-1">Recent activity across the platform</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/60 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
                  <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
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
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500">
                Last updated: <Skeleton className="inline-block h-4 w-24" />
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                View all activities
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
