"use client";

import { Button } from "@/components/Button_S";
import { AdminPageHeader } from "@/components/ui/admin/AdminPageHeader";
import axios from "axios";
import { AlertTriangle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignFarmModal } from "../components/AssignFarmModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { UserTable } from "../components/UserTable";

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "farmer";
  assignedFarm: {
    _id: string;
    name: string;
    location: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Farm = {
  _id: string;
  name: string;
  location: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  // Fetch users and farms
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

        setUsers(usersResponse.data);
        setFarms(farmsResponse.data);
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
    role: "admin" | "farmer";
    password: string;
  }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Create user in our database
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add new user to state
      setUsers((prevUsers) => [...prevUsers, response.data]);

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
          user._id === selectedUser._id ? response.data : user
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
  const handleToggleActive = async (user: User) => {
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
          u._id === user._id ? response.data : u
        )
      );
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      setError(err.response?.data?.error || "Failed to update user status");
    }
  };

  // Delete user
  const handleDeleteUser = async (user: User) => {
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
  const handleOpenAssignModal = (user: User) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
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
    <div>
      <section aria-labelledby="user-management">
        <AdminPageHeader
          title="User Management"
          description="Manage user accounts and permissions"
          actionLabel="Create User"
          onAction={() => setIsCreateModalOpen(true)}
          icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />}
        />

        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <UserTable
            users={users}
            onAssignFarm={handleOpenAssignModal}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteUser}
            currentUserId={currentUser?._id || ""}
          />
        </div>
      </section>

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
    </div>
  );
}
