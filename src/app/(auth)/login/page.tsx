"use client";

import { Button } from "@/components/Button_S";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  // Pre-filled for testing
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Login form submitted with email:', email);

      // Direct API call to login
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('Login response:', response.data);

      // Store token and user info in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Also store token in cookies for server-side middleware
      document.cookie = `token=${response.data.token}; path=/; max-age=86400`;

      // Redirect based on role
      console.log('Login successful, redirecting based on role:', response.data.user.role);

      // Use window.location for a hard redirect instead of router.push
      // This ensures a complete page reload with the new authentication state
      if (response.data.user.role === "admin") {
        console.log('Redirecting admin to /admin');
        window.location.href = "/admin";
      } else {
        console.log('Redirecting farmer to /overview');
        window.location.href = "/overview";
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Background with modern gradient and animated shapes */}
      {/* Left side background - clean white */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-white overflow-hidden hidden lg:block">
        {/* Subtle background pattern */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5">
          <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-[20%] left-[25%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Right side background - lighter, more vibrant */}
      <div className="absolute inset-0 lg:inset-y-0 lg:left-1/2 lg:right-0 bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-800 overflow-hidden">
        {/* Animated background shapes for right side */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-[20%] right-[15%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[15%] right-[25%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        </div>
      </div>

      {/* Divider between left and right sides */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-gray-200/0 via-gray-200/70 to-gray-200/0 hidden lg:block z-10"></div>

      <div className="relative flex w-full flex-col lg:flex-row">
        {/* Left side - Minimalistic Brand/Logo section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 z-10">
          <div className="max-w-md mx-auto">
            <div className="mb-16">
              {/* Minimalistic logo */}
              <div className="mb-12">
                <h1 className="text-7xl font-bold text-blue-900 tracking-tight">PAAL</h1>
                <div className="h-1 w-16 bg-blue-500/60 my-6"></div>
                <p className="text-gray-600 text-xl font-light">
                  Agricultural Monitoring
                </p>
              </div>

              {/* Simple tagline */}
              <p className="text-gray-500 text-lg font-light leading-relaxed max-w-sm">
                Streamlined monitoring and management for modern agricultural operations
              </p>
            </div>

            {/* Minimalistic feature indicators */}
            <div className="mt-auto space-y-6">
              <div className="flex items-center space-x-3 text-gray-600 group">
                <div className="w-8 h-[1px] bg-blue-400/50 group-hover:w-12 transition-all duration-300"></div>
                <span className="text-sm uppercase tracking-wider font-light">Real-time Monitoring</span>
              </div>

              <div className="flex items-center space-x-3 text-gray-600 group">
                <div className="w-8 h-[1px] bg-blue-400/50 group-hover:w-12 transition-all duration-300"></div>
                <span className="text-sm uppercase tracking-wider font-light">Enterprise Security</span>
              </div>

              <div className="flex items-center space-x-3 text-gray-600 group">
                <div className="w-8 h-[1px] bg-blue-400/50 group-hover:w-12 transition-all duration-300"></div>
                <span className="text-sm uppercase tracking-wider font-light">Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
          <div className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-xl p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Welcome back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              {/* Sign in button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign in
                </Button>
              </div>
            </form>

            {/* Test accounts info */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Test accounts</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
                <div className="rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Admin</p>
                  <p className="text-gray-500 dark:text-gray-400">admin@test.com / admin123</p>
                </div>
                <div className="rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Farmer</p>
                  <p className="text-gray-500 dark:text-gray-400">farmer@test.com / farmer123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
