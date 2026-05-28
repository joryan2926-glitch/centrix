"use client";

import { ArrowRight, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { cn } from "@/lib/utils";

const typeLabels = {
  ai: "IA",
  client: "Client",
  invoice: "Facture",
  module: "Module",
  project: "Projet",
  workflow: "Workflow"
};

export function GlobalSearch() {
  const router = useRouter();
  const { clear, loading, open, query, results, search, setOpen } = useGlobalSearch();

  return (
    <div className="relative flex-1 sm:max-w-2xl">
      <div
        className={cn(
          "flex h-11 items-center gap-3 rounded-[14px] border bg-white px-3 text-sm font-medium text-slate-600 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition-all duration-200",
          open ? "border-blue-300 shadow-[0_14px_34px_rgba(37,99,235,0.14)]" : "border-slate-200 hover:border-blue-300 hover:shadow-[0_12px_28px_rgba(37,99,235,0.10)]"
        )}
      >
        <Search size={17} />
        <input
          aria-label="Recherche globale CENTRIX"
          className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 shadow-none outline-none placeholder:text-slate-500 focus:bg-transparent focus:shadow-none"
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          onChange={(event) => search(event.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) {
              router.push(results[0].href);
              clear();
            }
            if (event.key === "Escape") clear();
          }}
          placeholder="Rechercher client, facture, projet, workflow, IA..."
          value={query}
        />
        {loading ? <Loader2 className="animate-spin text-blue-600" size={16} /> : null}
        {query ? (
          <button aria-label="Effacer la recherche" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={clear} type="button">
            <X size={15} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Recherche globale</div>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {results.length ? (
              results.map((result) => (
                <Link
                  className="group flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors duration-200 hover:bg-blue-50"
                  href={result.href}
                  key={result.id}
                  onClick={clear}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-blue-50 text-xs font-black text-blue-700">{typeLabels[result.type]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-slate-950">{result.title}</span>
                    <span className="block truncate text-xs font-semibold text-slate-500">{result.detail}</span>
                  </span>
                  <ArrowRight className="text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600" size={16} />
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-950">Aucun resultat</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Essayez un client, une facture, un projet ou un module.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
