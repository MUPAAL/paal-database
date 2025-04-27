"use client";

import { Button } from "@/components/Button_S";
import { Card } from "@/components/Card";
import api from "@/utils/api";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle,
  Server,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RecentActivitySection from "./components/RecentActivitySection";

// Define the dashboard stats type
type SystemMetrics = {
  server: {
    status: "healthy" | "warning" | "error";
    cpuUsage: string;
    memoryUsage: string;
    uptime: number;
    platform: string;
    hostname: string;
  };
  database: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    connectionString: string;
  };
  storage: {
    status: "healthy" | "warning" | "error";
    usage: string;
  };
  cpu: {
    status: "healthy" | "warning" | "error";
    usage: string;
    cores: number;
  };
  lastUpdated: string;
};

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalFarms: number;
  activeFarms: number;
  systemMetrics: SystemMetrics | null;
  lastUpdated: string;
};

export default function AdminDashboard() {
  // State variables
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalFarms: 0,
    activeFarms: 0,
    systemMetrics: null,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Get token and user from localStorage
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
          router.push("/login");
          return;
        }

        // Check if user is admin
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

        // Fetch users
        const usersResponse = await api.get(`/api/users`);

        // Fetch farms
        const farmsResponse = await api.get(`/api/farms`);

        // Fetch system metrics
        const systemResponse = await api.get(`/api/system/metrics`);

        // Calculate stats
        const users = usersResponse.data;
        const farms = farmsResponse.data;
        const systemMetrics = systemResponse.data;

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((user: any) => user.isActive).length,
          totalFarms: farms.length,
          activeFarms: farms.filter((farm: any) => farm.isActive !== false).length,
          systemMetrics: systemMetrics,
          lastUpdated: new Date().toISOString(),
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching stats:", err);
        setError(err.response?.data?.error || "Failed to fetch dashboard stats");
        setIsLoading(false);

        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }
    };

    fetchStats();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Loading Dashboard...</h2>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <Button onClick={() => setError(null)}>Retry</Button>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.activeUsers} active
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </Card>

        {/* Farms Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Farms</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalFarms}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.activeFarms} active
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full dark:bg-green-900">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </Card>

        {/* System Status Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
              <h3 className="text-2xl font-bold mt-1 flex items-center">
                {stats.systemMetrics?.server.status === "healthy" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                    Healthy
                  </>
                ) : stats.systemMetrics?.server.status === "warning" ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-1" />
                    Warning
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-1" />
                    Error
                  </>
                )}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <div className="flex items-center">
                  <span className="font-medium">Server:</span>
                  <span className="ml-1">{stats.systemMetrics?.server.status || "Unknown"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Database:</span>
                  <span className="ml-1">{stats.systemMetrics?.database.status || "Unknown"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Storage:</span>
                  <span className="ml-1">{stats.systemMetrics?.storage.status || "Unknown"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">CPU:</span>
                  <span className="ml-1">{stats.systemMetrics?.cpu.status || "Unknown"}</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900">
              <Server className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </Card>

        {/* Activity Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activity</p>
              <h3 className="text-2xl font-bold mt-1">Recent</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full dark:bg-orange-900">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Users Action */}
          <div
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/admin/users")}
          >
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium">Manage Users</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add, edit, or remove users
            </p>
          </div>

          {/* Farms Action */}
          <div
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/admin/farms")}
          >
            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-medium">Manage Farms</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add, edit, or remove farms
            </p>
          </div>

          {/* System Action */}
          <div
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/admin/system")}
          >
            <Server className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-medium">System Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure system settings
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <RecentActivitySection />
      </Card>
    </div>
  );
}
