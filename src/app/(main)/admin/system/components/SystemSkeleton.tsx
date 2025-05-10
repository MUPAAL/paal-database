"use client";

import { Card } from "@/components/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, Database, HardDrive, Server } from "lucide-react";

export default function SystemSkeleton() {
  return (
    <div className="grid gap-6 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">System Status</h2>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Last updated: <Skeleton className="inline-block h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Server Status */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-medium">Server</h3>
              <Skeleton className="h-5 w-16 ml-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">CPU Usage:</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Memory:</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Uptime:</span>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium">Database</h3>
              <Skeleton className="h-5 w-16 ml-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Response Time:</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Connection:</span>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* Storage Status */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium">Storage</h3>
              <Skeleton className="h-5 w-16 ml-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Usage:</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Available:</span>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* CPU Status */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium">CPU</h3>
              <Skeleton className="h-5 w-16 ml-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Usage:</span>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cores:</span>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Backup & Restore Section */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Backup & Restore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-3">Create Backup</h3>
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <div className="text-sm text-gray-500">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-3">Restore from Backup</h3>
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <div className="text-sm text-gray-500">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-3">Backup History</h3>
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* System Logs Section */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">System Logs</h2>
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Recent Logs</h3>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
