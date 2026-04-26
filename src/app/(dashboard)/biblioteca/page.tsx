"use client";

import { useState } from "react";
import {
  useContents,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
} from "@/hooks/useContent";
import { ContentItem, ContentFilters, Platform, ContentStatus } from "@/types";
import { PLATFORMS, STATUSES } from "@/lib/constants";
import { PlatformBadge } from "@/components/content/PlatformBadge";
import { ContentForm } from "@/components/content/ContentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BibliotecaPage() {
  const [filters, setFilters] = useState<ContentFilters>({});
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);

  const { data: contents, isLoading } = useContents({
    ...filters,
    search: search || undefined,
  });
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

  async function handleCreate(data: Partial<ContentItem>) {
    await createContent.mutateAsync(data);
    setCreateOpen(false);
  }

  async function handleUpdate(data: Partial<ContentItem>) {
    if (!editItem) return;
    await updateContent.mutateAsync({ id: editItem.id, ...data });
    setEditItem(null);
  }

  async function handleDelete() {
    if (!deleteItem) return;
    await deleteContent.mutateAsync(deleteItem.id);
    setDeleteItem(null);
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por título ou legenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters({ ...filters, status: v === "all" ? undefined : (v as ContentStatus) })
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {STATUSES.map(({ id, label }) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.platform || "all"}
          onValueChange={(v) =>
            setFilters({ ...filters, platform: v === "all" ? undefined : (v as Platform) })
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PLATFORMS.map(({ id, label }) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-1" />
          Novo Conteúdo
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      ) : contents?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 mb-3 opacity-40" />
          <p className="font-medium">Nenhum conteúdo encontrado</p>
          <p className="text-sm mt-1">Clique em &quot;Novo Conteúdo&quot; para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Plataformas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Agendado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contents?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.caption}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.platforms.slice(0, 3).map((p) => (
                        <PlatformBadge key={p} platform={p} />
                      ))}
                      {item.platforms.length > 3 && (
                        <Badge variant="outline">+{item.platforms.length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status}>
                      {item.status === "draft" ? "Rascunho" : item.status === "scheduled" ? "Agendado" : "Publicado"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {item.scheduledAt
                      ? format(new Date(item.scheduledAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditItem(item)}
                        className="h-8 w-8"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteItem(item)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Conteúdo</DialogTitle>
            <DialogDescription>Preencha os dados do seu conteúdo</DialogDescription>
          </DialogHeader>
          <ContentForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={createContent.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
            <DialogDescription>Atualize os dados do conteúdo</DialogDescription>
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Conteúdo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deleteItem?.title}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteItem(null)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteContent.isPending}
              className="flex-1"
            >
              {deleteContent.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
