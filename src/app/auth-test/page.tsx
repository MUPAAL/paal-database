"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

export default function AuthTestPage() {
  const { user, isLoading } = useAuth();
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [localStorageUser, setLocalStorageUser] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    // Check localStorage
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setLocalStorageToken(token);
    setLocalStorageUser(userData);

    // Check cookies
    const tokenFromCookie = getCookie("token");
    setCookieToken(tokenFromCookie);

    // Call the API to check authentication
    const checkAuth = async () => {
      setApiLoading(true);
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        setApiResponse(data);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setApiLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
        <p className="mb-2">Loading: {isLoading ? "Yes" : "No"}</p>
        <p className="mb-2">User: {user ? "Authenticated" : "Not Authenticated"}</p>
        {user && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Local Storage</h2>
        <p className="mb-2">Token: {localStorageToken ? "Present" : "Not Present"}</p>
        {localStorageToken && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-sm font-mono break-all">{localStorageToken}</p>
          </div>
        )}
        <p className="mb-2 mt-4">User Data: {localStorageUser ? "Present" : "Not Present"}</p>
        {localStorageUser && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(localStorageUser), null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <p className="mb-2">Token: {cookieToken ? "Present" : "Not Present"}</p>
        {cookieToken && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-sm font-mono break-all">{cookieToken}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">API Authentication Check</h2>
        <p className="mb-2">Loading: {apiLoading ? "Yes" : "No"}</p>
        <p className="mb-2">API Response: {apiResponse ? "Received" : "Not Received"}</p>
        {apiResponse && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            // Force refresh auth state
            window.location.reload();
          }}
        >
          Refresh Page
        </button>

        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={() => {
            // Clear all auth data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.reload();
          }}
        >
          Clear Auth Data
        </button>

        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={() => {
            // Set a test cookie
            document.cookie = "test-cookie=test-value; path=/";
            window.location.reload();
          }}
        >
          Set Test Cookie
        </button>
      </div>
    </div>
  );
}
