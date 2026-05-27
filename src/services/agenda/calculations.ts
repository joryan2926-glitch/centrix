import type { AgendaData, AgendaFilters, CalendarEvent, CalendarEventStatus, CalendarEventType, Reservation } from "@/types/agenda";

export const eventStatusLabels: Record<CalendarEventStatus, string> = {
  confirmed: "Confirme",
  pending: "En attente",
  cancelled: "Annule",
  completed: "Termine"
};

export const eventTypeLabels: Record<CalendarEventType, string> = {
  client_meeting: "Client",
  team_meeting: "Equipe",
  call: "Appel",
  video: "Visio",
  internal: "Interne"
};

export function statusTone(status: CalendarEventStatus) {
  if (status === "confirmed") return "emerald";
  if (status === "pending") return "cyan";
  if (status === "cancelled") return "rose";
  return "violet";
}

export function priorityTone(priority: "low" | "medium" | "high" | "urgent") {
  if (priority === "urgent") return "rose";
  if (priority === "high") return "violet";
  if (priority === "medium") return "cyan";
  return "emerald";
}

export function getAgendaDashboard(data: AgendaData) {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date();

  return {
    todayMeetings: data.events.filter((event) => event.start.slice(0, 10) === today && event.status !== "cancelled").length,
    upcomingMeetings: data.events.filter((event) => new Date(event.start) >= future && event.status !== "cancelled").length,
    plannedTasks: data.tasks.filter((task) => !task.done).length,
    reservations: data.reservations.filter((reservation) => reservation.status !== "cancelled").length,
    completed: data.events.filter((event) => event.status === "completed").length,
    cancelled: data.events.filter((event) => event.status === "cancelled").length
  };
}

export function filterEvents(events: CalendarEvent[], filters: AgendaFilters) {
  const query = filters.query.trim().toLowerCase();

  return events.filter((event) => {
    const matchesQuery =
      !query ||
      [event.title, event.description, event.location, event.videoUrl, ...event.participants].join(" ").toLowerCase().includes(query);
    const matchesStatus = filters.status === "all" || event.status === filters.status;
    const matchesType = filters.type === "all" || event.type === filters.type;

    return matchesQuery && matchesStatus && matchesType;
  });
}

export function buildEvent(input: {
  calendarId: string;
  title: string;
  description: string;
  type: CalendarEventType;
  start: string;
  end: string;
  participants: string[];
  location: string;
  videoUrl: string;
  color: string;
}): CalendarEvent {
  const now = new Date().toISOString();
  const durationMinutes = Math.max(15, Math.round((new Date(input.end).getTime() - new Date(input.start).getTime()) / 60000));

  return {
    id: `evt-${crypto.randomUUID()}`,
    calendarId: input.calendarId,
    title: input.title,
    description: input.description,
    type: input.type,
    status: "pending",
    start: input.start,
    end: input.end,
    durationMinutes,
    participants: input.participants,
    location: input.location,
    videoUrl: input.videoUrl,
    color: input.color,
    createdAt: now,
    updatedAt: now
  };
}

export function duplicateEvent(event: CalendarEvent): CalendarEvent {
  const start = new Date(event.start);
  const end = new Date(event.end);
  start.setDate(start.getDate() + 1);
  end.setDate(end.getDate() + 1);

  return {
    ...event,
    id: `evt-${crypto.randomUUID()}`,
    title: `${event.title} copie`,
    status: "pending",
    start: start.toISOString(),
    end: end.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function hasReservationConflict(reservations: Reservation[], candidate: Pick<Reservation, "resourceName" | "start" | "end" | "id">) {
  const start = new Date(candidate.start).getTime();
  const end = new Date(candidate.end).getTime();

  return reservations.some((reservation) => {
    if (reservation.id === candidate.id || reservation.resourceName !== candidate.resourceName || reservation.status === "cancelled") {
      return false;
    }

    const reservationStart = new Date(reservation.start).getTime();
    const reservationEnd = new Date(reservation.end).getTime();
    return start < reservationEnd && end > reservationStart;
  });
}
