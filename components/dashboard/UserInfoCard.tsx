"use client";

import Image from "next/image";
import { HiUserGroup } from "react-icons/hi2";
import {
  HiCheckBadge,
  HiClipboardDocumentCheck,
  HiUser,
  HiWrench,
} from "react-icons/hi2";
import { Spinner } from "flowbite-react";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDisplayName } from "@/lib/auth";
import type { UserActivityData } from "@/types/dashboard";

interface UserInfoCardProps {
  activity: UserActivityData | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

function StatCard({
  icon,
  value,
  label,
  iconClass,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconClass: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm sm:h-11 sm:w-11 ${iconClass}`}>
        {icon}
      </div>
      <p className="mt-1 font-heading text-base font-bold text-white sm:mt-2 sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[8px] font-medium leading-tight whitespace-pre-line text-white/90 sm:mt-1 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

export function UserInfoCard({ activity, loading, error, className }: UserInfoCardProps) {
  const { t } = useTranslation();
  const { userData } = useResolvedAuth();
  const imageUrl = activity?.image ?? userData?.image;
  const { src: profileSrc, loading: imageLoading } = useProfileImage(imageUrl);

  const displayName = formatDisplayName(
    userData?.nama ?? activity?.nama ?? userData?.username ?? activity?.username,
  );

  const overlay = (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(134,147,190,0.35) 0%, rgba(42,39,104,0.55) 45%, #2A2768 100%)",
      }}
    />
  );

  if (loading) {
    return (
      <div
        className={`relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg xl:min-h-[420px] xl:rounded-xl ${className ?? ""}`}
      >
        <Image
          src="/assets/image/background.png"
          alt=""
          fill
          className="object-cover grayscale"
        />
        {overlay}
        <Spinner size="xl" color="purple" className="relative z-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl p-6 text-center shadow-lg xl:min-h-[420px] xl:rounded-xl ${className ?? ""}`}
      >
        <Image src="/assets/image/background.png" alt="" fill className="object-cover" />
        {overlay}
        <p className="relative rounded-lg bg-white px-4 py-2 font-medium text-gray-900">
          {t("error_loading_data")}
        </p>
        <p className="relative mt-2 text-sm text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full min-h-0 overflow-hidden rounded-2xl shadow-lg xl:min-h-[420px] xl:rounded-xl ${className ?? ""}`}
    >
      <Image
        src="/assets/image/background.png"
        alt=""
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center px-2.5 py-3 sm:px-5 sm:py-5">
        {overlay}
        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/20 sm:h-24 sm:w-24">
            {imageLoading ? (
              <Spinner size="lg" color="info" />
            ) : profileSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileSrc}
                alt={displayName}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <HiUser className="h-10 w-10 text-white/70 sm:h-12 sm:w-12" />
            )}
          </div>

          <div className="mt-2 flex items-center justify-center gap-1">
            <h3 className="font-heading text-sm font-bold capitalize text-white sm:text-xl">
              {displayName}
            </h3>
            <HiCheckBadge className="h-4 w-4 shrink-0 text-white sm:h-5 sm:w-5" />
          </div>
          <p className="mt-0.5 w-full text-center font-paragraph text-xs font-medium text-white/95 sm:text-base">
            {userData?.nipp ?? activity?.nipp ?? "-"}
          </p>
          <p className="mt-0.5 line-clamp-2 w-full max-w-full px-1 text-center text-[9px] font-semibold leading-tight text-white/85 sm:text-xs">
            {(userData as { posisi?: string })?.posisi ??
              activity?.posisi ??
              userData?.roleName ??
              "-"}
          </p>
        </div>

        <div className="relative z-10 w-full shrink-0 rounded-2xl border border-white/20 bg-secondary-700/55 p-2.5 backdrop-blur-sm sm:p-4">
          <div className="mb-2 flex items-center justify-between sm:mb-4">
            <h4 className="font-heading text-xs font-semibold text-white sm:text-lg">
              {t("user_activity")}
            </h4>
            <HiUserGroup className="h-4 w-4 text-white/90 sm:h-5 sm:w-5" />
          </div>
          <div className="mb-2 h-px bg-white/30 sm:mb-4" />
          <div className="flex justify-between gap-2 sm:gap-3">
            <StatCard
              icon={<HiClipboardDocumentCheck className="h-4 w-4 text-green-700 sm:h-5 sm:w-5" />}
              value={activity?.activity?.totalChecklist ?? 0}
              label={t("total_checklist")}
              iconClass=""
            />
            <StatCard
              icon={<HiWrench className="h-4 w-4 text-light sm:h-5 sm:w-5" />}
              value={activity?.activity?.closedIssues ?? 0}
              label={t("closed_issue")}
              iconClass=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
