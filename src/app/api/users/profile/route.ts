import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { name, email, avatar } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios." },
        { status: 400 }
      );
    }

    const existing = await db.user.findFirst({
      where: { email, NOT: { id: session.user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este email já está em uso." },
        { status: 409 }
      );
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name, email, avatar: avatar || null },
      select: { id: true, name: true, email: true, avatar: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
