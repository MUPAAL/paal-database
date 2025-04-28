"use client";

import { Button } from "@/components/Button_S";
import { EnhancedActionCard } from "@/components/ui/admin/EnhancedActionCard";
import { EnhancedAdminCard } from "@/components/ui/admin/EnhancedAdminCard";
import api from "@/utils/api";
import {
  Activity,
  AlertTriangle,
  Building2,
  ChevronRight,
  Server,
  Settings,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSkeleton from "./components/DashboardSkeleton";
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
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <section
        aria-labelledby="error-message"
        className="animate-fade-in"
      >
        <h1
          id="error-message"
          className="scroll-mt-10 text-xl font-semibold text-gray-900 dark:text-gray-50"
        >
          Error
        </h1>
        <div className="mt-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col items-center justify-center py-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">Something went wrong</h2>
              <p className="text-red-500 mb-6">{error}</p>
              <Button onClick={() => setError(null)}>Retry</Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Main dashboard
  return (
    <div className="animate-fade-in">
      <section aria-labelledby="current-status">
        <div className="flex items-center justify-between mb-6">
          <h1
            id="current-status"
            className="scroll-mt-10 text-2xl font-bold text-gray-900 dark:text-gray-50"
          >
            Admin Dashboard
          </h1>
          <button
            onClick={() => router.push('/admin/system')}
            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Users Card */}
          <EnhancedAdminCard
            title="User Metrics"
            subtitle="Active and inactive users"
            value={stats.totalUsers}
            valueDescription="total users"
            data={[
              {
                title: "Active Users",
                current: stats.activeUsers,
                allowed: stats.totalUsers,
                percentage: stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0
              },
              {
                title: "Inactive Users",
                current: stats.totalUsers - stats.activeUsers,
                allowed: stats.totalUsers,
                percentage: stats.totalUsers > 0 ? ((stats.totalUsers - stats.activeUsers) / stats.totalUsers) * 100 : 0
              }
            ]}
            icon={<Users />}
            color="blue"
            ctaDescription="Manage user accounts."
            ctaText="View users"
            ctaLink="/admin/users"
            onClick={() => router.push("/admin/users")}
          />

          {/* Farms Card */}
          <EnhancedAdminCard
            title="Farm Metrics"
            subtitle="Active and inactive farms"
            value={stats.totalFarms}
            valueDescription="total farms"
            data={[
              {
                title: "Active Farms",
                current: stats.activeFarms,
                allowed: stats.totalFarms,
                percentage: stats.totalFarms > 0 ? (stats.activeFarms / stats.totalFarms) * 100 : 0
              },
              {
                title: "Inactive Farms",
                current: stats.totalFarms - stats.activeFarms,
                allowed: stats.totalFarms,
                percentage: stats.totalFarms > 0 ? ((stats.totalFarms - stats.activeFarms) / stats.totalFarms) * 100 : 0
              }
            ]}
            icon={<Building2 />}
            color="green"
            ctaDescription="Manage farm settings."
            ctaText="View farms"
            ctaLink="/admin/farms"
            onClick={() => router.push("/admin/farms")}
          />

          {/* System Status Card */}
          <EnhancedAdminCard
            title="System Status"
            subtitle="Server performance metrics"
            change={stats.systemMetrics?.server.status === "healthy" ? "Healthy" :
              stats.systemMetrics?.server.status === "warning" ? "Warning" : "Error"}
            value={stats.systemMetrics?.server.status === "healthy" ? "100%" :
              stats.systemMetrics?.server.status === "warning" ? "75%" : "25%"}
            valueDescription="system health"
            data={[
              {
                title: "Server",
                current: stats.systemMetrics?.server.status === "healthy" ? 100 :
                  stats.systemMetrics?.server.status === "warning" ? 75 : 25,
                allowed: 100,
                percentage: stats.systemMetrics?.server.status === "healthy" ? 100 :
                  stats.systemMetrics?.server.status === "warning" ? 75 : 25
              },
              {
                title: "Database",
                current: stats.systemMetrics?.database.status === "healthy" ? 100 :
                  stats.systemMetrics?.database.status === "warning" ? 75 : 25,
                allowed: 100,
                percentage: stats.systemMetrics?.database.status === "healthy" ? 100 :
                  stats.systemMetrics?.database.status === "warning" ? 75 : 25
              },
              {
                title: "Storage",
                current: stats.systemMetrics?.storage.status === "healthy" ? 100 :
                  stats.systemMetrics?.storage.status === "warning" ? 75 : 25,
                allowed: 100,
                percentage: stats.systemMetrics?.storage.status === "healthy" ? 100 :
                  stats.systemMetrics?.storage.status === "warning" ? 75 : 25
              },
              {
                title: "CPU",
                current: stats.systemMetrics?.cpu.status === "healthy" ? 100 :
                  stats.systemMetrics?.cpu.status === "warning" ? 75 : 25,
                allowed: 100,
                percentage: stats.systemMetrics?.cpu.status === "healthy" ? 100 :
                  stats.systemMetrics?.cpu.status === "warning" ? 75 : 25
              }
            ]}
            icon={<Server />}
            color="purple"
            ctaDescription="View system details."
            ctaText="View details"
            ctaLink="/admin/system"
            onClick={() => router.push("/admin/system")}
          />

          {/* Activity Card */}
          <EnhancedAdminCard
            title="Activity Overview"
            subtitle="User and system events"
            value="Recent"
            valueDescription="system activity"
            data={[
              {
                title: "User Activity",
                current: 100,
                allowed: 100,
                percentage: 100
              },
              {
                title: "System Events",
                current: 100,
                allowed: 100,
                percentage: 100
              }
            ]}
            icon={<Activity />}
            color="orange"
            ctaDescription={`Last updated: ${new Date(stats.lastUpdated).toLocaleTimeString()}`}
          />
        </div>
      </section>

      <section aria-labelledby="quick-actions" className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="quick-actions"
            className="scroll-mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50"
          >
            Quick Actions
          </h2>
          <button
            onClick={() => router.push('/admin/system')}
            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EnhancedActionCard
            title="Manage Users"
            description="Add, edit, or remove users from the system. Manage permissions and access control."
            icon={<Users />}
            color="blue"
            onClick={() => router.push("/admin/users")}
          />
          <EnhancedActionCard
            title="Manage Farms"
            description="Add, edit, or remove farms from the system. Configure farm settings and locations."
            icon={<Building2 />}
            color="green"
            onClick={() => router.push("/admin/farms")}
          />
          <EnhancedActionCard
            title="System Settings"
            description="Configure system settings and preferences. Manage backups and system maintenance."
            icon={<Server />}
            color="purple"
            onClick={() => router.push("/admin/system")}
          />
        </div>
      </section>

      <section aria-labelledby="recent-activity" className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="recent-activity"
            className="scroll-mt-8 text-xl font-semibold text-gray-900 dark:text-gray-50"
          >
            Recent Activity
          </h2>
          <button
            onClick={() => router.push('/admin/activities')}
            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View all activities</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <RecentActivitySection />
        </div>
      </section>
    </div>
  );
}
