import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      hasToken: !!token
    });

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data
    });

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
