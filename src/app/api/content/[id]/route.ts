import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Platform } from "@/types";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const content = await db.content.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!content) {
    return NextResponse.json({ error: "Conteúdo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ content: serializeContent(content) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.content.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Conteúdo não encontrado." }, { status: 404 });
  }

  try {
    const data = await req.json();
    const { title, script, caption, platforms, status, scheduledAt, publishedAt, mediaUrls, tags } = data;

    const updated = await db.content.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        script: script !== undefined ? script : existing.script,
        caption: caption ?? existing.caption,
        platforms: platforms ? JSON.stringify(platforms) : existing.platforms,
        status: status ?? existing.status,
        scheduledAt: scheduledAt !== undefined
          ? (scheduledAt ? new Date(scheduledAt) : null)
          : existing.scheduledAt,
        publishedAt: publishedAt !== undefined
          ? (publishedAt ? new Date(publishedAt) : null)
          : existing.publishedAt,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : existing.mediaUrls,
        tags: tags ? JSON.stringify(tags) : existing.tags,
      },
    });

    return NextResponse.json({ content: serializeContent(updated) });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.content.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Conteúdo não encontrado." }, { status: 404 });
  }

  await db.content.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
