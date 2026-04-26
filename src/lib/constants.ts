export const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "bg-pink-500",  textColor: "text-pink-500"  },
  { id: "facebook",  label: "Facebook",  color: "bg-blue-600",  textColor: "text-blue-600"  },
  { id: "twitter",   label: "Twitter/X", color: "bg-sky-400",   textColor: "text-sky-400"   },
  { id: "linkedin",  label: "LinkedIn",  color: "bg-blue-700",  textColor: "text-blue-700"  },
  { id: "tiktok",    label: "TikTok",    color: "bg-gray-800",  textColor: "text-gray-800"  },
  { id: "youtube",   label: "YouTube",   color: "bg-red-600",   textColor: "text-red-600"   },
] as const;

export const STATUSES = [
  { id: "draft",     label: "Rascunho",  color: "bg-gray-200 text-gray-700"   },
  { id: "scheduled", label: "Agendado",  color: "bg-amber-100 text-amber-700" },
  { id: "published", label: "Publicado", color: "bg-green-100 text-green-700" },
] as const;

export type PlatformId = typeof PLATFORMS[number]["id"];
export type StatusId   = typeof STATUSES[number]["id"];
