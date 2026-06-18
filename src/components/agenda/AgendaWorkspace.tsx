"use client";

import dynamic from "next/dynamic";
import {
  BellRing,
  CalendarCheck,
  CalendarDays,
  CalendarSync,
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  Filter,
  MessageSquare,
  Plus,
  Save,
  Search,
  Trash2,
  UsersRound,
  Video
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { googleCalendarOAuthAction } from "@/app/auth/actions";
import { fromDateTimeLocal, formatAgendaDate, formatAgendaTime, toDateTimeLocal } from "@/lib/agenda/format";
import { isGoogleAuthEnabled } from "@/lib/integrations/google";
import { buildEvent, duplicateEvent, eventStatusLabels, eventTypeLabels, filterEvents, getAgendaDashboard, hasReservationConflict, priorityTone, statusTone } from "@/services/agenda/calculations";
import { deleteAgendaWorkflow, upsertAgendaTask, upsertAgendaWorkflow } from "@/services/agenda/supabase";
import { useAgendaData } from "@/hooks/agenda/useAgendaData";
import type { AgendaFilters, CalendarEvent, CalendarEventType } from "@/types/agenda";
import { AgendaKpiCard } from "@/ui/agenda/AgendaKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";
import { AgendaTimeline } from "@/components/agenda/AgendaTimeline";

const AgendaCalendar = dynamic(() => import("@/components/agenda/AgendaCalendar").then((module) => module.AgendaCalendar), {
  loading: () => <Skeleton className="h-[680px]" />,
  ssr: false
});
const googleAuthEnabled = isGoogleAuthEnabled();

const views = [
  { id: "calendar", label: "Calendrier", icon: CalendarDays },
  { id: "planning", label: "Planning", icon: Clock3 },
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "tasks", label: "Taches", icon: CheckCircle2 },
  { id: "team", label: "Equipe", icon: UsersRound }
] as const;

type View = (typeof views)[number]["id"];

type Draft = {
  title: string;
  description: string;
  type: CalendarEventType;
  start: string;
  end: string;
  participants: string;
  location: string;
  videoUrl: string;
};

function defaultDraft(start?: string, end?: string): Draft {
  const startDate = start ?? new Date().toISOString();
  const endDate = end ?? new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return {
    title: "Nouveau rendez-vous",
    description: "Description de l'evenement",
    type: "client_meeting",
    start: toDateTimeLocal(startDate),
    end: toDateTimeLocal(endDate),
    participants: "",
    location: "Salle Orbit",
    videoUrl: "https://meet.centrix.local"
  };
}

export function AgendaWorkspace() {
  const { data, loading, mode, toast, mutate, refresh, sync, notify } = useAgendaData();
  const [view, setView] = useState<View>("calendar");
  const [filters, setFilters] = useState<AgendaFilters>({ query: "", status: "all", type: "all" });
  const [selectedId, setSelectedId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(defaultDraft());
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => filterEvents(data.events, filters), [data.events, filters]);
  const dashboard = useMemo(() => getAgendaDashboard(data), [data]);
  const selected = data.events.find((event) => event.id === selectedId) ?? data.events[0] ?? null;
  const selectedTasks = data.tasks.filter((task) => task.eventId === selected?.id);
  const selectedComments = data.comments.filter((comment) => comment.eventId === selected?.id);
  const selectedReservation = data.reservations.find((reservation) => reservation.eventId === selected?.id);

  function openCreate(start?: string, end?: string) {
    setEditingId(null);
    setDraft(defaultDraft(start, end));
    setModalOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditingId(event.id);
    setDraft({
      description: event.description,
      end: toDateTimeLocal(event.end),
      location: event.location,
      participants: event.participants.join(", "),
      start: toDateTimeLocal(event.start),
      title: event.title,
      type: event.type,
      videoUrl: event.videoUrl
    });
    setModalOpen(true);
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId) {
      const updatedEvent = data.events.find((item) => item.id === editingId);
      if (!updatedEvent) return;
      const nextEvent = {
        ...updatedEvent,
        description: draft.description,
        durationMinutes: Math.max(15, Math.round((new Date(fromDateTimeLocal(draft.end)).getTime() - new Date(fromDateTimeLocal(draft.start)).getTime()) / 60000)),
        end: fromDateTimeLocal(draft.end),
        location: draft.location,
        participants: draft.participants.split(",").map((participant) => participant.trim()).filter(Boolean),
        start: fromDateTimeLocal(draft.start),
        title: draft.title,
        type: draft.type,
        updatedAt: new Date().toISOString(),
        videoUrl: draft.videoUrl
      };
      mutate(
        (current) => ({
          ...current,
          events: current.events.map((item) => item.id === editingId ? nextEvent : item),
          reservations: current.reservations.map((reservation) => reservation.eventId === editingId ? { ...reservation, end: nextEvent.end, resourceName: nextEvent.location, start: nextEvent.start } : reservation)
        }),
        { title: "Evenement modifie", detail: `${draft.title} est a jour.` }
      );
      if (mode === "supabase") {
        const linkedReservation = data.reservations.find((reservation) => reservation.eventId === editingId);
        const result = await upsertAgendaWorkflow({
          event: nextEvent,
          reservation: linkedReservation ? { ...linkedReservation, end: nextEvent.end, resourceName: nextEvent.location, start: nextEvent.start } : null
        });
        if (result.error) notify("Sauvegarde Supabase impossible", result.error);
        else await refresh();
      }
      setEditingId(null);
      setModalOpen(false);
      return;
    }

    const calendar = data.calendars[0];
    const newEvent = buildEvent({
      calendarId: calendar?.id ?? "cal-sales",
      title: draft.title,
      description: draft.description,
      type: draft.type,
      start: fromDateTimeLocal(draft.start),
      end: fromDateTimeLocal(draft.end),
      participants: draft.participants.split(",").map((item) => item.trim()).filter(Boolean),
      location: draft.location,
      videoUrl: draft.videoUrl,
      color: calendar?.color ?? "#5ee7ff"
    });

    const reservationCandidate = {
      id: `res-${crypto.randomUUID()}`,
      eventId: newEvent.id,
      type: "room" as const,
      resourceName: draft.location,
      capacity: 8,
      start: newEvent.start,
      end: newEvent.end,
      status: "pending" as const,
      approvalMode: "manual" as const,
      createdAt: new Date().toISOString()
    };

    if (hasReservationConflict(data.reservations, reservationCandidate)) {
      notify("Conflit reservation", "Ce creneau est deja reserve pour cette ressource.");
      return;
    }

    const reminder = { id: `rem-${crypto.randomUUID()}`, eventId: newEvent.id, minutesBefore: 15, channel: "dashboard" as const, sent: false };
    mutate(
      (current) => ({
        ...current,
        events: [newEvent, ...current.events],
        reservations: [reservationCandidate, ...current.reservations],
        reminders: [reminder, ...current.reminders]
      }),
      { title: "Evenement cree", detail: `${newEvent.title} est ajoute a l'agenda.` }
    );
    if (mode === "supabase") {
      const result = await upsertAgendaWorkflow({ event: newEvent, reminder, reservation: reservationCandidate });
      if (result.error) notify("Sauvegarde Supabase impossible", result.error);
      else await refresh();
    }
    setSelectedId(newEvent.id);
    setModalOpen(false);
  }

  async function updateEventTime(eventId: string, start: string, end: string) {
    const event = data.events.find((item) => item.id === eventId);
    if (!event) return;
    const nextEvent = {
      ...event,
      durationMinutes: Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)),
      end,
      start,
      updatedAt: new Date().toISOString()
    };
    mutate(
      (current) => ({
        ...current,
        events: current.events.map((item) => item.id === eventId ? nextEvent : item),
        reservations: current.reservations.map((reservation) => reservation.eventId === eventId ? { ...reservation, end, start } : reservation)
      }),
      { title: "Agenda mis a jour", detail: "Le creneau a ete modifie." }
    );
    if (mode === "supabase") {
      const linkedReservation = data.reservations.find((reservation) => reservation.eventId === eventId);
      const result = await upsertAgendaWorkflow({
        event: nextEvent,
        reservation: linkedReservation ? { ...linkedReservation, end, start } : null
      });
      if (result.error) notify("Synchronisation Supabase impossible", result.error);
      else await refresh();
    }
  }

  async function deleteEvent(id: string) {
    mutate(
      (current) => ({
        ...current,
        events: current.events.filter((event) => event.id !== id),
        reservations: current.reservations.filter((reservation) => reservation.eventId !== id),
        tasks: current.tasks.filter((task) => task.eventId !== id),
        comments: current.comments.filter((comment) => comment.eventId !== id)
      }),
      { title: "Evenement supprime", detail: "Les donnees liees ont ete retirees." }
    );
    if (mode === "supabase") {
      const result = await deleteAgendaWorkflow(id);
      if (result.error) notify("Suppression Supabase impossible", result.error);
      else await refresh();
    }
  }

  async function cloneEvent(event: CalendarEvent) {
    const cloned = duplicateEvent(event);
    mutate((current) => ({ ...current, events: [cloned, ...current.events] }), {
      title: "Evenement duplique",
      detail: `${cloned.title} est pret a etre ajuste.`
    });
    if (mode === "supabase") {
      const result = await upsertAgendaWorkflow({ event: cloned });
      if (result.error) notify("Duplication Supabase impossible", result.error);
      else await refresh();
    }
    setSelectedId(cloned.id);
  }

  async function toggleTask(id: string) {
    const nextTask = data.tasks.find((task) => task.id === id);
    if (!nextTask) return;
    const toggled = { ...nextTask, done: !nextTask.done };
    mutate((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === id ? toggled : task))
    }));
    if (mode === "supabase") {
      const result = await upsertAgendaTask(toggled);
      if (result.error) notify("Tache non synchronisee", result.error);
      else await refresh();
    }
  }

  async function syncGoogleCalendar() {
    notify("Google Calendar", "Synchronisation en cours...");
    const response = await fetch("/api/integrations/google-calendar/sync", { method: "POST" });
    const payload = await response.json().catch(() => ({})) as { imported?: number; error?: string };
    if (!response.ok) {
      notify("Google Calendar indisponible", payload.error ?? "Reconnectez votre compte Google.");
      return;
    }
    await refresh();
    notify("Google Calendar synchronise", `${payload.imported ?? 0} evenement(s) importe(s).`);
  }

  async function connectGoogleCalendar() {
    notify("Google Calendar", "Ouverture du consentement Google...");
    const result = await googleCalendarOAuthAction();
    if (!result.oauthUrl) {
      notify(result.title, result.detail);
      return;
    }
    window.location.href = result.oauthUrl;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-28" />)}
        </section>
        <Skeleton className="h-[680px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <CalendarDays size={14} />
            Agenda & Reservations
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Agenda</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Calendrier collaboratif, reservations, rappels, taches et disponibilites equipe dans une experience SaaS premium.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openCreate()} variant="primary"><Plus size={17} />Evenement</Button>
          {googleAuthEnabled ? <Button onClick={connectGoogleCalendar}><CalendarCheck size={17} />Autoriser Google Calendar</Button> : null}
          {googleAuthEnabled ? <Button onClick={syncGoogleCalendar}><CalendarSync size={17} />Google Calendar</Button> : null}
          <Button onClick={sync}><Save size={17} />{mode === "supabase" ? "Sync Supabase" : "Sauver local"}</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AgendaKpiCard icon={<CalendarDays size={18} />} label="Aujourd'hui" value={String(dashboard.todayMeetings)} detail="Rendez-vous du jour" />
        <AgendaKpiCard icon={<Clock3 size={18} />} label="A venir" value={String(dashboard.upcomingMeetings)} detail="Reunions futures" />
        <AgendaKpiCard icon={<CheckCircle2 size={18} />} label="Taches" value={String(dashboard.plannedTasks)} detail="Checklist active" />
        <AgendaKpiCard icon={<CalendarCheck size={18} />} label="Reservations" value={String(dashboard.reservations)} detail="Salles et ressources" />
        <AgendaKpiCard icon={<Video size={18} />} label="Termines" value={String(dashboard.completed)} detail="Evenements clos" />
        <AgendaKpiCard icon={<BellRing size={18} />} label="Annules" value={String(dashboard.cancelled)} detail="A replanifier" />
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
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Realtime</p>
            <p className="mt-1 text-sm text-slate-300">{mode === "supabase" ? "Connecte Supabase" : "Mode local fallback"}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <label className="flex h-11 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Search size={17} />
                <input className="w-full bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Recherche evenement, participant, lieu..." value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} />
              </label>
              <label className="flex h-11 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Filter size={16} />
                <select className="w-full bg-slate-950/80 text-white outline-none" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as AgendaFilters["status"] }))}>
                  <option value="all">Tous statuts</option>
                  {Object.entries(eventStatusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
              <select className="h-11 rounded-[8px] border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as AgendaFilters["type"] }))}>
                <option value="all">Tous types</option>
                {Object.entries(eventTypeLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
          </Card>

          {view === "calendar" ? (
            <div className="grid gap-6 2xl:grid-cols-[1fr_360px]">
              <AgendaCalendar events={filteredEvents} onDateSelect={openCreate} onEventChange={updateEventTime} onEventClick={setSelectedId} />
              <EventDetail event={selected} comments={selectedComments} reservation={selectedReservation} tasks={selectedTasks} onClone={cloneEvent} onDelete={deleteEvent} onEdit={openEdit} onToggleTask={toggleTask} />
            </div>
          ) : null}
          {view === "planning" ? <AgendaTimeline events={filteredEvents} onSelect={setSelectedId} /> : null}
          {view === "reservations" ? <ReservationsView data={data} /> : null}
          {view === "tasks" ? <TasksView data={data} onToggle={toggleTask} /> : null}
          {view === "team" ? <TeamView data={data} /> : null}
        </div>
      </section>

      <EventModal draft={draft} open={modalOpen} setDraft={setDraft} onClose={() => setModalOpen(false)} onSubmit={createEvent} />
    </div>
  );
}

function EventDetail({ event, tasks, comments, reservation, onDelete, onClone, onEdit, onToggleTask }: { event: CalendarEvent | null; tasks: ReturnType<typeof useAgendaData>["data"]["tasks"]; comments: ReturnType<typeof useAgendaData>["data"]["comments"]; reservation?: ReturnType<typeof useAgendaData>["data"]["reservations"][number]; onDelete: (id: string) => void; onClone: (event: CalendarEvent) => void; onEdit: (event: CalendarEvent) => void; onToggleTask: (id: string) => void }) {
  if (!event) return <EmptyState icon={<CalendarDays size={18} />} title="Aucun evenement" detail="Creez ou selectionnez un evenement." />;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-xl font-semibold text-white">{event.title}</h2><p className="mt-1 text-sm text-slate-400">{event.description}</p></div>
        <Badge tone={statusTone(event.status)}>{eventStatusLabels[event.status]}</Badge>
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-300">
        <p>{formatAgendaDate(event.start)} · {formatAgendaTime(event.start)} - {formatAgendaTime(event.end)}</p>
        <p>{event.location} · {event.durationMinutes} min</p>
        <p>{event.participants.join(", ")}</p>
        {event.videoUrl ? <p className="text-cyan-100">{event.videoUrl}</p> : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => onClone(event)}><Copy size={16} />Dupliquer</Button>
        <Button onClick={() => onEdit(event)}><Edit3 size={16} />Editer</Button>
        <Button onClick={() => onDelete(event.id)} variant="ghost"><Trash2 size={16} />Supprimer</Button>
      </div>
      <div className="mt-6 grid gap-4">
        <MiniPanel title="Reservation" icon={<CalendarCheck size={17} />}>
          {reservation ? <p>{reservation.resourceName} · {reservation.capacity} pers. · {reservation.status}</p> : <p>Aucune reservation.</p>}
        </MiniPanel>
        <MiniPanel title="Taches liees" icon={<CheckCircle2 size={17} />}>
          {tasks.length ? tasks.map((task) => <button key={task.id} className="block w-full rounded-[8px] bg-white/[0.045] p-3 text-left" onClick={() => onToggleTask(task.id)}><span className={task.done ? "line-through text-slate-500" : "text-slate-200"}>{task.title}</span><Badge className="ml-2" tone={priorityTone(task.priority)}>{task.priority}</Badge></button>) : <p>Aucune tache.</p>}
        </MiniPanel>
        <MiniPanel title="Commentaires equipe" icon={<MessageSquare size={17} />}>
          {comments.length ? comments.map((comment) => <p key={comment.id} className="rounded-[8px] bg-white/[0.045] p-3">{comment.author}: {comment.body}</p>) : <p>Aucun commentaire.</p>}
        </MiniPanel>
      </div>
    </Card>
  );
}

function ReservationsView({ data }: { data: ReturnType<typeof useAgendaData>["data"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.reservations.map((reservation) => (
        <Card key={reservation.id} className="p-5" interactive>
          <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-white">{reservation.resourceName}</h3><Badge tone={reservation.status === "confirmed" ? "emerald" : "cyan"}>{reservation.status}</Badge></div>
          <p className="mt-3 text-sm text-slate-400">{reservation.type} · capacite {reservation.capacity}</p>
          <p className="mt-3 text-sm text-cyan-100">{formatAgendaDate(reservation.start)} · {formatAgendaTime(reservation.start)} - {formatAgendaTime(reservation.end)}</p>
          <p className="mt-2 text-xs text-slate-500">Validation {reservation.approvalMode}</p>
        </Card>
      ))}
    </div>
  );
}

function TasksView({ data, onToggle }: { data: ReturnType<typeof useAgendaData>["data"]; onToggle: (id: string) => void }) {
  return (
    <Card>
      <div className="divide-y divide-white/10">
        {data.tasks.map((task) => (
          <button key={task.id} className="grid w-full gap-3 px-5 py-4 text-left hover:bg-white/[0.045] sm:grid-cols-[1fr_120px_140px]" onClick={() => onToggle(task.id)}>
            <span className={task.done ? "text-slate-500 line-through" : "font-semibold text-white"}>{task.title}</span>
            <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
            <span className="text-sm text-slate-400">{formatAgendaDate(task.dueDate)}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function TeamView({ data }: { data: ReturnType<typeof useAgendaData>["data"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.availabilitySlots.map((slot) => (
        <Card key={slot.id} className="p-5" interactive>
          <h3 className="font-semibold text-white">{slot.userEmail}</h3>
          <p className="mt-2 text-sm text-slate-400">Jour {slot.dayOfWeek} · {slot.startTime} - {slot.endTime}</p>
          <p className="mt-3 text-sm text-cyan-100">Disponibilite collaborateur</p>
        </Card>
      ))}
    </div>
  );
}

function MiniPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><span className="text-cyan-200">{icon}</span>{title}</h3><div className="space-y-2 text-sm text-slate-300">{children}</div></div>;
}

function EventModal({ open, draft, setDraft, onSubmit, onClose }: { open: boolean; draft: Draft; setDraft: (draft: Draft) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <Modal open={open} title="Creer un evenement" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Titre" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} />
          <label className="space-y-2"><span className="text-xs text-slate-500">Type</span><select className="h-10 w-full rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CalendarEventType })}>{Object.entries(eventTypeLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <Input label="Debut" type="datetime-local" value={draft.start} onChange={(value) => setDraft({ ...draft, start: value })} />
          <Input label="Fin" type="datetime-local" value={draft.end} onChange={(value) => setDraft({ ...draft, end: value })} />
          <Input label="Participants" value={draft.participants} onChange={(value) => setDraft({ ...draft, participants: value })} />
          <Input label="Lieu / ressource" value={draft.location} onChange={(value) => setDraft({ ...draft, location: value })} />
          <Input label="Lien visio" value={draft.videoUrl} onChange={(value) => setDraft({ ...draft, videoUrl: value })} />
          <Input label="Description" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} />
        </div>
        <div className="flex justify-end gap-2"><Button onClick={onClose} type="button" variant="ghost">Annuler</Button><Button type="submit" variant="primary">Creer</Button></div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return <label className="space-y-2"><span className="text-xs text-slate-500">{label}</span><input className="h-10 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
