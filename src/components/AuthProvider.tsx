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

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          console.log('Found existing user data in localStorage');
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        console.log('No user data found in localStorage');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Redirect based on auth status and role
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/login"];
    const adminRoutes = ["/admin"];

    // If not logged in and trying to access protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login");
      return;
    }

    // If logged in and trying to access login page
    if (user && publicRoutes.includes(pathname)) {
      router.push("/overview");
      return;
    }

    // If farmer trying to access admin routes
    if (user && user.role === "farmer" && adminRoutes.some(route => pathname.startsWith(route))) {
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

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);

      // Redirect based on role
      if (response.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/overview");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
