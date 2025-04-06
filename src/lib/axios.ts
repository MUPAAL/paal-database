import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  // Only add token for browser environment
  if (typeof window !== 'undefined') {
    try {
      // Get token from our token API
      const tokenResponse = await fetch('/api/auth/token');
      const tokenData = await tokenResponse.json();

      if (tokenData.token) {
        config.headers.Authorization = `Bearer ${tokenData.token}`;
      }
    } catch (error) {
      console.error('Error fetching auth token:', error);
    }
  }

  return config;
});

export default api;