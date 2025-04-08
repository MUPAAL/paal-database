"use client";

import { Card } from "@/components/Card";
import { SimpleButton } from "@/components/SimpleButton";
import api from "@/utils/api";
import { Building2, Plus } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Loading Farms...</h2>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <SimpleButton onClick={() => setError(null)} className="mt-4">Retry</SimpleButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Farm Management</h2>
          <SimpleButton
            onClick={() => {
              console.log("Add Farm button clicked");
              handleCreateFarm();
            }}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Farm
          </SimpleButton>
        </div>

        {/* Farms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm) => (
            <Card key={farm._id} className="overflow-hidden">
              <div className="p-4 flex">
                <div className="bg-green-100 p-3 rounded-full dark:bg-green-900 mr-4">
                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{farm.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {farm.location}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Created: {new Date(farm.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex mt-3 space-x-2">
                    <SimpleButton
                      variant="secondary"
                      className="text-sm py-1 px-2"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("View button clicked for farm:", farm.name);
                        handleViewFarm(farm);
                      }}
                    >
                      View
                    </SimpleButton>
                    <SimpleButton
                      variant="secondary"
                      className="text-sm py-1 px-2"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Edit button clicked for farm:", farm.name);
                        handleEditFarm(farm);
                      }}
                    >
                      Edit
                    </SimpleButton>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Empty State */}
          {farms.length === 0 && (
            <div className="col-span-full text-center p-8">
              <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Farms Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                There are no farms in the system yet.
              </p>
              <SimpleButton onClick={handleCreateFarm}>Add Your First Farm</SimpleButton>
            </div>
          )}
        </div>
      </Card>

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
