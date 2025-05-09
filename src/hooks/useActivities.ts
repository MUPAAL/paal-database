import { socket } from '@/lib/socket';
import api from '@/utils/api';
import { useEffect, useState } from 'react';

export interface Activity {
  _id: string;
  type: 'user' | 'farm' | 'system' | 'pig' | 'device' | 'barn' | 'stall';
  action: string;
  description: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
}

export function useActivities(limit: number = 10) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found, skipping API call');
          setError('Authentication required');
          setIsLoading(false);
          return;
        }

        // Make API request with authentication
        const response = await api.get(`/api/activities?limit=${limit}`);
        setActivities(response.data);
      } catch (err: any) {
        console.error('Error fetching activities:', err);

        // Handle authentication errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Authentication required');
        } else {
          setError('Failed to fetch activities');
        }

        // Fallback to socket-only mode
        console.log('Falling back to socket-only mode for activities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  // Listen for real-time activity updates
  useEffect(() => {
    // Listen for individual activity events
    const handleNewActivity = (activity: Activity) => {
      setActivities(prev => {
        // Add the new activity to the beginning of the array
        const updated = [activity, ...prev];
        // Keep only the most recent activities up to the limit
        return updated.slice(0, limit);
      });
    };

    // Listen for bulk activity updates
    const handleActivitiesUpdate = (activities: Activity[]) => {
      setActivities(activities);
    };

    // Subscribe to activity events
    socket.on('activity', handleNewActivity);
    socket.on('recent_activities', handleActivitiesUpdate);

    // Request recent activities
    socket.emit('get_recent_activities', { limit });

    // Cleanup
    return () => {
      socket.off('activity', handleNewActivity);
      socket.off('recent_activities', handleActivitiesUpdate);
    };
  }, [limit]);

  return { activities, isLoading, error };
}
