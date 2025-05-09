"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

export default function UnifiedFarmsSkeleton() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Farm Management</h1>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Farms</h2>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <div className="flex border border-gray-200 dark:border-gray-800 rounded-md">
              <Skeleton className="h-9 w-9 rounded-l-md" />
              <Skeleton className="h-9 w-9 rounded-r-md" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <Building2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-20">Location:</span>
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-20">Barns:</span>
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-20">Stalls:</span>
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-20">Status:</span>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
