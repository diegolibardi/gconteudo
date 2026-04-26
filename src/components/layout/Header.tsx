"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";

const pageTitles: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/biblioteca":    "Biblioteca de Conteúdo",
  "/calendario":    "Calendário de Publicações",
  "/agendar":       "Agendar Publicação",
  "/configuracoes": "Configurações",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const title =
    Object.entries(pageTitles).find(([path]) =>
      pathname === path || pathname.startsWith(path + "/")
    )?.[1] ?? "ContentFlow";

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}
