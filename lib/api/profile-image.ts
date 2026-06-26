import { extractSsoToken } from "@/lib/auth-user";

export type ProfileImageResult =
  | { ok: true; url: string }
  | { ok: false; tokenExpired: boolean; reason?: string };

const isSsoExpired = (status?: number) =>
  status === 401 || status === 403;

/**
 * Fetch foto profil — api.kai.id lewat proxy server (hindari CORS browser).
 */
export async function fetchProfileImageUrl(
  imageUrl: string | null | undefined,
  ssoToken?: string | { token?: string } | null,
): Promise<ProfileImageResult> {
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return { ok: false, tokenExpired: false, reason: "no_url" };
  }

  if (!imageUrl.includes("api.kai.id")) {
    return { ok: true, url: imageUrl };
  }

  const token = extractSsoToken(ssoToken);
  if (!token) {
    return { ok: false, tokenExpired: false, reason: "no_sso_token" };
  }

  try {
    const response = await fetch("/api/profile-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, ssoToken: token }),
    });

    if (!response.ok) {
      return {
        ok: false,
        tokenExpired: isSsoExpired(response.status),
        reason: `http_${response.status}`,
      };
    }

    const data = (await response.json()) as {
      dataUri?: string;
      direct?: boolean;
    };

    if (data.dataUri) {
      return { ok: true, url: data.dataUri };
    }

    return { ok: false, tokenExpired: false, reason: "empty_response" };
  } catch {
    return { ok: false, tokenExpired: false, reason: "network_error" };
  }
}
