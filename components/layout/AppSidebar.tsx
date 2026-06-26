"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiClipboardList,
  HiSparkles,
  HiLogout,
  HiGlobeAlt,
  HiMoon,
  HiSun,
} from "react-icons/hi";
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems, SidebarLogo } from "flowbite-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageStore } from "@/stores/languageStore";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { formatDisplayName } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: HiHome, labelKey: "dashboard" },
  { href: "/checklist", icon: HiClipboardList, labelKey: "checklist", match: ["/checklist", "/monitoring", "/report"] },
  { href: "/kebersihan", icon: HiSparkles, labelKey: "kebersihan" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { userData, logout } = useAuth();
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
  const currentLanguage = useLanguageStore((s) => s.currentLanguage);
  const { isDark, toggle: toggleTheme } = useThemeToggle();

  const isActive = (href: string, match?: string[]) => {
    const paths = match ?? [href];
    return paths.some((p) => pathname.startsWith(p));
  };

  return (
    <Sidebar aria-label="IMMAX sidebar" className="fixed top-0 left-0 z-40 h-screen w-64 border-r border-gray-200 max-xl:hidden dark:border-gray-700">
      <SidebarLogo href="/dashboard" img="/assets/immax-icon.png" imgAlt="IMMAX logo">
        IMMAX
      </SidebarLogo>
      <SidebarItems>
        <SidebarItemGroup>
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              as={Link}
              href={item.href}
              icon={item.icon}
              active={isActive(item.href, item.match)}
            >
              {t(item.labelKey)}
            </SidebarItem>
          ))}
        </SidebarItemGroup>
        <SidebarItemGroup className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {formatDisplayName(userData?.nama ?? userData?.username)}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userData?.stasiun_name}</p>
          </div>
          <SidebarItem onClick={toggleLanguage} icon={HiGlobeAlt}>
            {currentLanguage.toUpperCase()}
          </SidebarItem>
          <SidebarItem
            onClick={toggleTheme}
            icon={isDark ? HiSun : HiMoon}
          >
            {isDark ? t("theme_light") : t("theme_dark")}
          </SidebarItem>
          <SidebarItem onClick={logout} icon={HiLogout} className="text-red-600">
            {t("logout")}
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
