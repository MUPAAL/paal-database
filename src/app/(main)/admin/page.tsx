"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardSkeleton from "./dashboard/components/DashboardSkeleton";

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);

  return (
    <>
      <DashboardSkeleton />
    </>
  );
}
