"use client";

import { Button } from "@/components/Button_S";
import type { ExtendedUser } from "@/components/ui/admin/UserTable";
import { UserTable } from "@/components/ui/admin/UserTable";
import { Permission } from "@/types/permissions";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignFarmModal } from "../components/AssignFarmModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { ManagePermissionsModal } from "../components/ManagePermissionsModal";
import { ManageRestrictionsModal } from "../components/ManageRestrictionsModal";

type Farm = {
  _id: string;
  name: string;
  location: string;
};

type Stall = {
  _id: string;
  name: string;
  farmId: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);

  const router = useRouter();

  // Fetch users, farms, and stalls
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
          if (userData.role !== "admin" && userData.role !== "Administrator") {
            router.push("/overview");
            return;
          }
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/login");
          return;
        }

        // Fetch users
        const usersResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch farms
        const farmsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/farms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch stalls
        const stallsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stalls`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Add mock permissions and restrictions for demo purposes
        // In a real implementation, these would come from the backend
        const enhancedUsers = usersResponse.data.map((user: ExtendedUser) => ({
          ...user,
          permissions: user.permissions || [],
          restrictedFarms: user.restrictedFarms || [],
          restrictedStalls: user.restrictedStalls || []
        }));

        setUsers(enhancedUsers);
        setFarms(farmsResponse.data);
        setStalls(stallsResponse.data || []);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to fetch data");
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

  // Create user
  const handleCreateUser = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password: string;
    permissions: Permission[];
  }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Create user in our database
      // In a real implementation, you would also send permissions
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          password: userData.password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add new user to state with permissions
      const newUser = {
        ...response.data,
        permissions: userData.permissions,
        restrictedFarms: [],
        restrictedStalls: []
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.error || "Failed to create user");
    }
  };

  // Assign farm to user
  const handleAssignFarm = async (farmId: string) => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedUser._id}`,
        {
          assignedFarm: farmId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user in state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? {
            ...response.data,
            permissions: selectedUser.permissions || [],
            restrictedFarms: selectedUser.restrictedFarms || [],
            restrictedStalls: selectedUser.restrictedStalls || []
          } : user
        )
      );

      setIsAssignModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error("Error assigning farm:", err);
      setError(err.response?.data?.error || "Failed to assign farm");
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user: ExtendedUser) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}`,
        {
          isActive: !user.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user in state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === user._id ? {
            ...response.data,
            permissions: user.permissions || [],
            restrictedFarms: user.restrictedFarms || [],
            restrictedStalls: user.restrictedStalls || []
          } : u
        )
      );
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      setError(err.response?.data?.error || "Failed to update user status");
    }
  };

  // Delete user
  const handleDeleteUser = async (user: ExtendedUser) => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove user from state
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  // Open assign farm modal
  const handleOpenAssignModal = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  // Open permissions modal
  const handleOpenPermissionsModal = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  // Open restrictions modal
  const handleOpenRestrictionsModal = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsRestrictionsModalOpen(true);
  };

  // Save user permissions
  const handleSavePermissions = async (userId: string, permissions: Permission[]) => {
    try {
      // In a real implementation, you would send this to the backend
      // For now, we'll just update the state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, permissions } : user
        )
      );
    } catch (err: any) {
      console.error("Error saving permissions:", err);
      setError("Failed to save permissions");
    }
  };

  // Save user restrictions
  const handleSaveRestrictions = async (
    userId: string,
    restrictedFarms: string[],
    restrictedStalls: string[]
  ) => {
    try {
      // In a real implementation, you would send this to the backend
      // For now, we'll just update the state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, restrictedFarms, restrictedStalls } : user
        )
      );
    } catch (err: any) {
      console.error("Error saving restrictions:", err);
      setError("Failed to save restrictions");
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
              Loading Users...
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
            <Button onClick={() => setError(null)}>Retry</Button>
          </div>
        </div>
      </section>
    );
  }

  // Main content
  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        User Management
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage user accounts, permissions, and access restrictions
      </p>

      {/* Create User button will be moved to the UserTable component */}

      <div className="mt-4 sm:mt-6">
        <UserTable
          users={users}
          onAssignFarm={handleOpenAssignModal}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteUser}
          onManagePermissions={handleOpenPermissionsModal}
          onManageRestrictions={handleOpenRestrictionsModal}
          currentUserId={currentUser?._id || ""}
          onCreateUser={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* Assign Farm Modal */}
      {selectedUser && (
        <AssignFarmModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleAssignFarm}
          farms={farms}
          currentFarmId={selectedUser.assignedFarm?._id || ""}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
        />
      )}

      {/* Manage Permissions Modal */}
      {selectedUser && (
        <ManagePermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => {
            setIsPermissionsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSave={handleSavePermissions}
        />
      )}

      {/* Manage Restrictions Modal */}
      {selectedUser && (
        <ManageRestrictionsModal
          isOpen={isRestrictionsModalOpen}
          onClose={() => {
            setIsRestrictionsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          farms={farms}
          stalls={stalls}
          onSave={handleSaveRestrictions}
        />
      )}
    </>
  );
}
