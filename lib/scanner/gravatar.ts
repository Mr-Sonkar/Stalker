import crypto from "crypto";
import { AccountExposure } from "./types";

export function getEmailSha256(email: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function getEmailMd5(email: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto.createHash("md5").update(normalized).digest("hex");
}

export async function checkGravatarExposure(email: string): Promise<AccountExposure> {
  const hash = getEmailSha256(email);
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;

  try {
    const avatarRes = await fetch(avatarUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3500),
    });

    if (avatarRes.status === 200) {
      // Try to fetch public profile JSON if available
      const profileRes = await fetch(`https://api.gravatar.com/v3/profiles/${hash}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      }).catch(() => null);

      let profileData = null;
      if (profileRes && profileRes.ok) {
        profileData = await profileRes.json().catch(() => null);
      }

      return {
        platform: "Gravatar / Automattic",
        category: "avatar",
        isExposed: true,
        avatarUrl: `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`,
        profileUrl: profileData?.profile_url || `https://gravatar.com/${hash}`,
        details: profileData?.display_name
          ? `Public profile found under name "${profileData.display_name}". Avatar image is publicly queryable via email hash.`
          : "Public avatar image is exposed and linked to this email address.",
      };
    }
  } catch {
    // If request fails or times out, safely return unexposed
  }

  return {
    platform: "Gravatar / Automattic",
    category: "avatar",
    isExposed: false,
    details: "No public avatar or profile found.",
  };
}
