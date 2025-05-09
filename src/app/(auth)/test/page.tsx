"use client";

import { Button } from "@/components/Button_S";
import { Card } from "@/components/Card";
import { useState } from "react";
import axios from "axios";

export default function TestPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      console.log('Testing API...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/test`);
      
      console.log('Test response:', response.data);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      console.error("API test error:", err);
      setError(err.message || "Failed to test API");
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectLogin = async () => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      console.log('Testing direct login...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email: "admin@test.com",
        password: "admin123"
      });
      
      console.log('Login response:', response.data);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      console.error("Login test error:", err);
      setError(err.message || "Failed to test login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">API Test Page</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test the API connection
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            <pre>{result}</pre>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={testApi}
            className="w-full"
            isLoading={isLoading}
            loadingText="Testing..."
          >
            Test API
          </Button>

          <Button
            onClick={testDirectLogin}
            className="w-full"
            isLoading={isLoading}
            loadingText="Testing..."
          >
            Test Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
