"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiClipboardList,
  HiSparkles,
  HiLogout,
} from "react-icons/hi";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageStore } from "@/stores/languageStore";

const items = [
  { href: "/dashboard", icon: HiHome, labelKey: "dashboard" },
  {
    href: "/checklist",
    icon: HiClipboardList,
    labelKey: "checklist",
    match: ["/checklist", "/monitoring", "/report"],
  },
  { href: "/kebersihan", icon: HiSparkles, labelKey: "kebersihan" },
];

function NavButton({
  active,
  href,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  onClick?: () => void;
}) {
  const inner = active ? (
    <span className="flex h-12 min-w-[7.5rem] items-center gap-2 rounded-full bg-white px-4 shadow-md sm:h-14 sm:min-w-[9rem] sm:px-5">
      <Icon className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
      {label && (
        <span className="font-paragraph text-xs font-semibold text-secondary-700 sm:text-sm">
          {label}
        </span>
      )}
    </span>
  ) : (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md sm:h-14 sm:w-14">
      <Icon className="h-5 w-5 text-secondary-700 sm:h-6 sm:w-6" />
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="shrink-0">
        {inner}
      </button>
    );
  }

  return (
    <Link href={href!} prefetch={false} className="shrink-0">
      {inner}
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
  const currentLanguage = useLanguageStore((s) => s.currentLanguage);

  const hidden =
    pathname.includes("/checklist/form") ||
    pathname.includes("/kebersihan/form") ||
    pathname.includes("/login");

  if (hidden) return null;

  const isActive = (href: string, match?: string[]) => {
    const paths = match ?? [href];
    return paths.some((p) => pathname.startsWith(p));
  };

  return (
    <div className="pointer-events-none fixed right-0 bottom-5 left-0 z-50 px-5 sm:bottom-12 sm:px-12 xl:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-2 sm:max-w-lg sm:gap-3">
        <nav className="flex flex-[0.64] items-center justify-between rounded-full bg-gray-100/95 px-1.5 py-1.5 shadow-lg backdrop-blur-sm sm:flex-[0.66] sm:px-2">
          {items.map((item) => {
            const active = isActive(item.href, item.match);
            return (
              <NavButton
                key={item.href}
                active={active}
                href={item.href}
                icon={item.icon}
                label={t(item.labelKey)}
              />
            );
          })}
        </nav>

        <nav className="flex flex-[0.36] items-center justify-between rounded-full bg-gray-100/95 px-1.5 py-1.5 shadow-lg backdrop-blur-sm sm:flex-[0.34] sm:px-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-secondary-700 shadow-md sm:h-14 sm:w-14 sm:text-base"
          >
            {currentLanguage.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-700 shadow-md sm:h-14 sm:w-14"
            aria-label={t("logout")}
          >
            <HiLogout className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
