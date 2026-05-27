export type CalendarEventType = "client_meeting" | "team_meeting" | "call" | "video" | "internal";
export type CalendarEventStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ReservationType = "room" | "service" | "resource";
export type ReservationStatus = "confirmed" | "pending" | "cancelled";

export type Calendar = {
  id: string;
  name: string;
  color: string;
  owner: string;
  sharedWith: string[];
  permission: "private" | "team" | "company";
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  description: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  start: string;
  end: string;
  durationMinutes: number;
  participants: string[];
  location: string;
  videoUrl: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type EventParticipant = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  role: "host" | "guest";
  response: "accepted" | "pending" | "declined";
};

export type Reservation = {
  id: string;
  eventId: string | null;
  type: ReservationType;
  resourceName: string;
  capacity: number;
  start: string;
  end: string;
  status: ReservationStatus;
  approvalMode: "auto" | "manual";
  createdAt: string;
};

export type Reminder = {
  id: string;
  eventId: string;
  minutesBefore: number;
  channel: "dashboard" | "email_future";
  sent: boolean;
};

export type AgendaTask = {
  id: string;
  eventId: string | null;
  title: string;
  priority: TaskPriority;
  done: boolean;
  dueDate: string;
  checklist: Array<{ id: string; label: string; done: boolean }>;
  createdAt: string;
};

export type EventComment = {
  id: string;
  eventId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type AvailabilitySlot = {
  id: string;
  userEmail: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type AgendaData = {
  calendars: Calendar[];
  events: CalendarEvent[];
  participants: EventParticipant[];
  reservations: Reservation[];
  reminders: Reminder[];
  tasks: AgendaTask[];
  comments: EventComment[];
  availabilitySlots: AvailabilitySlot[];
};

export type AgendaFilters = {
  query: string;
  status: "all" | CalendarEventStatus;
  type: "all" | CalendarEventType;
};
