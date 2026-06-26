"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { HiHome, HiClipboardList, HiSparkles } from "react-icons/hi";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { formatDisplayName } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: HiHome, labelKey: "dashboard" },
  { href: "/checklist", icon: HiClipboardList, labelKey: "checklist" },
  { href: "/kebersihan", icon: HiSparkles, labelKey: "kebersihan" },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { userData } = useAuth();

  return (
    <Navbar fluid rounded className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 lg:hidden">
      <NavbarBrand as={Link} href="/dashboard">
        <span className="self-center text-xl font-semibold whitespace-nowrap text-secondary-700 dark:text-white">
          IMMAX
        </span>
      </NavbarBrand>
      <div className="hidden text-right text-xs sm:block">
        <p className="font-medium text-gray-900 dark:text-white">
          {formatDisplayName(userData?.nama ?? userData?.username)}
        </p>
        <p className="text-gray-500 dark:text-gray-400">{userData?.stasiun_name}</p>
      </div>
      <NavbarToggle />
      <NavbarCollapse>
        {navItems.map((item) => (
          <NavbarLink
            key={item.href}
            as={Link}
            href={item.href}
            active={pathname.startsWith(item.href)}
          >
            <item.icon className="mr-2 inline h-4 w-4" />
            {t(item.labelKey)}
          </NavbarLink>
        ))}
      </NavbarCollapse>
    </Navbar>
  );
}
