"use client";

import { Button } from "@/components/Button_S";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
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
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      // Direct API call
      console.log('Making API call to:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`);
      console.log('With payload:', { email, password });

      // Set specific headers to ensure we get JSON back
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add a timeout
        timeout: 10000
      }).catch(apiError => {
        console.error('API call error:', apiError);

        // Check if the response is HTML instead of JSON
        if (apiError.response?.headers?.['content-type']?.includes('text/html')) {
          console.error('Received HTML response instead of JSON');
          const htmlResponse = apiError.response.data;
          console.error('HTML response preview:', htmlResponse.substring(0, 200));
        } else {
          console.error('Error response:', apiError.response?.data);
        }

        throw apiError;
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      console.log('Login response data:', response.data);

      // Store token and user info in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect based on role
      if (response.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/overview");
      }

      console.log('Login successful');
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">PAAL Monitoring System</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to your account
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Test accounts: admin@test.com / admin123 or farmer@test.com / farmer123
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
