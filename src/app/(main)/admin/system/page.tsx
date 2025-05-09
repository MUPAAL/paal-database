"use client";

import { Button } from "@/components/Button_S";
import { Card } from "@/components/Card";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BackupRestoreSection from "./components/BackupRestoreSection";
import MaintenanceSection from "./components/MaintenanceSection";
import SystemLogsSection from "./components/SystemLogsSection";
import SystemSkeleton from "./components/SystemSkeleton";

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

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch system metrics
  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        setIsLoading(true);
        setShowSkeleton(true);

        // Record the start time to ensure minimum loading duration
        const startTime = Date.now();

        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!user || !token) {
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

        // Fetch system metrics from API
        const response = await axios.get(
          `/api/system/metrics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMetrics(response.data);

        // Calculate elapsed time and ensure minimum loading time of 1 second
        const elapsedTime = Date.now() - startTime;
        const minimumLoadingTime = 1000; // 1 second in milliseconds

        if (elapsedTime < minimumLoadingTime) {
          // If less than minimum time has passed, wait for the remainder
          const remainingTime = minimumLoadingTime - elapsedTime;
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setIsLoading(false);

        // Add a small delay before hiding the skeleton to ensure smooth transition
        setTimeout(() => {
          setShowSkeleton(false);
        }, 50);
      } catch (err: any) {
        console.error("Error fetching system metrics:", err);
        setError(err.response?.data?.error || "Failed to fetch system metrics");
        setIsLoading(false);
        setShowSkeleton(false);

        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }
    };

    fetchSystemMetrics();
  }, [router]);

  const refreshStatus = async () => {
    try {
      setIsLoading(true);
      setShowSkeleton(true);

      // Record the start time to ensure minimum loading duration
      const startTime = Date.now();

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch system metrics from API
      const response = await axios.get(
        `/api/system/metrics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMetrics(response.data);

      // Calculate elapsed time and ensure minimum loading time of 1 second
      const elapsedTime = Date.now() - startTime;
      const minimumLoadingTime = 1000; // 1 second in milliseconds

      if (elapsedTime < minimumLoadingTime) {
        // If less than minimum time has passed, wait for the remainder
        const remainingTime = minimumLoadingTime - elapsedTime;
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setIsLoading(false);

      // Add a small delay before hiding the skeleton to ensure smooth transition
      setTimeout(() => {
        setShowSkeleton(false);
      }, 50);
    } catch (err: any) {
      console.error("Error refreshing system metrics:", err);
      setError(err.response?.data?.error || "Failed to refresh system metrics");
      setIsLoading(false);
      setShowSkeleton(false);
    }
  };

  const getStatusIcon = (status: "healthy" | "warning" | "error" | undefined) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: "healthy" | "warning" | "error" | undefined) => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "warning":
        return "Warning";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  // Format uptime to human-readable format
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (showSkeleton) {
    return <SystemSkeleton />;
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <Button onClick={() => setError(null)} className="mt-4">Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">System Status</h2>
          <Button
            onClick={refreshStatus}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Last updated: {metrics ? new Date(metrics.lastUpdated).toLocaleString() : "Never"}
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Server</h3>
                <div className="flex items-center mt-1">
                  {getStatusIcon(metrics?.server.status)}
                  <span className="ml-1 text-sm">{getStatusText(metrics?.server.status)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>CPU Usage: {metrics?.server.cpuUsage || "0"}%</p>
                  <p>Memory Usage: {metrics?.server.memoryUsage || "0"}%</p>
                  <p>Uptime: {metrics?.server.uptime ? formatUptime(metrics.server.uptime) : "Unknown"}</p>
                  <p>Platform: {metrics?.server.platform || "Unknown"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full dark:bg-green-900">
                <Database className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Database</h3>
                <div className="flex items-center mt-1">
                  {getStatusIcon(metrics?.database.status)}
                  <span className="ml-1 text-sm">{getStatusText(metrics?.database.status)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Response Time: {metrics?.database.responseTime || "0"}ms</p>
                  <p>Connection: {metrics?.database.connectionString || "Unknown"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full dark:bg-yellow-900">
                <HardDrive className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Storage</h3>
                <div className="flex items-center mt-1">
                  {getStatusIcon(metrics?.storage.status)}
                  <span className="ml-1 text-sm">{getStatusText(metrics?.storage.status)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Disk Usage: {metrics?.storage.usage || "0"}%</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full dark:bg-purple-900">
                <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">CPU</h3>
                <div className="flex items-center mt-1">
                  {getStatusIcon(metrics?.cpu.status)}
                  <span className="ml-1 text-sm">{getStatusText(metrics?.cpu.status)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>CPU Usage: {metrics?.cpu.usage || "0"}%</p>
                  <p>Cores: {metrics?.cpu.cores || "0"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">System Settings</h2>

        <div className="space-y-6">
          {/* Backup & Restore Section */}
          <BackupRestoreSection />

          {/* Maintenance Section */}
          <MaintenanceSection />

          {/* System Logs Section */}
          <SystemLogsSection />
        </div>
      </Card>
    </div>
  );
}
