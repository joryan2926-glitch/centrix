import { formatAgendaDate, formatAgendaTime } from "@/lib/agenda/format";
import type { CalendarEvent } from "@/types/agenda";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { eventStatusLabels, statusTone } from "@/services/agenda/calculations";

export function AgendaTimeline({ events, onSelect }: { events: CalendarEvent[]; onSelect: (id: string) => void }) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-white">Timeline moderne</h2>
      <div className="mt-5 space-y-3">
        {events.slice(0, 8).map((event) => (
          <button
            key={event.id}
            className="grid w-full gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white/[0.075] sm:grid-cols-[120px_1fr_auto]"
            onClick={() => onSelect(event.id)}
          >
            <span className="text-sm font-semibold text-cyan-100">{formatAgendaTime(event.start)}</span>
            <span>
              <span className="block text-sm font-semibold text-white">{event.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{formatAgendaDate(event.start)} · {event.location}</span>
            </span>
            <Badge tone={statusTone(event.status)}>{eventStatusLabels[event.status]}</Badge>
          </button>
        ))}
      </div>
    </Card>
  );
}
