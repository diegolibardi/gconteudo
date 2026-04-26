import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/lib/constants";
import { Platform } from "@/types";

interface PlatformBadgeProps {
  platform: Platform;
}

const platformVariantMap: Record<Platform, "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok" | "youtube"> = {
  instagram: "instagram",
  facebook: "facebook",
  twitter: "twitter",
  linkedin: "linkedin",
  tiktok: "tiktok",
  youtube: "youtube",
};

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const plt = PLATFORMS.find((p) => p.id === platform);
  if (!plt) return null;
  return (
    <Badge variant={platformVariantMap[platform]}>
      {plt.label}
    </Badge>
  );
}
