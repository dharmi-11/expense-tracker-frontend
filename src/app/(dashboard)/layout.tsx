"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isReady, token } = useAuth();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/login");
    }
  }, [isReady, router, token]);

  if (!isReady || !token) {
    return (
      <div className="min-h-screen px-6 py-6">
        <LoadingSkeleton className="mx-auto h-[80vh] max-w-7xl rounded-[32px]" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
