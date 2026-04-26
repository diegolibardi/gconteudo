"use client";

import { PublishingCalendar } from "@/components/calendar/PublishingCalendar";
import { useContents } from "@/hooks/useContent";
import { Loader2 } from "lucide-react";

export default function CalendarioPage() {
  const { data: contents, isLoading } = useContents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Visualize e gerencie suas publicações agendadas no calendário.
      </p>
      <PublishingCalendar contents={contents || []} />
    </div>
  );
}
