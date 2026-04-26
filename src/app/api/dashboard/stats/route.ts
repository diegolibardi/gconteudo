import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Platform } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const contents = await db.content.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: "asc" },
  });

  const total = contents.length;
  const draft = contents.filter((c) => c.status === "draft").length;
  const scheduled = contents.filter((c) => c.status === "scheduled").length;
  const published = contents.filter((c) => c.status === "published").length;

  const platformBreakdown: Record<string, number> = {};
  for (const c of contents) {
    const platforms = JSON.parse(c.platforms) as Platform[];
    for (const p of platforms) {
      platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
    }
  }

  const now = new Date();
  const upcomingPosts = contents
    .filter((c) => c.status === "scheduled" && c.scheduledAt && c.scheduledAt > now)
    .slice(0, 5)
    .map((c) => ({
      ...c,
      platforms: JSON.parse(c.platforms) as Platform[],
      mediaUrls: JSON.parse(c.mediaUrls) as string[],
      tags: JSON.parse(c.tags) as string[],
      scheduledAt: c.scheduledAt?.toISOString() ?? null,
      publishedAt: c.publishedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

  return NextResponse.json({
    total,
    draft,
    scheduled,
    published,
    platformBreakdown,
    upcomingPosts,
  });
}
