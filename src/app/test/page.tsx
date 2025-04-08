"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    setMessage("Test page loaded successfully!");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-8 text-white">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Test Page</h1>
        <p className="text-gray-600">{message}</p>
        <div className="mt-6">
          <button
            onClick={() => window.location.href = "/overview"}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Go to Overview
          </button>
        </div>
      </div>
    </div>
  );
}
