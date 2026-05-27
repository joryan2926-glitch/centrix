"use client";

import dynamic from "next/dynamic";
import { BarChart3, CalendarDays, Edit3, Image as ImageIcon, Megaphone, MousePointerClick, Plus, Save, Search, Share2, Sparkles, Target, TrendingUp, UsersRound } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatMarketingCurrency, formatMarketingNumber } from "@/lib/marketing/format";
import { buildPost, campaignRoi, filterPosts, getMarketingDashboard, networkLabels, postStatusLabels, statusTone } from "@/services/marketing/calculations";
import { useMarketingData } from "@/hooks/marketing/useMarketingData";
import type { MarketingFilters, SocialPost } from "@/types/marketing";
import { MarketingKpiCard } from "@/ui/marketing/MarketingKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import { PostPreview } from "@/components/marketing/PostPreview";

const MarketingCharts = dynamic(() => import("@/components/marketing/MarketingCharts").then((module) => module.MarketingCharts), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

const views = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "calendar", label: "Calendrier", icon: CalendarDays },
  { id: "posts", label: "Posts", icon: Edit3 },
  { id: "campaigns", label: "Campagnes", icon: Target },
  { id: "networks", label: "Reseaux", icon: Share2 },
  { id: "media", label: "Medias", icon: ImageIcon }
] as const;

type View = (typeof views)[number]["id"];

type Draft = {
  title: string;
  content: string;
  scheduledAt: string;
  hashtags: string;
  mentions: string;
  category: SocialPost["category"];
};

const defaultDraft: Draft = {
  title: "Nouvelle publication",
  content: "Partagez une annonce, une ressource ou un insight utile pour votre audience.",
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  hashtags: "SaaS,Productivity,CENTRIX",
  mentions: "@centrix",
  category: "brand"
};

export function MarketingWorkspace() {
  const { data, loading, mode, toast, mutate, sync } = useMarketingData();
  const [view, setView] = useState<View>("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [selectedPostId, setSelectedPostId] = useState("post-1");
  const [filters, setFilters] = useState<MarketingFilters>({ query: "", network: "all", status: "all" });

  const dashboard = useMemo(() => getMarketingDashboard(data), [data]);
  const posts = useMemo(() => filterPosts(data.posts, filters, data.accounts), [data.posts, data.accounts, filters]);
  const selectedPost = data.posts.find((post) => post.id === selectedPostId) ?? data.posts[0] ?? null;

  function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const post = buildPost({
      campaignId: data.campaigns[0]?.id ?? null,
      accountIds: data.accounts.slice(0, 2).map((account) => account.id),
      title: draft.title,
      content: draft.content,
      scheduledAt: new Date(draft.scheduledAt).toISOString(),
      hashtags: draft.hashtags.split(",").map((tag) => tag.trim()).filter(Boolean),
      mentions: draft.mentions.split(",").map((mention) => mention.trim()).filter(Boolean),
      category: draft.category
    });

    mutate(
      (current) => ({
        ...current,
        posts: [post, ...current.posts],
        activities: [{ id: `act-${crypto.randomUUID()}`, title: "Post programme", detail: `${post.title} est programme.`, tone: "success", createdAt: new Date().toISOString() }, ...current.activities]
      }),
      { title: "Post programme", detail: `${post.title} est ajoute au calendrier editorial.` }
    );
    setSelectedPostId(post.id);
    setModalOpen(false);
  }

  function publishNow(postId: string) {
    mutate(
      (current) => ({
        ...current,
        posts: current.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                status: "published",
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metrics: { impressions: 1200, engagement: 84, clicks: 26, leads: 4 }
              }
            : post
        )
      }),
      { title: "Publication envoyee", detail: "Le post est marque comme publie." }
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
        </section>
        <Skeleton className="h-[520px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <Sparkles size={14} />
            Marketing command center
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Marketing Digital</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Planifiez, publiez, mesurez et optimisez vos campagnes sociales dans une experience SaaS premium.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModalOpen(true)} variant="primary"><Plus size={17} />Publication</Button>
          <Button onClick={sync}><Save size={17} />{mode === "supabase" ? "Sync Supabase" : "Sauver local"}</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MarketingKpiCard icon={<CalendarDays size={19} />} label="Programmes" value={String(dashboard.scheduled)} detail="Posts a venir" />
        <MarketingKpiCard icon={<TrendingUp size={19} />} label="Engagement" value={formatMarketingNumber(dashboard.engagement)} detail="Interactions publiees" />
        <MarketingKpiCard icon={<UsersRound size={19} />} label="Portee" value={formatMarketingNumber(dashboard.reach)} detail="Audience multireseau" />
        <MarketingKpiCard icon={<MousePointerClick size={19} />} label="Conversion" value={`${dashboard.conversionRate.toFixed(1)}%`} detail={`${formatMarketingNumber(dashboard.leads)} leads`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[220px_1fr]">
        <Card className="h-fit p-3">
          <nav className="space-y-1">
            {views.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={`flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-sm font-medium transition-all duration-200 ${view === item.id ? "bg-white/12 text-white shadow-glow" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setView(item.id)}>
                  <Icon size={17} />{item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Automation</p>
            <p className="mt-1 text-sm text-slate-300">{mode === "supabase" ? "Realtime actif" : "Mode local"}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px]">
              <label className="flex h-11 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Search size={17} />
                <input className="w-full bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Recherche post, hashtag, reseau..." value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
              </label>
              <select className="h-11 rounded-[8px] border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none" value={filters.network} onChange={(event) => setFilters((current) => ({ ...current, network: event.target.value as MarketingFilters["network"] }))}>
                <option value="all">Tous reseaux</option>
                {Object.entries(networkLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <select className="h-11 rounded-[8px] border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as MarketingFilters["status"] }))}>
                <option value="all">Tous statuts</option>
                {Object.entries(postStatusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
          </Card>

          {view === "dashboard" ? <MarketingCharts data={data} /> : null}
          {view === "calendar" ? <EditorialCalendar posts={posts} onSelect={setSelectedPostId} /> : null}
          {view === "posts" ? <PostsView data={data} posts={posts} selectedPost={selectedPost} onPublish={publishNow} onSelect={setSelectedPostId} /> : null}
          {view === "campaigns" ? <CampaignsView data={data} /> : null}
          {view === "networks" ? <NetworksView data={data} /> : null}
          {view === "media" ? <MediaView data={data} /> : null}
        </div>
      </section>

      <PostModal draft={draft} open={modalOpen} setDraft={setDraft} onClose={() => setModalOpen(false)} onSubmit={createPost} />
    </div>
  );
}

function EditorialCalendar({ posts, onSelect }: { posts: ReturnType<typeof filterPosts>; onSelect: (id: string) => void }) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Calendrier editorial</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const date = day.toISOString().slice(0, 10);
          const dayPosts = posts.filter((post) => post.scheduledAt.slice(0, 10) === date);
          return (
            <div key={date} className="min-h-32 rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{day.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" })}</p>
              <div className="mt-3 space-y-2">
                {dayPosts.map((post) => <button key={post.id} className="w-full rounded-[8px] bg-cyan-300/10 p-2 text-left text-xs text-cyan-100" onClick={() => onSelect(post.id)}>{post.title}</button>)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PostsView({ data, posts, selectedPost, onSelect, onPublish }: { data: ReturnType<typeof useMarketingData>["data"]; posts: ReturnType<typeof filterPosts>; selectedPost: ReturnType<typeof useMarketingData>["data"]["posts"][number] | null; onSelect: (id: string) => void; onPublish: (id: string) => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 md:grid-cols-2">
        {posts.length ? posts.map((post) => <PostPreview key={post.id} data={data} post={post} onSelect={onSelect} />) : <EmptyState icon={<Edit3 size={18} />} title="Aucun post" detail="Creez une publication ou ajustez les filtres." />}
      </div>
      <Card className="p-5">
        {selectedPost ? (
          <>
            <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-semibold text-white">{selectedPost.title}</h2><Badge tone={statusTone(selectedPost.status)}>{postStatusLabels[selectedPost.status]}</Badge></div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{selectedPost.content}</p>
            <div className="mt-5 rounded-[8px] border border-white/10 bg-white/[0.045] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Apercu publication</p><p className="mt-3 text-sm text-white">{selectedPost.content}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-cyan-100">{selectedPost.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
            <Button className="mt-5 w-full" onClick={() => onPublish(selectedPost.id)} variant="primary"><Megaphone size={17} />Publier maintenant</Button>
          </>
        ) : <EmptyState icon={<Edit3 size={18} />} title="Aucune publication" detail="Selectionnez un post." />}
      </Card>
    </div>
  );
}

function CampaignsView({ data }: { data: ReturnType<typeof useMarketingData>["data"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.campaigns.map((campaign) => (
        <Card key={campaign.id} className="p-5" interactive>
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-white">{campaign.name}</h3><p className="mt-1 text-sm text-slate-400">{campaign.objective}</p></div><Badge tone={campaign.status === "active" ? "emerald" : "violet"}>{campaign.status}</Badge></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Budget" value={formatMarketingCurrency(campaign.budget)} /><Metric label="Leads" value={formatMarketingNumber(campaign.leads)} /><Metric label="ROI" value={`${campaignRoi(campaign.spent, campaign.revenue).toFixed(0)}%`} /></div>
        </Card>
      ))}
    </div>
  );
}

function NetworksView({ data }: { data: ReturnType<typeof useMarketingData>["data"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.accounts.map((account) => <Card key={account.id} className="p-5" interactive><div className="flex items-start justify-between"><div><h3 className="text-lg font-semibold text-white">{networkLabels[account.network]}</h3><p className="mt-1 text-sm text-slate-400">{account.handle}</p></div><span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color }} /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Abonnes" value={formatMarketingNumber(account.followers)} /><Metric label="Portee" value={formatMarketingNumber(account.reach)} /><Metric label="Eng." value={`${account.engagementRate}%`} /></div></Card>)}
    </div>
  );
}

function MediaView({ data }: { data: ReturnType<typeof useMarketingData>["data"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.media.map((asset) => <Card key={asset.id} className="p-5" interactive><div className="grid h-32 place-items-center rounded-[8px] bg-gradient-to-br from-cyan-300/20 via-violet-300/20 to-emerald-300/10 text-cyan-100"><ImageIcon size={28} /></div><h3 className="mt-4 font-semibold text-white">{asset.title}</h3><p className="mt-1 text-sm text-slate-400">{asset.type}</p><div className="mt-3 flex flex-wrap gap-2">{asset.tags.map((tag) => <Badge key={tag} tone="violet">{tag}</Badge>)}</div></Card>)}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[8px] bg-white/[0.045] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>;
}

function PostModal({ open, draft, setDraft, onSubmit, onClose }: { open: boolean; draft: Draft; setDraft: (draft: Draft) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <Modal open={open} title="Creer une publication" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Titre" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} />
          <Input label="Programmation" type="datetime-local" value={draft.scheduledAt} onChange={(value) => setDraft({ ...draft, scheduledAt: value })} />
          <label className="space-y-2 sm:col-span-2"><span className="text-xs text-slate-500">Texte</span><textarea className="min-h-28 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-200/50" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} /></label>
          <Input label="Hashtags" value={draft.hashtags} onChange={(value) => setDraft({ ...draft, hashtags: value })} />
          <Input label="Mentions" value={draft.mentions} onChange={(value) => setDraft({ ...draft, mentions: value })} />
        </div>
        <div className="flex justify-end gap-2"><Button onClick={onClose} type="button" variant="ghost">Annuler</Button><Button type="submit" variant="primary">Programmer</Button></div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return <label className="space-y-2"><span className="text-xs text-slate-500">{label}</span><input className="h-10 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
