"use client";

import { useEffect } from "react";
import { ThemeProvider } from "flowbite-react";
import { immaxFlowbiteTheme } from "@/lib/theme";
import { useLanguageStore } from "@/stores/languageStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useLanguageStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemeProvider theme={immaxFlowbiteTheme}>{children}</ThemeProvider>
  );
}
