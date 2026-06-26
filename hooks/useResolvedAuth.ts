"use client";

import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { normalizeUserData } from "@/lib/auth-user";
import { useAuth } from "@/hooks/useAuth";
import type { UserData } from "@/types";

/**
 * Auth + userData yang sudah dinormalisasi (userId, stasiun_id, dll.)
 */
export function useResolvedAuth() {
  const auth = useAuth();

  const userData = useMemo(() => {
    const fromStore = normalizeUserData(auth.userData);
    if (fromStore?.userId && fromStore.stasiun_id) return fromStore;

    if (auth.token) {
      try {
        const decoded = jwtDecode<Record<string, unknown>>(auth.token);
        const merged = normalizeUserData({
          ...(auth.userData ?? {}),
          ...decoded,
          // Prioritaskan stasiun yang sudah dipilih user
          stasiun_id: auth.userData?.stasiun_id ?? decoded.stasiun_id,
          stasiun_name: auth.userData?.stasiun_name ?? decoded.stasiun_name,
        });
        if (merged) return merged;
      } catch {
        // token non-JWT — lanjutkan dengan data store
      }
    }

    return fromStore;
  }, [auth.userData, auth.token]);

  const ready =
    !auth.loading && !!userData?.userId && !!userData?.stasiun_id;

  return {
    ...auth,
    userData: userData as UserData | null,
    ready,
    ssoToken: auth.loginData?.ssoToken,
  };
}
