export type Platform = "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok" | "youtube";
export type ContentStatus = "draft" | "scheduled" | "published";

export interface ContentItem {
  id: string;
  title: string;
  script?: string | null;
  caption: string;
  platforms: Platform[];
  status: ContentStatus;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  mediaUrls: string[];
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  platformBreakdown: Record<string, number>;
  upcomingPosts: ContentItem[];
}

export interface ContentFilters {
  status?: ContentStatus | "all";
  platform?: Platform | "all";
  search?: string;
}
