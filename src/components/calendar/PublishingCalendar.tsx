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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format as fmtDate } from "date-fns";
import { useContents, useUpdateContent } from "@/hooks/useContent";
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/useToast";

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
  facebook:  "#2563eb",
  twitter:   "#38bdf8",
  linkedin:  "#1d4ed8",
  tiktok:    "#1f2937",
  youtube:   "#dc2626",
};

interface PublishingCalendarProps {
  contents: ContentItem[];
}

export function PublishingCalendar({ contents }: PublishingCalendarProps) {
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleContentId, setScheduleContentId] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const { data: drafts } = useContents({ status: "draft" });
  const updateContent = useUpdateContent();

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

  function handleSelectSlot({ start }: { start: Date }) {
    const dateStr = fmtDate(start, "yyyy-MM-dd'T'HH:mm");
    setScheduleDate(dateStr);
    setScheduleContentId("");
    setScheduleSuccess(false);
    setScheduleDialogOpen(true);
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduleContentId || !scheduleDate) return;
    try {
      await updateContent.mutateAsync({
        id: scheduleContentId,
        status: "scheduled",
        scheduledAt: scheduleDate,
      });
      setScheduleSuccess(true);
      setTimeout(() => {
        setScheduleDialogOpen(false);
        setScheduleSuccess(false);
      }, 1500);
    } catch {
      toast({ title: "Erro ao agendar", variant: "destructive" });
    }
  }

  const selectedDraft = drafts?.find((c) => c.id === scheduleContentId);

  return (
    <>
      <div style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
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

      {/* Dialog: agendar ao clicar no dia */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-violet-600" />
              Agendar Publicação
            </DialogTitle>
            <DialogDescription>
              Selecione um conteúdo e confirme a data e hora.
            </DialogDescription>
          </DialogHeader>

          {scheduleSuccess ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Publicação agendada com sucesso!</span>
            </div>
          ) : (
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Conteúdo (rascunhos disponíveis)</Label>
                <Select value={scheduleContentId} onValueChange={setScheduleContentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um conteúdo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {!drafts?.length ? (
                      <div className="px-2 py-3 text-sm text-gray-400 text-center">
                        Nenhum rascunho disponível
                      </div>
                    ) : (
                      drafts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedDraft && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{selectedDraft.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{selectedDraft.caption}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedDraft.platforms.map((p) => {
                      const plt = PLATFORMS.find((x) => x.id === p);
                      return plt ? (
                        <span key={p} className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${plt.color}`}>
                          {plt.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="scheduleDate">Data e hora</Label>
                <Input
                  id="scheduleDate"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!scheduleContentId || !scheduleDate || updateContent.isPending}
              >
                {updateContent.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Agendando...</>
                ) : (
                  <><CalendarClock className="w-4 h-4 mr-2" />Agendar Publicação</>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: detalhe do evento */}
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
                      <span key={p} className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${plt.color}`}>
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
                      <span key={t} className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs">{t}</span>
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
