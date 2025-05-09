"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin } from "lucide-react";

export default function FarmsSkeleton() {
  return (
    <div className="animate-fade-in">
      <section aria-labelledby="farms-overview-skeleton">
        <div className="flex items-center justify-between mb-6">
          <h1
            id="farms-overview-skeleton"
            className="scroll-mt-10 text-2xl font-bold text-gray-900 dark:text-gray-50"
          >
            Farm Management
          </h1>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>

        <div className="mt-4 bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 sm:text-lg dark:text-gray-50">
                  Farms Overview
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-9 w-32 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Farm Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Barns
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Stalls
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                      {[...Array(5)].map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full">
                                <Building2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                              </div>
                              <div className="ml-4">
                                <Skeleton className="h-5 w-32" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-5 w-12" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-5 w-12" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
