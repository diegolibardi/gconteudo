import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import { ContentItem } from "@/types";
import { PLATFORMS } from "@/lib/constants";

interface UpcomingPostsProps {
  posts: ContentItem[];
}

export function UpcomingPosts({ posts }: UpcomingPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <CalendarClock className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">Nenhuma publicação agendada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const platform = PLATFORMS.find((p) => post.platforms[0] === p.id);
        return (
          <div
            key={post.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{post.caption}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {post.platforms.slice(0, 3).map((p) => {
                  const plt = PLATFORMS.find((x) => x.id === p);
                  return plt ? (
                    <span
                      key={p}
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${plt.color}`}
                    >
                      {plt.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            {post.scheduledAt && (
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-700">
                  {format(new Date(post.scheduledAt), "dd MMM", { locale: ptBR })}
                </p>
                <p className="text-xs text-gray-400">
                  {format(new Date(post.scheduledAt), "HH:mm")}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
