"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FarmsSkeleton from "./components/FarmsSkeleton";

export default function FarmsPage() {
  const router = useRouter();

  // Redirect to the unified farms page
  useEffect(() => {
    router.push("/admin/farms/unified");
  }, [router]);

  // Show skeleton loading state while redirecting
  return <FarmsSkeleton />;
}
