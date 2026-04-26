import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Platform } from "@/types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingPosts } from "@/components/dashboard/UpcomingPosts";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, CheckCircle2, LayoutGrid } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();

  const contents = await db.content.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: "asc" },
  });

  const total = contents.length;

  // Publicado = status "published" OU agendado com data já passada
  const published = contents.filter(
    (c) => c.status === "published" || (c.scheduledAt && c.scheduledAt <= now)
  ).length;

  // Agendado = status "scheduled" com data futura
  const scheduled = contents.filter(
    (c) => c.status === "scheduled" && c.scheduledAt && c.scheduledAt > now
  ).length;

  const platformBreakdown: Record<string, number> = {};
  for (const c of contents) {
    const platforms = JSON.parse(c.platforms) as Platform[];
    for (const p of platforms) {
      platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
    }
  }

  // Próximas publicações = agendadas com data futura
  const upcomingPosts = contents
    .filter((c) => c.status === "scheduled" && c.scheduledAt && c.scheduledAt > now)
    .slice(0, 5)
    .map((c) => ({
      ...c,
      status: c.status as "draft" | "scheduled" | "published",
      platforms: JSON.parse(c.platforms) as Platform[],
      mediaUrls: JSON.parse(c.mediaUrls) as string[],
      tags: JSON.parse(c.tags) as string[],
      scheduledAt: c.scheduledAt?.toISOString() ?? null,
      publishedAt: c.publishedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Olá, {session.user.name?.split(" ")[0]}!
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">Aqui está o resumo do seu conteúdo.</p>
      </div>

      {/* Stats — 3 cards: Total, Agendados, Publicados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total de Conteúdos"
          value={total}
          icon={LayoutGrid}
          iconColor="text-violet-600"
          iconBg="bg-violet-100"
          description="todos os registros"
        />
        <StatsCard
          title="Agendados"
          value={scheduled}
          icon={CalendarClock}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          description="publicação futura"
        />
        <StatsCard
          title="Publicados"
          value={published}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          description="data já passou"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas Publicações</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingPosts posts={upcomingPosts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformChart data={platformBreakdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
