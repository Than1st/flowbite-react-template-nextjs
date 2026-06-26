"use client";

import { Badge } from "flowbite-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDisplayName } from "@/lib/auth";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showStation?: boolean;
}

export function PageHeader({ title, subtitle, showStation = true }: PageHeaderProps) {
  const { userData } = useAuth();

  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {showStation && userData?.stasiun_name && (
        <Badge color="info" size="lg" className="w-fit">
          {userData.stasiun_name}
        </Badge>
      )}
    </div>
  );
}

export function WelcomeHeader({ welcomeText }: { welcomeText: string }) {
  const { userData } = useAuth();
  const name = formatDisplayName(userData?.nama ?? userData?.username);

  return (
    <PageHeader
      title={`${welcomeText}, ${name}`}
      showStation
    />
  );
}
