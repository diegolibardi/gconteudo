"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Library,
  Calendar,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/biblioteca",    label: "Biblioteca",    icon: Library         },
  { href: "/calendario",    label: "Calendário",    icon: Calendar        },
  { href: "/configuracoes", label: "Configurações", icon: Settings        },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-600">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">ContentFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-gray-800 pt-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "Usuário"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
