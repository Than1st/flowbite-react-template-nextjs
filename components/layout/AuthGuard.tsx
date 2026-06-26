"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  // Render sama di server & client sampai mount — cegah hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
