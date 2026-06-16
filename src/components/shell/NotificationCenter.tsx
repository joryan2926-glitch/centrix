"use client";

import { Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import { Button } from "@/ui/Button";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { items, loading, unreadCount } = useLiveNotifications();

  return (
    <div className="relative">
      <Button aria-label="Notifications" className="relative h-10 w-10 px-0" onClick={() => setOpen((current) => !current)} variant="surface">
        <Bell size={18} />
        {unreadCount ? <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">{unreadCount}</span> : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-black text-slate-950">Centre notifications</p>
              <p className="text-xs font-semibold text-slate-500">Activite live CENTRIX</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{loading ? "Sync" : "Live"}</span>
          </div>
          <div className="max-h-[440px] overflow-y-auto p-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-[16px] p-3 transition-colors duration-200 hover:bg-blue-50">
                <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-[11px] bg-blue-50 text-blue-600">
                  <CheckCircle2 size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-slate-950">{item.title}</span>
                  <span className="mt-0.5 block text-xs font-medium leading-5 text-slate-500">{item.body}</span>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{item.module}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
