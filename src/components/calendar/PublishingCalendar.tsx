"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ContentItem } from "@/types";
import { PLATFORMS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format as fmtDate } from "date-fns";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  resource: ContentItem;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#ec4899",
  facebook: "#2563eb",
  twitter:  "#38bdf8",
  linkedin: "#1d4ed8",
  tiktok:   "#1f2937",
  youtube:  "#dc2626",
};

interface PublishingCalendarProps {
  contents: ContentItem[];
}

export function PublishingCalendar({ contents }: PublishingCalendarProps) {
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const events: CalendarEvent[] = useMemo(() => {
    return contents
      .filter((c) => c.scheduledAt)
      .map((c) => ({
        id: c.id,
        title: c.title,
        start: new Date(c.scheduledAt!),
        end: new Date(new Date(c.scheduledAt!).getTime() + 30 * 60_000),
        resource: c,
      }));
  }, [contents]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const platform = event.resource.platforms[0];
    const color = PLATFORM_COLORS[platform] || "#7c3aed";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "6px",
        border: "none",
        color: "white",
        fontSize: "12px",
        padding: "2px 6px",
      },
    };
  };

  return (
    <>
      <div style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(event) => setSelected((event as CalendarEvent).resource)}
          eventPropGetter={eventStyleGetter}
          culture="pt-BR"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            noEventsInRange: "Nenhuma publicação neste período.",
            showMore: (total) => `+${total} mais`,
          }}
        />
      </div>

      {/* Event detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.scheduledAt &&
                fmtDate(new Date(selected.scheduledAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Plataformas</p>
                <div className="flex flex-wrap gap-1">
                  {selected.platforms.map((p) => {
                    const plt = PLATFORMS.find((x) => x.id === p);
                    return plt ? (
                      <span
                        key={p}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${plt.color}`}
                      >
                        {plt.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                <Badge variant={selected.status as "draft" | "scheduled" | "published"}>
                  {selected.status === "draft" ? "Rascunho" : selected.status === "scheduled" ? "Agendado" : "Publicado"}
                </Badge>
              </div>

              {selected.caption && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Legenda</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.caption}</p>
                </div>
              )}

              {selected.tags?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
