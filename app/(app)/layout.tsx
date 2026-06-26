"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-col bg-transparent text-gray-900 dark:bg-dark-background dark:text-gray-100 xl:bg-background">
        <AppSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col xl:ml-64">
          <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 pb-[6rem] sm:px-4 sm:pt-4 sm:pb-[6.5rem] xl:px-8 xl:pt-8 xl:pb-8">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}
