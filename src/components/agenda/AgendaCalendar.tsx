"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import type { CalendarEvent } from "@/types/agenda";
import { Card } from "@/ui/Card";

export function AgendaCalendar({
  events,
  onEventClick,
  onEventChange,
  onDateSelect
}: {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onEventChange: (eventId: string, start: string, end: string) => void;
  onDateSelect: (start: string, end: string) => void;
}) {
  return (
    <Card className="p-3">
      <div className="agenda-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
          }}
          selectable
          editable
          eventResizableFromStart
          height="auto"
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.color,
            borderColor: event.color,
            extendedProps: event
          }))}
          eventClick={(info: EventClickArg) => onEventClick(info.event.id)}
          eventDrop={(info: EventDropArg) => onEventChange(info.event.id, info.event.start?.toISOString() ?? "", info.event.end?.toISOString() ?? info.event.start?.toISOString() ?? "")}
          eventResize={(info: EventResizeDoneArg) => onEventChange(info.event.id, info.event.start?.toISOString() ?? "", info.event.end?.toISOString() ?? "")}
          select={(info) => onDateSelect(info.start.toISOString(), info.end.toISOString())}
        />
      </div>
    </Card>
  );
}
