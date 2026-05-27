import { formatMarketingDate } from "@/lib/marketing/format";
import { networkLabels, postStatusLabels, statusTone } from "@/services/marketing/calculations";
import type { MarketingData, SocialPost } from "@/types/marketing";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";

export function PostPreview({ post, data, onSelect }: { post: SocialPost; data: MarketingData; onSelect: (id: string) => void }) {
  const accounts = data.accounts.filter((account) => post.accountIds.includes(account.id));

  return (
    <Card className="p-4" interactive>
      <button className="w-full text-left" onClick={() => onSelect(post.id)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">{post.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{formatMarketingDate(post.scheduledAt)}</p>
          </div>
          <Badge tone={statusTone(post.status)}>{postStatusLabels[post.status]}</Badge>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{post.content}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {accounts.map((account) => (
            <span key={account.id} className="rounded-[8px] bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300">
              {networkLabels[account.network]}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-cyan-100">
          {post.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      </button>
    </Card>
  );
}
