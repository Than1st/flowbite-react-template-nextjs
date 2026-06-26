"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProfileImageUrl } from "@/lib/api/profile-image";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";

export function useProfileImage(imageUrl?: string | null) {
  const { ssoToken, userData } = useResolvedAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  const resolvedUrl = imageUrl ?? userData?.image ?? null;

  const load = useCallback(async () => {
    if (!resolvedUrl) {
      setSrc(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setTokenExpired(false);

    const result = await fetchProfileImageUrl(resolvedUrl, ssoToken);
    if (result.ok) {
      setSrc((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return result.url;
      });
    } else {
      setSrc(null);
      if (result.tokenExpired) setTokenExpired(true);
    }
    setLoading(false);
  }, [resolvedUrl, ssoToken]);

  useEffect(() => {
    load();
    return () => {
      setSrc((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [load]);

  return { src, loading, tokenExpired, refresh: load };
}
