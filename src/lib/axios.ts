import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use((config) => {
  // Only add token for browser environment
  if (typeof window !== 'undefined') {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error is due to authentication (401) or authorization (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.status);

      // Only redirect to login if we're in the browser
      if (typeof window !== 'undefined') {
        // Check if we're already on the login page to avoid redirect loops
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page due to auth error');

          // Clear token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Redirect to login page
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;