"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FarmsPage() {
  const router = useRouter();

  // Redirect to the unified farms page
  useEffect(() => {
    router.push("/admin/farms/unified");
  }, [router]);
  
  // Show loading indicator while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500">Redirecting to unified farm management...</p>
      </div>
    </div>
  );
}
