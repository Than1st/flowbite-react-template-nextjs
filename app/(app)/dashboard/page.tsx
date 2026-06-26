"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusSummary } from "@/components/dashboard/StatusSummary";
import { CqiDashboard } from "@/components/dashboard/CqiDashboard";
import { UtilityDashboard } from "@/components/dashboard/UtilityDashboard";
import { NotificationList } from "@/components/dashboard/NotificationList";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const {
    loading,
    cqiLoading,
    error,
    statusCards,
    userActivity,
    consumption,
    notifications,
    cqiInfo,
    refresh,
  } = useDashboard();

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden sm:gap-3 xl:gap-5 p-4 sm:p-15 xl:p-8">
        <DashboardHeader />
        <StatusSummary data={statusCards} loading={loading} />

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3 xl:gap-5">
          <div className="flex min-h-0 flex-col gap-2 sm:gap-3">
            <div className="min-h-0 flex-[1.35]">
              <CqiDashboard data={cqiInfo} loading={cqiLoading} className="h-full" />
            </div>
            <div className="min-h-0 flex-[0.75]">
              <UtilityDashboard
                data={consumption}
                loading={loading}
                error={error}
                onRefresh={refresh}
                className="h-full"
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2 sm:gap-3">
            <div className="min-h-0 xl:flex-1">
              <NotificationList
                notifications={notifications}
                loading={loading}
                onRefresh={refresh}
                className="h-full"
              />
            </div>
            <div className="min-h-0 flex-[1.28] xl:flex-1">
              <UserInfoCard
                activity={userActivity}
                loading={loading}
                error={error}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
