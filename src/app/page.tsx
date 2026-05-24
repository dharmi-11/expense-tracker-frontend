"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { isReady, token } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    router.replace(token ? "/dashboard" : "/login");
  }, [isReady, router, token]);

  return <div className="min-h-screen animate-pulse bg-transparent" />;
}
