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
import { format as fmtDate } from "date-fns";
import { useCreateContent, useUpdateContent, useDeleteContent } from "@/hooks/useContent";
import { ContentForm } from "@/components/content/ContentForm";
import { Pencil, Trash2 } from "lucide-react";

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
  // Dialog: novo conteúdo
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newDefaultDate, setNewDefaultDate] = useState("");

  // Dialog: detalhes do evento
  const [selected, setSelected] = useState<ContentItem | null>(null);

  // Dialog: editar evento
  const [editItem, setEditItem] = useState<ContentItem | null>(null);

  // Dialog: confirmar exclusão
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);

  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

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
    setNewDefaultDate(fmtDate(start, "yyyy-MM-dd'T'HH:mm"));
    setNewDialogOpen(true);
  }

  async function handleCreate(data: Partial<ContentItem>) {
    await createContent.mutateAsync(data);
    setNewDialogOpen(false);
  }

  async function handleUpdate(data: Partial<ContentItem>) {
    if (!editItem) return;
    await updateContent.mutateAsync({ id: editItem.id, ...data });
    setEditItem(null);
    setSelected(null);
  }

  async function handleDelete() {
    if (!deleteItem) return;
    await deleteContent.mutateAsync(deleteItem.id);
    setDeleteItem(null);
    setSelected(null);
  }

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

      {/* Dialog: Novo conteúdo (clique no dia) */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Publicação</DialogTitle>
            <DialogDescription>
              Preencha os dados e agende a publicação.
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            defaultScheduledAt={newDefaultDate}
            onSubmit={handleCreate}
            onCancel={() => setNewDialogOpen(false)}
            loading={createContent.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalhes do evento */}
      <Dialog open={!!selected && !editItem} onOpenChange={() => setSelected(null)}>
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

              {selected.script && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Roteiro</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.script}</p>
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

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setEditItem(selected)}
                >
                  <Pencil className="w-4 h-4" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => setDeleteItem(selected)}
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar evento */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Publicação</DialogTitle>
            <DialogDescription>Atualize os dados da publicação.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <ContentForm
              initial={editItem}
              onSubmit={handleUpdate}
              onCancel={() => setEditItem(null)}
              loading={updateContent.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir publicação?</DialogTitle>
            <DialogDescription>
              "{deleteItem?.title}" será removida permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteItem(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleteContent.isPending}
            >
              {deleteContent.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
