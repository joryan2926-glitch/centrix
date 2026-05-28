"use client";

import { useCallback, useMemo, useState } from "react";
import { navigation } from "@/data/navigation";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export type GlobalSearchResult = {
  id: string;
  type: "module" | "client" | "invoice" | "project" | "workflow" | "ai";
  title: string;
  detail: string;
  href: string;
};

function matches(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function useGlobalSearch() {
  const { supabase } = useSupabaseContext();
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const localResults = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return [];

    return navigation
      .filter((item) => matches([item.label, item.href, ...(item.keywords ?? [])].join(" "), normalized))
      .slice(0, 8)
      .map((item): GlobalSearchResult => ({
        id: `module-${item.href}`,
        type: "module",
        title: item.label,
        detail: `Module CENTRIX - ${item.href}`,
        href: item.href
      }));
  }, [query]);

  const search = useCallback(
    async (value: string) => {
      setQuery(value);
      setOpen(Boolean(value.trim()));
      if (!supabase || value.trim().length < 2) {
        setRemoteResults([]);
        return;
      }

      setLoading(true);
      const workspace = await resolveWorkspaceContext(supabase);
      if (!workspace) {
        setRemoteResults([]);
        setLoading(false);
        return;
      }

      const term = `%${value.trim()}%`;
      const [clients, invoices, projects, workflows] = await Promise.all([
        supabase.from("clients").select("id,name,company,email").eq("workspace_id", workspace.workspaceId).or(`name.ilike.${term},company.ilike.${term},email.ilike.${term}`).limit(4),
        supabase.from("invoices").select("id,number,title,status,total").eq("workspace_id", workspace.workspaceId).or(`number.ilike.${term},title.ilike.${term}`).limit(4),
        supabase.from("projects").select("id,name,status,progress").eq("workspace_id", workspace.workspaceId).or(`name.ilike.${term},description.ilike.${term}`).limit(4),
        supabase.from("workflows").select("id,name,trigger,active").eq("workspace_id", workspace.workspaceId).or(`name.ilike.${term},trigger.ilike.${term}`).limit(4)
      ]);

      const next: GlobalSearchResult[] = [
        ...(clients.data ?? []).map((row) => ({
          id: `client-${row.id}`,
          type: "client" as const,
          title: String(row.company ?? row.name),
          detail: String(row.email ?? "Client"),
          href: "/crm"
        })),
        ...(invoices.data ?? []).map((row) => ({
          id: `invoice-${row.id}`,
          type: "invoice" as const,
          title: String(row.number),
          detail: `${String(row.status)} - ${Number(row.total ?? 0).toLocaleString("fr-FR")} EUR`,
          href: "/facturation"
        })),
        ...(projects.data ?? []).map((row) => ({
          id: `project-${row.id}`,
          type: "project" as const,
          title: String(row.name),
          detail: `${String(row.status)} - ${Number(row.progress ?? 0)}%`,
          href: "/projects"
        })),
        ...(workflows.data ?? []).map((row) => ({
          id: `workflow-${row.id}`,
          type: "workflow" as const,
          title: String(row.name),
          detail: String(row.trigger ?? "Workflow"),
          href: "/workflows"
        }))
      ];

      setRemoteResults(next);
      setLoading(false);
    },
    [supabase]
  );

  return {
    clear: () => {
      setQuery("");
      setOpen(false);
      setRemoteResults([]);
    },
    loading,
    open,
    query,
    results: [...remoteResults, ...localResults].slice(0, 10),
    search,
    setOpen
  };
}
