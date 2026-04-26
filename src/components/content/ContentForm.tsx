"use client";

import { useState } from "react";
import { ContentItem, Platform } from "@/types";
import { PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";

interface ContentFormProps {
  initial?: Partial<ContentItem>;
  defaultScheduledAt?: string; // pré-preenche data vinda do clique no calendário
  onSubmit: (data: Partial<ContentItem>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ContentForm({ initial, defaultScheduledAt, onSubmit, onCancel, loading }: ContentFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [script, setScript] = useState(initial?.script || "");
  const [caption, setCaption] = useState(initial?.caption || "");
  const [platforms, setPlatforms] = useState<Platform[]>(initial?.platforms || []);
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt
      ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
      : defaultScheduledAt || ""
  );
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>(initial?.mediaUrls || []);
  const [mediaInput, setMediaInput] = useState("");
  const [error, setError] = useState("");

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function addMedia() {
    const u = mediaInput.trim();
    if (u && !mediaUrls.includes(u)) setMediaUrls([...mediaUrls, u]);
    setMediaInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("Título é obrigatório."); return; }
    if (!caption.trim()) { setError("Legenda é obrigatória."); return; }
    if (platforms.length === 0) { setError("Selecione ao menos uma plataforma."); return; }
    if (!scheduledAt) { setError("Defina a data e hora de publicação."); return; }

    try {
      await onSubmit({
        title: title.trim(),
        script: script.trim() || undefined,
        caption: caption.trim(),
        platforms,
        status: "scheduled",
        scheduledAt: scheduledAt || null,
        tags,
        mediaUrls,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Nome do conteúdo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Script */}
      <div className="space-y-1.5">
        <Label htmlFor="script">Roteiro</Label>
        <Textarea
          id="script"
          placeholder="Digite o roteiro do vídeo ou post..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <Label htmlFor="caption">Legenda <span className="text-red-500">*</span></Label>
        <Textarea
          id="caption"
          placeholder="Legenda para publicação nas redes sociais..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <Label>Plataformas <span className="text-red-500">*</span></Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(({ id, label, color }) => {
            const selected = platforms.includes(id as Platform);
            return (
              <button
                key={id}
                type="button"
                onClick={() => togglePlatform(id as Platform)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                  selected
                    ? `${color} text-white border-transparent`
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date/time — sempre visível */}
      <div className="space-y-1.5">
        <Label htmlFor="scheduledAt">Data e hora de publicação <span className="text-red-500">*</span></Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media URLs */}
      <div className="space-y-1.5">
        <Label>Links de mídia</Label>
        <div className="flex gap-2">
          <Input
            placeholder="URL da imagem ou vídeo..."
            value={mediaInput}
            onChange={(e) => setMediaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMedia(); } }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addMedia}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {mediaUrls.length > 0 && (
          <div className="space-y-1 mt-1">
            {mediaUrls.map((u) => (
              <div key={u} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="flex-1 truncate bg-gray-50 rounded px-2 py-1">{u}</span>
                <button type="button" onClick={() => setMediaUrls(mediaUrls.filter((x) => x !== u))}>
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Salvando..." : initial?.id ? "Atualizar" : "Agendar"}
        </Button>
      </div>
    </form>
  );
}
