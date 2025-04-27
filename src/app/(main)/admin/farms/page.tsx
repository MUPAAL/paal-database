"use client";

import { SimpleButton } from "@/components/SimpleButton";
import { AdminEmptyState } from "@/components/ui/admin/AdminEmptyState";
import { AdminFarmCard } from "@/components/ui/admin/AdminFarmCard";
import { AdminPageHeader } from "@/components/ui/admin/AdminPageHeader";
import api from "@/utils/api";
import { AlertTriangle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateFarmModal from "./CreateFarmModal";
import FarmDetailsModal from "./FarmDetailsModal";

type FarmType = {
  _id: string;
  name: string;
  location: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function FarmsPage() {
  const [farms, setFarms] = useState<FarmType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedFarm, setSelectedFarm] = useState<FarmType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const router = useRouter();

  // Fetch farms
  useEffect(() => {
    const fetchFarms = async () => {
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

        console.log('Fetching farms with token:', token.substring(0, 10) + '...');
        const response = await api.get("/api/farms");

        console.log('Farms API response:', response.status, response.statusText);
        console.log('Farms data:', response.data);

        // Ensure we have an array of farms
        const farmsData = Array.isArray(response.data) ? response.data : [];
        console.log('Processed farms data:', farmsData);

        setFarms(farmsData);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching farms:", err);
        setError(err.response?.data?.error || "Failed to fetch farms");
        setIsLoading(false);

        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }
    };

    fetchFarms();
  }, [router]);

  // Handle view farm
  const handleViewFarm = (farm: FarmType) => {
    console.log("View button clicked for farm:", farm);
    setSelectedFarm(farm);
    setModalMode("view");
    setIsModalOpen(true);
    console.log("Modal state updated - isOpen:", true, "mode:", "view", "selectedFarm:", farm.name);
  };

  // Handle edit farm
  const handleEditFarm = (farm: FarmType) => {
    console.log("Edit button clicked for farm:", farm);
    setSelectedFarm(farm);
    setModalMode("edit");
    setIsModalOpen(true);
    console.log("Modal state updated - isOpen:", true, "mode:", "edit", "selectedFarm:", farm.name);
  };

  // Handle create farm
  const handleCreateFarm = () => {
    setIsCreateModalOpen(true);
  };

  // Refresh farms after creating a new one
  const handleFarmCreated = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/farms");
      setFarms(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Error refreshing farms:", err);
      setError(err.response?.data?.error || "Failed to refresh farms");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section aria-labelledby="loading-state">
        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
              Loading Farms...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait while we load the data...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section aria-labelledby="error-message">
        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">Something went wrong</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <SimpleButton onClick={() => setError(null)}>Retry</SimpleButton>
          </div>
        </div>
      </section>
    );
  }

  // Main content
  return (
    <div>
      <section aria-labelledby="farm-management">
        <AdminPageHeader
          title="Farm Management"
          description="Manage farms and their settings"
          actionLabel="Add Farm"
          onAction={handleCreateFarm}
          icon={<Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />}
        />

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
      </section>

      {/* Farm Details Modal */}
      <FarmDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Modal close handler called');
          setIsModalOpen(false);
        }}
        farm={selectedFarm}
        mode={modalMode}
        onSuccess={handleFarmCreated}
      />

      {/* Create Farm Modal */}
      <CreateFarmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFarmCreated}
      />
    </div>
  );
}
