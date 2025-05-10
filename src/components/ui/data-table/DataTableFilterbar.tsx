"use client"

import { Button } from "@/components/Button"
import { Searchbar } from "@/components/Searchbar"
import { conditions, healthStatuses } from "@/data/data"
import { RiAddLine, RiDownloadLine } from "@remixicon/react"
import { Table } from "@tanstack/react-table"
import React, { useState } from "react"; // for adding in event listeners for opening adding button
import { useDebouncedCallback } from "use-debounce"
import { DataTableFilter } from "./DataTableFilter"
import { ViewOptions } from "./DataTableViewOptions"
import { PigDrawer } from "./NewDrawer"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function Filterbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [stallOptions, setStallOptions] = useState<{ value: string; label: string }[]>([])

  // Fetch stall data for the group filter
  React.useEffect(() => {
    const fetchStalls = async () => {
      try {
        // First try to fetch all stalls
        const response = await fetch('/api/stalls')
        if (response.ok) {
          const stalls = await response.json()
          // Transform stall data into the format needed for the filter
          const options = stalls.map((stall: any) => ({
            value: stall.name,
            label: stall.name
          }))
          setStallOptions(options)
        } else {
          console.error('Failed to fetch stalls directly, trying alternative endpoint')
          // If direct stall endpoint fails, try fetching farms and then stalls
          try {
            const farmsResponse = await fetch('/api/farms')
            if (farmsResponse.ok) {
              const farms = await farmsResponse.json()

              // For each farm, fetch its barns
              const allStalls: { value: string; label: string }[] = []

              for (const farm of farms) {
                try {
                  // Get barns for this farm
                  const barnsResponse = await fetch(`/api/barns/farm/${farm._id}`)
                  if (barnsResponse.ok) {
                    const barns = await barnsResponse.json()

                    // For each barn, fetch its stalls
                    for (const barn of barns) {
                      try {
                        const stallsResponse = await fetch(`/api/stalls/barn/${barn._id}`)
                        if (stallsResponse.ok) {
                          const stalls = await stallsResponse.json()

                          // Add stalls to our options
                          stalls.forEach((stall: any) => {
                            allStalls.push({
                              value: stall.name,
                              label: stall.name
                            })
                          })
                        }
                      } catch (error) {
                        console.error(`Error fetching stalls for barn ${barn._id}:`, error)
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching barns for farm ${farm._id}:`, error)
                }
              }

              if (allStalls.length > 0) {
                setStallOptions(allStalls)
              } else {
                // Fallback if no stalls found
                setStallOptions([
                  { value: "Stall 1", label: "Stall 1" },
                  { value: "Stall 2", label: "Stall 2" },
                  { value: "Stall 3", label: "Stall 3" }
                ])
              }
            } else {
              throw new Error('Failed to fetch farms')
            }
          } catch (error) {
            console.error('Error in fallback stall fetching:', error)
            // Fallback to default stalls if all API calls fail
            setStallOptions([
              { value: "Stall 1", label: "Stall 1" },
              { value: "Stall 2", label: "Stall 2" },
              { value: "Stall 3", label: "Stall 3" }
            ])
          }
        }
      } catch (error) {
        console.error('Error fetching stalls:', error)
        // Fallback to default stalls if API fails
        setStallOptions([
          { value: "Stall 1", label: "Stall 1" },
          { value: "Stall 2", label: "Stall 2" },
          { value: "Stall 3", label: "Stall 3" }
        ])
      }
    }

    fetchStalls()
  }, [])

  const debouncedSetFilterValue = useDebouncedCallback((value) => {
    table.getColumn("breed")?.setFilterValue(value)
  }, 300)

  const handleSearchChange = (event: any) => {
    const value = event.target.value
    setSearchTerm(value)
    debouncedSetFilterValue(value)
  }

  // Function to export table data to CSV
  const exportToCSV = () => {
    try {
      // Get visible columns (excluding action columns)
      const visibleColumns = table.getAllColumns()
        .filter(column =>
          column.getIsVisible() &&
          column.id !== 'select' &&
          column.id !== 'edit'
        )

      // Get column headers
      const headers = visibleColumns.map(column => {
        // Use the display name if available, otherwise use the column ID
        return column.columnDef.meta?.displayName || column.id
      })

      // Get all rows data
      const rows = table.getFilteredRowModel().rows

      // Create CSV content
      let csvContent = headers.join(',') + '\n'

      // Add rows to CSV
      rows.forEach(row => {
        const rowData = visibleColumns.map(column => {
          const cellValue = row.getValue(column.id)

          // Handle different data types and ensure proper CSV formatting
          if (cellValue === null || cellValue === undefined) {
            return ''
          } else if (typeof cellValue === 'object') {
            // For objects, convert to string to avoid [object Object]
            return JSON.stringify(cellValue).replace(/"/g, '""')
          } else {
            // For strings that might contain commas, wrap in quotes
            const stringValue = String(cellValue)
            return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
          }
        })

        csvContent += rowData.join(',') + '\n'
      })

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      // Set link properties
      link.setAttribute('href', url)
      link.setAttribute('download', `pig-data-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      // Add to document, click and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL object
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-x-6">
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
        {table.getColumn("status")?.getIsVisible() && (
          <DataTableFilter
            column={table.getColumn("status")}
            title="Health Status"
            options={healthStatuses}
            type="select"
          />
        )}
        {table.getColumn("region")?.getIsVisible() && (
          <DataTableFilter
            column={table.getColumn("region")}
            title="Stall"
            options={stallOptions}
            type="checkbox"
          />
        )}
        {table.getColumn("costs")?.getIsVisible() && (
          <DataTableFilter
            column={table.getColumn("costs")}
            title="Age"
            type="number"
            options={conditions}
          />
        )}
        {table.getColumn("breed")?.getIsVisible() && (
          <Searchbar
            type="search"
            placeholder="Search by breed..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:max-w-[250px] sm:[&>input]:h-[30px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="border border-gray-200 px-2 font-semibold text-indigo-600 sm:border-none sm:py-1 dark:border-gray-800 dark:text-indigo-500"
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/*  add option for adding a pig */}
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
        >
          <RiAddLine className="size-4 shrink-0" aria-hidden="true" />
          Add
        </Button>
        <PigDrawer open={isOpen} onOpenChange={setIsOpen} />
        <Button
          onClick={exportToCSV}
          variant="secondary"
          className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
        >
          <RiDownloadLine className="size-4 shrink-0" aria-hidden="true" />
          Export
        </Button>
        <ViewOptions table={table} />
      </div>
    </div>
  )
}