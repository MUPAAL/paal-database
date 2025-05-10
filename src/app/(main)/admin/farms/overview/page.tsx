"use client";

import { Card } from "@/components/Card";
import { SimpleButton } from "@/components/SimpleButton";
import { EnhancedActivityCard } from "@/components/ui/admin/EnhancedActivityCard";
import api from "@/utils/api";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Building2,
  ChevronDown,
  ChevronRight,
  Filter,
  Home,
  LayoutGrid,
  Loader2,
  PenSquare,
  Plus,
  Search,
  SlidersHorizontal,
  Table2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define types for our data structures
type Farm = {
  _id: string;
  name: string;
  location: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  barnCount?: number;
  stallCount?: number;
  pigCount?: number;
  barns?: Barn[];
};

type Barn = {
  _id: string;
  name: string;
  farmId: string | { _id: string; name: string; location: string };
  stallCount?: number;
  pigCount?: number;
  stalls?: Stall[];
};

type Stall = {
  _id: string;
  name: string;
  barnId: string | { _id: string; name: string };
  farmId: string | { _id: string; name: string };
  pigCount?: number;
};

export default function FarmsOverviewPage() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"hierarchical" | "table">("hierarchical");
  const [expandedFarms, setExpandedFarms] = useState<Record<string, boolean>>({});
  const [expandedBarns, setExpandedBarns] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<"name" | "location" | "barnCount" | "stallCount" | "pigCount">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
          router.push("/login");
          return;
        }

        try {
          const userData = JSON.parse(user);
          if (userData.role !== "admin") {
            router.push("/overview");
            return;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/login");
          return;
        }

        // Fetch farms, barns, and stalls in parallel
        const [farmsResponse, barnsResponse, stallsResponse] = await Promise.all([
          api.get("/api/farms"),
          api.get("/api/barns"),
          api.get("/api/stalls")
        ]);

        // Process farms data with better error handling
        let farmsData = [];
        if (farmsResponse && farmsResponse.data) {
          farmsData = Array.isArray(farmsResponse.data) ? farmsResponse.data : [];
          console.log("Farms data loaded:", farmsData.length);
        } else {
          console.warn("No farms data received");
        }

        // Process barns data with better error handling
        let barnsData = [];
        if (barnsResponse && barnsResponse.data) {
          barnsData = Array.isArray(barnsResponse.data) ? barnsResponse.data : [];
          console.log("Barns data loaded:", barnsData.length);
        } else {
          console.warn("No barns data received");
        }

        // Process stalls data with better error handling
        let stallsData = [];
        if (stallsResponse && stallsResponse.data) {
          stallsData = Array.isArray(stallsResponse.data) ? stallsResponse.data : [];
          console.log("Stalls data loaded:", stallsData.length);
        } else {
          console.warn("No stalls data received");
        }

        // If all data is empty, use mock data for development
        if (farmsData.length === 0 && barnsData.length === 0 && stallsData.length === 0) {
          console.warn("No data received from any API endpoint, using mock data for development");

          // Mock farms data
          farmsData = [
            {
              _id: "mock-farm-1",
              name: "Mock Farm 1",
              location: "Mock Location 1",
              description: "This is a mock farm for development",
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              counts: {
                barns: 2,
                stalls: 4,
                pigs: 10,
                devices: 2
              }
            },
            {
              _id: "mock-farm-2",
              name: "Mock Farm 2",
              location: "Mock Location 2",
              description: "This is another mock farm for development",
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              counts: {
                barns: 1,
                stalls: 3,
                pigs: 8,
                devices: 1
              }
            }
          ];

          // Mock barns data
          barnsData = [
            {
              _id: "mock-barn-1",
              name: "Mock Barn 1",
              farmId: "mock-farm-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: "mock-barn-2",
              name: "Mock Barn 2",
              farmId: "mock-farm-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: "mock-barn-3",
              name: "Mock Barn 3",
              farmId: "mock-farm-2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];

          // Mock stalls data
          stallsData = [
            {
              _id: "mock-stall-1",
              name: "Mock Stall 1",
              barnId: "mock-barn-1",
              farmId: "mock-farm-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pigCount: 3
            },
            {
              _id: "mock-stall-2",
              name: "Mock Stall 2",
              barnId: "mock-barn-1",
              farmId: "mock-farm-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pigCount: 2
            },
            {
              _id: "mock-stall-3",
              name: "Mock Stall 3",
              barnId: "mock-barn-2",
              farmId: "mock-farm-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pigCount: 5
            },
            {
              _id: "mock-stall-4",
              name: "Mock Stall 4",
              barnId: "mock-barn-3",
              farmId: "mock-farm-2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pigCount: 4
            },
            {
              _id: "mock-stall-5",
              name: "Mock Stall 5",
              barnId: "mock-barn-3",
              farmId: "mock-farm-2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pigCount: 2
            },
            {
              _id: "mock-stall-6",
              name: "Mock Stall 6",
              barnId: "mock-barn-3",
              farmId: "mock-farm-2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pigCount: 2
            }
          ];
        }

        // Organize data hierarchically
        const processedFarms = farmsData.map(farm => {
          const farmBarns = barnsData.filter(barn =>
            (typeof barn.farmId === 'string' && barn.farmId === farm._id) ||
            (typeof barn.farmId === 'object' && barn.farmId._id === farm._id)
          );

          let stallCount = 0;
          let pigCount = 0;

          const processedBarns = farmBarns.map(barn => {
            const barnStalls = stallsData.filter(stall =>
              (typeof stall.barnId === 'string' && stall.barnId === barn._id) ||
              (typeof stall.barnId === 'object' && stall.barnId._id === barn._id)
            );

            const barnPigCount = barnStalls.reduce((sum, stall) => sum + (stall.pigCount || 0), 0);
            pigCount += barnPigCount;
            stallCount += barnStalls.length;

            return {
              ...barn,
              stallCount: barnStalls.length,
              pigCount: barnPigCount,
              stalls: barnStalls
            };
          });

          return {
            ...farm,
            barnCount: farmBarns.length,
            stallCount,
            pigCount,
            barns: processedBarns
          };
        });

        setFarms(processedFarms);
        setBarns(barnsData);
        setStalls(stallsData);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching data:", err);

        // Provide more detailed error messages
        let errorMessage = "Failed to fetch data";

        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }

        // Log additional details for debugging
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }

        setError(errorMessage);
        setIsLoading(false);

        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }
    };

    fetchData();
  }, [router]);

  // Toggle farm expansion
  const toggleFarmExpansion = (farmId: string) => {
    setExpandedFarms(prev => ({
      ...prev,
      [farmId]: !prev[farmId]
    }));
  };

  // Toggle barn expansion
  const toggleBarnExpansion = (barnId: string) => {
    setExpandedBarns(prev => ({
      ...prev,
      [barnId]: !prev[barnId]
    }));
  };

  // Handle sort
  const handleSort = (field: "name" | "location" | "barnCount" | "stallCount" | "pigCount") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort farms
  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farm.description && farm.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedFarms = [...filteredFarms].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "location":
        comparison = a.location.localeCompare(b.location);
        break;
      case "barnCount":
        comparison = (a.barnCount || 0) - (b.barnCount || 0);
        break;
      case "stallCount":
        comparison = (a.stallCount || 0) - (b.stallCount || 0);
        break;
      case "pigCount":
        comparison = (a.pigCount || 0) - (b.pigCount || 0);
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate summary statistics
  const totalFarms = farms.length;
  const totalBarns = farms.reduce((sum, farm) => sum + (farm.barnCount || 0), 0);
  const totalStalls = farms.reduce((sum, farm) => sum + (farm.stallCount || 0), 0);
  const totalPigs = farms.reduce((sum, farm) => sum + (farm.pigCount || 0), 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <SimpleButton
            variant="ghost"
            onClick={() => router.push('/admin/farms')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </SimpleButton>
          <h1 className="text-2xl font-bold">Farms Overview</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
              Loading Farms Data...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait while we load the data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <SimpleButton
            variant="ghost"
            onClick={() => router.push('/admin/farms')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </SimpleButton>
          <h1 className="text-2xl font-bold">Farms Overview</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">Something went wrong</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <SimpleButton onClick={() => window.location.reload()}>Retry</SimpleButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SimpleButton
            variant="ghost"
            onClick={() => router.push('/admin/farms')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </SimpleButton>
          <h1 className="text-2xl font-bold">Farms Overview</h1>
        </div>
        <div className="flex items-center space-x-2">
          <SimpleButton
            variant={viewMode === "hierarchical" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("hierarchical")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Hierarchical
          </SimpleButton>
          <SimpleButton
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table2 className="h-4 w-4 mr-2" />
            Table
          </SimpleButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full mr-3">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Farms</p>
              <p className="text-2xl font-semibold">{totalFarms}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full mr-3">
              <Home className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Barns</p>
              <p className="text-2xl font-semibold">{totalBarns}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full mr-3">
              <LayoutGrid className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stalls</p>
              <p className="text-2xl font-semibold">{totalStalls}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-3 rounded-full mr-3">
              <SlidersHorizontal className="h-5 w-5 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pigs</p>
              <p className="text-2xl font-semibold">{totalPigs}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search farms, locations..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <SimpleButton variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </SimpleButton>
          <SimpleButton variant="outline" size="sm" onClick={() => router.push('/admin/farms')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Farm
          </SimpleButton>
        </div>
      </div>

      {/* Main Content */}
      <EnhancedActivityCard
        title="Farms, Barns, and Stalls"
        subtitle={`Showing ${filteredFarms.length} of ${farms.length} farms`}
        icon={<Building2 />}
        color="blue"
        footer={
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <SimpleButton variant="link" size="sm" onClick={() => router.push('/admin/farms')}>
              Manage Farms
            </SimpleButton>
          </div>
        }
      >
        {viewMode === "hierarchical" ? (
          <div className="space-y-4 p-4">
            {sortedFarms.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No farms found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add a new farm</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFarms.map(farm => (
                  <div key={farm._id} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                    {/* Farm Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                      onClick={() => toggleFarmExpansion(farm._id)}
                    >
                      <div className="flex items-center">
                        <button className="mr-2">
                          {expandedFarms[farm._id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full mr-3">
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-50">{farm.name}</h3>
                          <p className="text-sm text-gray-500">{farm.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{farm.barnCount || 0} Barns</p>
                          <p className="text-xs text-gray-500">{farm.stallCount || 0} Stalls</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{farm.pigCount || 0} Pigs</p>
                          <p className="text-xs text-gray-500">{farm.isActive !== false ? "Active" : "Inactive"}</p>
                        </div>
                        <SimpleButton variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/farms?edit=${farm._id}`);
                        }}>
                          <PenSquare className="h-4 w-4" />
                        </SimpleButton>
                      </div>
                    </div>

                    {/* Barns (when expanded) */}
                    {expandedFarms[farm._id] && (farm.barns?.length || 0) > 0 && (
                      <div className="pl-10 pr-4 py-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="space-y-2">
                          {farm.barns?.map(barn => (
                            <div key={barn._id} className="border-l-2 border-gray-200 dark:border-gray-700">
                              {/* Barn Header */}
                              <div
                                className="flex items-center justify-between p-3 cursor-pointer ml-2"
                                onClick={() => toggleBarnExpansion(barn._id)}
                              >
                                <div className="flex items-center">
                                  <button className="mr-2">
                                    {expandedBarns[barn._id] ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                  <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full mr-3">
                                    <Home className="h-3 w-3 text-green-600 dark:text-green-300" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{barn.name}</h4>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{barn.stallCount || 0} Stalls</p>
                                    <p className="text-xs text-gray-500">{barn.pigCount || 0} Pigs</p>
                                  </div>
                                </div>
                              </div>

                              {/* Stalls (when barn is expanded) */}
                              {expandedBarns[barn._id] && (barn.stalls?.length || 0) > 0 && (
                                <div className="pl-10 pr-4 py-2">
                                  <div className="space-y-2">
                                    {barn.stalls?.map(stall => (
                                      <div key={stall._id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <div className="bg-purple-100 dark:bg-purple-900/40 p-1.5 rounded-full mr-3">
                                              <LayoutGrid className="h-2.5 w-2.5 text-purple-600 dark:text-purple-300" />
                                            </div>
                                            <div>
                                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">{stall.name}</h5>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs text-gray-500">{stall.pigCount || 0} Pigs</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Farm Name
                        {sortField === "name" && (
                          <ArrowUpDown className={`h-4 w-4 ml-1 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("location")}>
                      <div className="flex items-center">
                        Location
                        {sortField === "location" && (
                          <ArrowUpDown className={`h-4 w-4 ml-1 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("barnCount")}>
                      <div className="flex items-center">
                        Barns
                        {sortField === "barnCount" && (
                          <ArrowUpDown className={`h-4 w-4 ml-1 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("stallCount")}>
                      <div className="flex items-center">
                        Stalls
                        {sortField === "stallCount" && (
                          <ArrowUpDown className={`h-4 w-4 ml-1 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("pigCount")}>
                      <div className="flex items-center">
                        Pigs
                        {sortField === "pigCount" && (
                          <ArrowUpDown className={`h-4 w-4 ml-1 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFarms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        No farms found. Try adjusting your search or add a new farm.
                      </td>
                    </tr>
                  ) : (
                    sortedFarms.map(farm => (
                      <tr key={farm._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full mr-3">
                              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-50">{farm.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.location}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.barnCount || 0}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.stallCount || 0}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.pigCount || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farm.isActive !== false
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
                            }`}>
                            {farm.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <SimpleButton
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/farms?edit=${farm._id}`)}
                          >
                            <PenSquare className="h-4 w-4" />
                          </SimpleButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </EnhancedActivityCard>
    </div>
  );
}
