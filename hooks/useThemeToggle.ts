"use client";

import { useThemeMode } from "flowbite-react";

export function useThemeToggle() {
  const { mode, computedMode, setMode, toggleMode } = useThemeMode();
  const isDark = computedMode === "dark";

  const toggle = () => {
    toggleMode();
  };

  return { mode, computedMode, isDark, setMode, toggle };
}
