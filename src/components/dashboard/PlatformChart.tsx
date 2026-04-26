import { PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlatformChartProps {
  data: Record<string, number>;
}

export function PlatformChart({ data }: PlatformChartProps) {
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Nenhum conteúdo ainda
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {PLATFORMS.map(({ id, label, color }) => {
        const count = data[id] || 0;
        if (count === 0) return null;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700 font-medium">{label}</span>
              <span className="text-xs text-gray-500">{count} ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
