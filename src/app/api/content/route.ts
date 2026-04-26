import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Platform, ContentStatus } from "@/types";

function serializeContent(c: {
  id: string;
  title: string;
  script: string | null;
  caption: string;
  platforms: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  mediaUrls: string;
  tags: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...c,
    platforms: JSON.parse(c.platforms) as Platform[],
    mediaUrls: JSON.parse(c.mediaUrls) as string[],
    tags: JSON.parse(c.tags) as string[],
    scheduledAt: c.scheduledAt?.toISOString() ?? null,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: session.user.id };

  if (status && status !== "all") {
    where.status = status as ContentStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { caption: { contains: search } },
    ];
  }

  const contents = await db.content.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  let result = contents.map(serializeContent);

  if (platform && platform !== "all") {
    result = result.filter((c) => c.platforms.includes(platform as Platform));
  }

  return NextResponse.json({ contents: result });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, script, caption, platforms, status, scheduledAt, mediaUrls, tags } = data;

    if (!title || !caption || !platforms?.length) {
      return NextResponse.json(
        { error: "Título, legenda e plataformas são obrigatórios." },
        { status: 400 }
      );
    }

    const content = await db.content.create({
      data: {
        title,
        script: script || null,
        caption,
        platforms: JSON.stringify(platforms),
        status: status || "draft",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        mediaUrls: JSON.stringify(mediaUrls || []),
        tags: JSON.stringify(tags || []),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ content: serializeContent(content) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
