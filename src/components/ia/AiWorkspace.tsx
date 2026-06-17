"use client";

import dynamic from "next/dynamic";
import { Bot, BrainCircuit, Clock3, FileText, History, Loader2, MessageSquareText, Plus, Save, Search, Send, Sparkles, WandSparkles, Zap } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatAiDate } from "@/lib/ia/format";
import { buildAiInsights, createConversation, createGeneration, createMessage, getAiDashboard } from "@/services/ia/calculations";
import { useAiAutomationData } from "@/hooks/ia/useAiAutomationData";
import type { AiMessage, AiTemplate } from "@/types/ia";
import { AiKpiCard } from "@/ui/ia/AiKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const AiAnalyticsCharts = dynamic(() => import("@/components/ia/AiAnalyticsCharts").then((module) => module.AiAnalyticsCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

const categories: Record<AiTemplate["category"], string> = {
  sales: "Ventes",
  finance: "Finance",
  legal: "Legal",
  marketing: "Marketing",
  crm: "CRM",
  productivity: "Productivite",
  strategy: "Strategie"
};

async function streamAssistantResponse(messages: AiMessage[], onDelta: (delta: string) => void) {
  const response = await fetch("/api/ia/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.slice(-10).map(({ role, content }) => ({ role, content })) })
  });

  if (!response.ok) {
    const fallback = await response.json().catch(() => null);
    throw new Error(fallback?.error ?? "La generation IA est indisponible.");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Le flux IA est indisponible.");

  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      const event = JSON.parse(payload) as { type?: string; delta?: string; text?: string; error?: { message?: string } };
      if (event.type === "response.output_text.delta" && event.delta) {
        content += event.delta;
        onDelta(event.delta);
      }
      if (event.error?.message) throw new Error(event.error.message);
    }
  }

  return content.trim();
}

export function AiWorkspace() {
  const { data, loading, mode, toast, mutate, sync, notify } = useAiAutomationData();
  const [selectedConversationId, setSelectedConversationId] = useState(data.conversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [draftResponse, setDraftResponse] = useState("");

  const dashboard = useMemo(() => getAiDashboard(data), [data]);
  const selectedConversation = data.conversations.find((conversation) => conversation.id === selectedConversationId) ?? data.conversations[0] ?? null;
  const messages = selectedConversation ? data.messages.filter((message) => message.conversationId === selectedConversation.id) : [];
  const filteredConversations = data.conversations.filter((conversation) => conversation.title.toLowerCase().includes(query.toLowerCase()));
  const insights = useMemo(() => buildAiInsights(data), [data]);

  function startConversation() {
    const conversation = createConversation("Nouvelle conversation business");
    mutate(
      (current) => ({
        ...current,
        conversations: [conversation, ...current.conversations],
        messages: [
          createMessage(conversation.id, "assistant", "Pret. Je peux analyser vos ventes, generer des documents, resumer une reunion ou proposer une automatisation.")
        ]
      }),
      { title: "Conversation creee", detail: "Le copilote IA est pret a travailler." }
    );
    setSelectedConversationId(conversation.id);
  }

  function applyTemplate(template: AiTemplate) {
    setPrompt(template.prompt);
    mutate(
      (current) => ({
        ...current,
        generations: [createGeneration(template, "Prompt prepare pour generation business."), ...current.generations]
      }),
      { title: "Template charge", detail: `${template.title} est pret dans le chat.` }
    );
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || streaming) return;

    const conversation = selectedConversation ?? createConversation(content.slice(0, 44));
    const userMessage = createMessage(conversation.id, "user", content);
    const optimisticMessages = [...messages, userMessage];

    setPrompt("");
    setDraftResponse("");
    setStreaming(true);

    mutate((current) => ({
      ...current,
      conversations: current.conversations.some((item) => item.id === conversation.id)
        ? current.conversations.map((item) => (item.id === conversation.id ? { ...item, title: item.title === "Nouvelle conversation business" ? content.slice(0, 54) : item.title, updatedAt: new Date().toISOString() } : item))
        : [conversation, ...current.conversations],
      messages: [...current.messages, userMessage]
    }));
    setSelectedConversationId(conversation.id);

    try {
      const answer = await streamAssistantResponse(optimisticMessages, (delta) => setDraftResponse((current) => current + delta));
      const assistantMessage = createMessage(
        conversation.id,
        "assistant",
        answer || "Mode demo: connectez MISTRAL_API_KEY pour obtenir une reponse business en streaming."
      );
      mutate(
        (current) => ({
          ...current,
          conversations: current.conversations.map((item) =>
            item.id === conversation.id
              ? { ...item, tokensUsed: item.tokensUsed + userMessage.tokens + assistantMessage.tokens, updatedAt: new Date().toISOString() }
              : item
          ),
          messages: [...current.messages, assistantMessage]
        }),
        { title: "Reponse IA generee", detail: "La conversation est enregistree." }
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Generation indisponible.";
      const fallback = createMessage(conversation.id, "assistant", `Mode securise: ${detail} Configurez MISTRAL_API_KEY pour activer le streaming Mistral.`);
      mutate((current) => ({ ...current, messages: [...current.messages, fallback] }));
      notify("IA en mode fallback", detail);
    } finally {
      setDraftResponse("");
      setStreaming(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
        </section>
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge tone="violet">Executive AI</Badge>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">IA Business</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Copilote business, generations documentaires, recommandations CRM et pilotage des automatisations dans une experience premium connectee a Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={startConversation}><Plus size={17} /> Nouveau chat</Button>
              <Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold text-white">Notifications intelligentes</p>
          <div className="mt-4 space-y-3">
            {data.notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{notification.title}</p>
                  <Badge tone={notification.severity === "warning" ? "rose" : notification.severity === "success" ? "emerald" : "cyan"}>{notification.severity}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{notification.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AiKpiCard delta="+ live" icon={<MessageSquareText size={19} />} label="Conversations IA" tone="cyan" value={String(dashboard.conversations)} />
        <AiKpiCard delta="templates" icon={<WandSparkles size={19} />} label="Generations" tone="violet" value={String(dashboard.generations)} />
        <AiKpiCard delta={`${dashboard.successRate}% succes`} icon={<Zap size={19} />} label="Workflows actifs" tone="emerald" value={String(dashboard.activeWorkflows)} />
        <AiKpiCard delta={`${dashboard.tokensUsed} tokens`} icon={<BrainCircuit size={19} />} label="Heures gagnees" tone="cyan" value={`${dashboard.timeSaved}h`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr_320px]">
        <Card className="p-4">
          <div className="flex h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Rechercher" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-4 space-y-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full rounded-[8px] border p-3 text-left transition-all duration-200 ${
                  selectedConversation?.id === conversation.id ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                }`}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <p className="truncate text-sm font-medium text-white">{conversation.title}</p>
                <p className="mt-1 text-xs text-slate-500">{formatAiDate(conversation.updatedAt)}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[620px] flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-slate-400">Assistant IA business</p>
              <h2 className="text-lg font-semibold text-white">{selectedConversation?.title ?? "Copilote CENTRIX"}</h2>
            </div>
            <Badge tone="emerald">Streaming</Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto py-5">
            {messages.length === 0 ? (
              <EmptyState icon={<Bot size={20} />} title="Aucune conversation" detail="Creez un chat ou utilisez un template IA pour demarrer." />
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] rounded-[8px] border p-4 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-cyan-200/25 bg-cyan-300/10 text-cyan-50"
                      : "border-white/10 bg-white/[0.055] text-slate-200"
                  }`}>
                    {message.content}
                    <p className="mt-2 text-[11px] text-slate-500">{message.tokens} tokens</p>
                  </div>
                </div>
              ))
            )}
            {streaming ? (
              <div className="max-w-[86%] rounded-[8px] border border-violet-200/20 bg-violet-300/10 p-4 text-sm leading-6 text-violet-50">
                {draftResponse || <span className="inline-flex items-center gap-2 text-slate-300"><Loader2 className="animate-spin" size={16} /> Generation en cours...</span>}
              </div>
            ) : null}
          </div>

          <form className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row" onSubmit={sendMessage}>
            <textarea
              className="min-h-11 flex-1 resize-none rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-200/35"
              placeholder="Demandez une analyse, un email, un devis, un resume de reunion..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <Button className="sm:h-auto" disabled={streaming} type="submit" variant="primary">
              {streaming ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />} Envoyer
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles size={16} /> Outils IA</div>
            <div className="mt-4 grid gap-2">
              {data.templates.map((template) => (
                <button key={template.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-left transition-all duration-200 hover:border-cyan-200/30 hover:bg-white/[0.08]" onClick={() => applyTemplate(template)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{template.title}</p>
                    {template.favorite ? <Badge tone="violet">Favori</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{categories[template.category]}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><History size={16} /> Recommandations</div>
            <div className="mt-4 space-y-3">
              {insights.map((insight) => (
                <div key={insight.title} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-sm font-medium text-white">{insight.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{insight.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <AiAnalyticsCharts data={data} />

      <section className="grid gap-4 md:grid-cols-3">
        {data.generations.slice(0, 3).map((generation) => (
          <Card key={generation.id} interactive className="p-4">
            <div className="flex items-center justify-between gap-3">
              <FileText size={18} className="text-cyan-100" />
              <Badge tone="violet">{categories[generation.category]}</Badge>
            </div>
            <p className="mt-4 font-semibold text-white">{generation.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{generation.output}</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> {formatAiDate(generation.createdAt)}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
