"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentItem, ContentFilters } from "@/types";
import { toast } from "@/hooks/useToast";

async function fetchContents(filters?: ContentFilters): Promise<ContentItem[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  if (filters?.platform && filters.platform !== "all") params.set("platform", filters.platform);
  if (filters?.search) params.set("search", filters.search);

  const res = await fetch(`/api/content?${params.toString()}`);
  if (!res.ok) throw new Error("Erro ao carregar conteúdos");
  const data = await res.json();
  return data.contents;
}

async function createContent(data: Partial<ContentItem>): Promise<ContentItem> {
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar conteúdo");
  }
  const result = await res.json();
  return result.content;
}

async function updateContent({ id, ...data }: Partial<ContentItem> & { id: string }): Promise<ContentItem> {
  const res = await fetch(`/api/content/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao atualizar conteúdo");
  }
  const result = await res.json();
  return result.content;
}

async function deleteContent(id: string): Promise<void> {
  const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao excluir conteúdo");
  }
}

export function useContents(filters?: ContentFilters) {
  return useQuery({
    queryKey: ["contents", filters],
    queryFn: () => fetchContents(filters),
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Conteúdo criado!", variant: "default" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Conteúdo atualizado!" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Conteúdo excluído!", variant: "destructive" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });
}
