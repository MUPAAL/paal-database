"use client";

import { Card } from "@/components/Card";
import { SimpleButton } from "@/components/SimpleButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { AdminEmptyState } from "@/components/ui/admin/AdminEmptyState";
import { AdminFarmCard } from "@/components/ui/admin/AdminFarmCard";
import { AdminPageHeader } from "@/components/ui/admin/AdminPageHeader";
import api from "@/utils/api";
import {
  AlertTriangle,
  Building2,
  Home,
  LayoutGrid,
  Loader2,
  Plus,
  SlidersHorizontal,
  Table2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateFarmModal from "../CreateFarmModal";
import FarmDetailsModal from "../FarmDetailsModal";

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
  counts?: {
    barns: number;
    stalls: number;
    pigs: number;
    devices: number;
  };
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

export default function CombinedFarmsPage() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("management");
  
  // Farm management state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch farms data
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

        // Process farms data
        let farmsData = [];
        if (farmsResponse && farmsResponse.data) {
          farmsData = Array.isArray(farmsResponse.data) ? farmsResponse.data : [];
          console.log("Farms data loaded:", farmsData.length);
        } else {
          console.warn("No farms data received");
        }

        // Process barns data
        let barnsData = [];
        if (barnsResponse && barnsResponse.data) {
          barnsData = Array.isArray(barnsResponse.data) ? barnsResponse.data : [];
          console.log("Barns data loaded:", barnsData.length);
        } else {
          console.warn("No barns data received");
        }

        // Process stalls data
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

  // Farm management handlers
  const handleViewFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreateFarm = () => {
    setIsCreateModalOpen(true);
  };

  // Refresh farms after creating or editing
  const handleFarmUpdated = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/farms");
      const farmsData = Array.isArray(response.data) ? response.data : [];
      setFarms(farmsData);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error refreshing farms:", err);
      setError(err.response?.data?.error || "Failed to refresh farms");
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Farm Management</h1>
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
          <h1 className="text-2xl font-bold">Farm Management</h1>
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
      <div className="flex justify-between items-start mb-6">
        <AdminPageHeader
          title="Farm Management"
          description="Manage farms and view farm structure"
          actionLabel="Add Farm"
          onAction={handleCreateFarm}
          icon={<Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />}
        />
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

      {/* Tabs */}
      <Tabs defaultValue="management" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="management">Farm Management</TabsTrigger>
          <TabsTrigger value="overview">Farm Structure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management" className="mt-0">
          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farms.map((farm) => (
              <AdminFarmCard
                key={farm._id}
                farm={farm}
                onView={handleViewFarm}
                onEdit={handleEditFarm}
              />
            ))}

            {/* Add Farm Card */}
            <div 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
              onClick={handleCreateFarm}
            >
              <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-full mb-4">
                <Plus className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">Add New Farm</h3>
              <p className="text-sm text-gray-500 text-center">Create a new farm in the system</p>
            </div>

            {/* Empty State */}
            {farms.length === 0 && (
              <AdminEmptyState
                title="No Farms Found"
                description="There are no farms in the system yet."
                actionLabel="Add Your First Farm"
                onAction={handleCreateFarm}
                icon={<Building2 className="h-12 w-12 text-gray-300" />}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="overview" className="mt-0">
          {/* Farm Structure Overview - Will be implemented in the next step */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-center text-gray-500 py-8">Farm structure visualization will be implemented in the next step.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Farm Details Modal */}
      <FarmDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farm={selectedFarm}
        mode={modalMode}
        onSuccess={handleFarmUpdated}
      />

      {/* Create Farm Modal */}
      <CreateFarmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFarmUpdated}
      />
    </div>
  );
}
