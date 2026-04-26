"use client";

import { useState } from "react";
import { useContents, useUpdateContent } from "@/hooks/useContent";
import { ContentItem, Platform } from "@/types";
import { PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/useToast";

export default function AgendarPage() {
  const { data: contents, isLoading } = useContents({ status: "draft" });
  const updateContent = useUpdateContent();

  const [selectedId, setSelectedId] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [success, setSuccess] = useState(false);

  const selected = contents?.find((c) => c.id === selectedId);

  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !scheduledAt) return;

    const platforms =
      selectedPlatforms.length > 0 ? selectedPlatforms : selected?.platforms || [];

    try {
      await updateContent.mutateAsync({
        id: selectedId,
        status: "scheduled",
        scheduledAt,
        platforms,
      });
      setSuccess(true);
      setSelectedId("");
      setSelectedPlatforms([]);
      setScheduledAt("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast({ title: "Erro ao agendar", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-gray-500">
        Selecione um conteúdo da sua biblioteca e defina quando e onde ele será publicado.
      </p>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Publicação agendada com sucesso!</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-violet-600" />
            Agendamento Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSchedule} className="space-y-5">
            {/* Content select */}
            <div className="space-y-1.5">
              <Label>Conteúdo (rascunhos disponíveis)</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um conteúdo..." />
                </SelectTrigger>
                <SelectContent>
                  {contents?.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-gray-400 text-center">
                      Nenhum rascunho disponível
                    </div>
                  ) : (
                    contents?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {selected && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{selected.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selected.caption}</p>
              </div>
            )}

            {/* Platforms override */}
            <div className="space-y-2">
              <Label>Plataformas (opcional — sobrescreve as do conteúdo)</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(({ id, label, color }) => {
                  const isSelected = selectedPlatforms.includes(id as Platform);
                  const isDefault = !selectedPlatforms.length && selected?.platforms.includes(id as Platform);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePlatform(id as Platform)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                        isSelected
                          ? `${color} text-white border-transparent`
                          : isDefault
                          ? `${color} text-white border-transparent opacity-60`
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {selected && selectedPlatforms.length === 0 && (
                <p className="text-xs text-gray-400">
                  Usando plataformas do conteúdo: {selected.platforms.join(", ")}
                </p>
              )}
            </div>

            {/* DateTime */}
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Data e hora de publicação</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selectedId || !scheduledAt || updateContent.isPending}
            >
              {updateContent.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Agendar Publicação
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
