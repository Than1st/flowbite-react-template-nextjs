"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/stores/authStore";
import { parseStationsFromUser } from "@/lib/auth";
import { normalizeSsoToken, normalizeUserData } from "@/lib/auth-user";
import type { StationData, UserData } from "@/types";

export function useAuth() {
  const router = useRouter();
  const loginData = useAuthStore((s) => s.loginData);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);
  const setSession = useAuthStore((s) => s.setSession);
  const updateStation = useAuthStore((s) => s.updateStation);
  const logoutStore = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const logout = useCallback(() => {
    logoutStore();
    router.replace("/login");
  }, [logoutStore, router]);

  const saveLogin = useCallback(
    (token: string, userData: UserData, ssoToken?: unknown) => {
      const normalized = normalizeUserData(userData) ?? userData;
      setSession({
        token,
        userData: normalized,
        ssoToken: normalizeSsoToken(ssoToken),
      });
    },
    [setSession],
  );

  const selectStation = useCallback(
    (station: StationData) => {
      updateStation(station);
    },
    [updateStation],
  );

  const decodeTokenUser = (token: string): UserData => jwtDecode<UserData>(token);

  const getStations = (userData: UserData): StationData[] =>
    parseStationsFromUser(userData);

  return {
    loginData,
    userData: loginData?.userData ?? null,
    token: loginData?.token ?? null,
    loading: !initialized,
    isAuthenticated: !!loginData?.token,
    refresh: initialize,
    logout,
    saveLogin,
    selectStation,
    decodeTokenUser,
    getStations,
  };
}
