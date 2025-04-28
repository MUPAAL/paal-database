"use client";

import { EnhancedActivityCard } from "@/components/ui/admin/EnhancedActivityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, useActivities } from "@/hooks/useActivities";
import { formatDistanceToNow } from "date-fns";

import {
  Activity as ActivityIcon,
  Box,
  Building2,
  Cpu,
  Home,
  Server,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

export default function RecentActivitySection() {
  const { activities, isLoading, error } = useActivities(10);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Get icon based on activity type
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />;
      case "farm":
        return <Building2 className="h-4 w-4 text-green-600 dark:text-green-300" />;
      case "system":
        return <Server className="h-4 w-4 text-purple-600 dark:text-purple-300" />;
      case "device":
        return <Cpu className="h-4 w-4 text-orange-600 dark:text-orange-300" />;
      case "pig":
        return <Box className="h-4 w-4 text-red-600 dark:text-red-300" />;
      case "barn":
        return <Home className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />;
    }
  };

  // Get color based on activity type
  const getActivityColor = (type: Activity["type"]): "blue" | "green" | "purple" | "orange" | "red" | "yellow" | "indigo" => {
    switch (type) {
      case "user":
        return "blue";
      case "farm":
        return "green";
      case "system":
        return "purple";
      case "device":
        return "orange";
      case "pig":
        return "red";
      case "barn":
        return "yellow";
      default:
        return "indigo";
    }
  };

  // Get background color based on activity type
  const getActivityBgColor = (type: Activity["type"]) => {
    switch (type) {
      case "user":
        return "bg-blue-100 dark:bg-blue-900/40";
      case "farm":
        return "bg-green-100 dark:bg-green-900/40";
      case "system":
        return "bg-purple-100 dark:bg-purple-900/40";
      case "device":
        return "bg-orange-100 dark:bg-orange-900/40";
      case "pig":
        return "bg-red-100 dark:bg-red-900/40";
      case "barn":
        return "bg-yellow-100 dark:bg-yellow-900/40";
      default:
        return "bg-gray-100 dark:bg-gray-900/40";
    }
  };

  // Get formatted time
  const getFormattedTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  const activityContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
                <ActivityIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="h-5 mb-2 flex items-center">
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="h-4 mb-1 flex items-center">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="h-3 flex items-center">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      // If it's an authentication error, still show the component but with a message
      if (error === 'Authentication required') {
        return (
          <div className="space-y-4">
            <div className="p-6 text-center">
              <p className="text-gray-500">Waiting for activity data...</p>
              <p className="text-xs text-gray-400 mt-1">Real-time updates will appear here</p>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500">No recent activities</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity._id}
            className="flex items-start space-x-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
              {activity.userId && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By {activity.userId.firstName} {activity.userId.lastName}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {getFormattedTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <EnhancedActivityCard
      title="System Events"
      subtitle="Recent activity across the platform"
      icon={<ActivityIcon />}
      color="orange"
      footer={
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            View all activities
          </button>
        </div>
      }
    >
      {activityContent()}
    </EnhancedActivityCard>
  );
}
