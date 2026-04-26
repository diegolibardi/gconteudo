import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor, iconBg, description }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
}
