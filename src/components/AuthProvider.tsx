"use client";

import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

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
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      // Check localStorage first
      let token = localStorage.getItem("token");
      let userData = localStorage.getItem("user");

      // If token is not in localStorage, check cookies
      if (!token) {
        token = getCookie("token");
        console.log('Token from cookie:', token ? 'Found' : 'Not found');

        // If token is in cookie but not in localStorage, store it in localStorage
        if (token && !localStorage.getItem("token")) {
          localStorage.setItem("token", token);
          console.log('Stored token from cookie to localStorage');
        }
      }

      if (token && userData) {
        try {
          console.log('Found existing user data in localStorage');
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser);

          // For client-side, we'll just use the parsed user data directly
          // This avoids making API calls that might fail in server environments
          console.log('Using parsed user data from localStorage');
          setUser(parsedUser);

          // Optionally, we can validate the token on the client side
          // but only for additional security, not as a requirement
          try {
            console.log('Validating token in background...');
            fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
              cache: 'no-store'
            }).then(response => {
              if (response.ok) {
                return response.json();
              } else {
                console.warn('Token validation response not OK:', response.status, response.statusText);
                // Don't throw an error, just return null to continue using the cached user data
                return null;
              }
            }).then(data => {
              if (data) {
                console.log('Token validated successfully');
                // Update user data if needed
                if (JSON.stringify(data.user) !== JSON.stringify(parsedUser)) {
                  console.log('Updating user data from validation');
                  setUser(data.user);
                  localStorage.setItem('user', JSON.stringify(data.user));
                }
              }
            }).catch(error => {
              console.warn('Background token validation failed:', error);
              // We don't log out the user here, just log a warning
            });
          } catch (validationError) {
            console.warn('Error setting up token validation:', validationError);
            // Continue using the parsed user data
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        console.log('No user data found in localStorage');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Handle errors from async function
  const handleAsyncError = (error: any) => {
    console.error("Async error:", error);
  };

  // Redirect based on auth status and role
  useEffect(() => {
    if (isLoading) return;

    // Extract the base path without query parameters
    const basePath = pathname.split('?')[0];
    console.log('Current path:', pathname, 'Base path:', basePath);

    // Check if there's a 'from' parameter in the URL
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const fromPath = searchParams.get('from');
    console.log('From path:', fromPath);

    const publicRoutes = ["/login"];
    const adminRoutes = ["/admin"];

    // If not logged in and trying to access protected route
    if (!user && !publicRoutes.includes(basePath) && !basePath.startsWith('/api/')) {
      console.log('Not logged in and trying to access protected route:', basePath);
      router.push("/login");
      return;
    }

    // If logged in and trying to access login page
    if (user && publicRoutes.includes(basePath)) {
      console.log('Logged in and trying to access login page');
      // If there's a 'from' parameter, redirect to that path
      if (fromPath) {
        console.log('Redirecting to:', fromPath);
        router.push(fromPath);
      } else {
        // Otherwise, redirect to the default page based on role
        const defaultPath = user.role === 'admin' ? '/admin' : '/overview';
        console.log('Redirecting to default path:', defaultPath);
        router.push(defaultPath);
      }
      return;
    }

    // If farmer trying to access admin routes
    if (user && user.role === "farmer" && adminRoutes.some(route => basePath.startsWith(route))) {
      console.log('Farmer trying to access admin routes, redirecting to overview');
      router.push("/overview");
      return;
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      // Make sure we're using the correct URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log('Using API URL:', apiUrl);

      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);

      // Store token and user data in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Also store token in cookies for server-side middleware
      // Use a simpler cookie format to ensure compatibility
      document.cookie = `token=${response.data.token}; path=/; max-age=86400`;
      console.log('Set token cookie directly:', `token=${response.data.token.substring(0, 20)}...`);

      // Also use the API to set the cookie (more reliable for Next.js)
      try {
        const cookieResponse = await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: response.data.token }),
        });

        if (cookieResponse.ok) {
          console.log('Set token cookie via API successfully');
        } else {
          console.warn('Failed to set token cookie via API');
        }
      } catch (cookieError) {
        console.error('Error setting token cookie via API:', cookieError);
      }

      setUser(response.data.user);

      // Add a small delay before redirecting to ensure state is updated
      setTimeout(() => {
        // Redirect based on role
        if (response.data.user.role === "admin") {
          console.log('Redirecting admin to /admin');
          router.push("/admin");
        } else {
          console.log('Redirecting farmer to /overview');
          router.push("/overview");
        }
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || "Login failed");
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    console.log('Cleared token cookie');

    // Update state
    setUser(null);

    // Redirect to login
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
