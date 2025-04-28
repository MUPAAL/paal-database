"use client";

import { Button } from "@/components/Button_S";
import { EnhancedActivityCard } from "@/components/ui/admin/EnhancedActivityCard";
import { Activity, useActivities } from "@/hooks/useActivities";
import { formatDistanceToNow } from "date-fns";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowLeft,
  Box,
  Building2,
  Cpu,
  Filter,
  Home,
  Search,
  Server,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AllActivitiesPage() {
  const router = useRouter();
  const { activities, isLoading, error } = useActivities(50); // Fetch more activities
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<Activity["type"] | "all">("all");

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

  // Filter activities based on search term and filter type
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === "" || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.userId && 
        (`${activity.userId.firstName} ${activity.userId.lastName}`).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || activity.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Error state
  if (error && error !== 'Authentication required') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">System Activities</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">System Activities</h1>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as Activity["type"] | "all")}
            >
              <option value="all">All Types</option>
              <option value="user">User</option>
              <option value="farm">Farm</option>
              <option value="system">System</option>
              <option value="device">Device</option>
              <option value="pig">Pig</option>
              <option value="barn">Barn</option>
            </select>
          </div>
        </div>
      </div>

      <EnhancedActivityCard
        title="All System Events"
        subtitle="Complete history of system activities"
        icon={<ActivityIcon />}
        color="orange"
        footer={
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Showing {filteredActivities.length} of {activities.length} activities
            </span>
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No activities found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {filteredActivities.map((activity) => (
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
        )}
      </EnhancedActivityCard>
    </div>
  );
}
