import type { AgendaData } from "@/types/agenda";

export const agendaFallbackData: AgendaData = {
  calendars: [
    { id: "cal-sales", name: "Sales", color: "#5ee7ff", owner: "sarah@centrix.fr", sharedWith: ["team@centrix.fr"], permission: "team" },
    { id: "cal-ops", name: "Operations", color: "#8b5cf6", owner: "ops@centrix.fr", sharedWith: ["company@centrix.fr"], permission: "company" }
  ],
  events: [
    {
      id: "evt-demo-novacore",
      calendarId: "cal-sales",
      title: "Demo client NovaCore",
      description: "Presentation CRM et facturation connectee.",
      type: "client_meeting",
      status: "confirmed",
      start: "2026-05-26T09:30:00.000Z",
      end: "2026-05-26T10:30:00.000Z",
      durationMinutes: 60,
      participants: ["Emma Laurent", "Sarah Diallo"],
      location: "Salle Orbit",
      videoUrl: "https://meet.centrix.local/novacore",
      color: "#5ee7ff",
      createdAt: "2026-05-20T08:00:00.000Z",
      updatedAt: "2026-05-24T08:00:00.000Z"
    },
    {
      id: "evt-product-weekly",
      calendarId: "cal-ops",
      title: "Weekly produit",
      description: "Roadmap, risques et arbitrages.",
      type: "team_meeting",
      status: "pending",
      start: "2026-05-27T13:00:00.000Z",
      end: "2026-05-27T14:00:00.000Z",
      durationMinutes: 60,
      participants: ["Lea Martin", "Adam Nguyen"],
      location: "Remote",
      videoUrl: "https://meet.centrix.local/product",
      color: "#8b5cf6",
      createdAt: "2026-05-21T08:00:00.000Z",
      updatedAt: "2026-05-21T08:00:00.000Z"
    },
    {
      id: "evt-finance-close",
      calendarId: "cal-ops",
      title: "Cloture finance",
      description: "Controle TVA et exports comptables.",
      type: "internal",
      status: "completed",
      start: "2026-05-25T15:00:00.000Z",
      end: "2026-05-25T16:30:00.000Z",
      durationMinutes: 90,
      participants: ["Finance Team"],
      location: "Salle Ledger",
      videoUrl: "",
      color: "#34d399",
      createdAt: "2026-05-18T08:00:00.000Z",
      updatedAt: "2026-05-25T16:30:00.000Z"
    }
  ],
  participants: [
    { id: "part-1", eventId: "evt-demo-novacore", name: "Emma Laurent", email: "emma@novacore.example", role: "guest", response: "accepted" },
    { id: "part-2", eventId: "evt-demo-novacore", name: "Sarah Diallo", email: "sarah@centrix.fr", role: "host", response: "accepted" }
  ],
  reservations: [
    {
      id: "res-orbit",
      eventId: "evt-demo-novacore",
      type: "room",
      resourceName: "Salle Orbit",
      capacity: 8,
      start: "2026-05-26T09:30:00.000Z",
      end: "2026-05-26T10:30:00.000Z",
      status: "confirmed",
      approvalMode: "auto",
      createdAt: "2026-05-20T08:00:00.000Z"
    }
  ],
  reminders: [
    { id: "rem-demo", eventId: "evt-demo-novacore", minutesBefore: 15, channel: "dashboard", sent: false }
  ],
  tasks: [
    {
      id: "task-demo",
      eventId: "evt-demo-novacore",
      title: "Preparer deck executive",
      priority: "high",
      done: false,
      dueDate: "2026-05-26",
      checklist: [
        { id: "check-1", label: "Slides ROI", done: true },
        { id: "check-2", label: "Cas d'usage finance", done: false }
      ],
      createdAt: "2026-05-24T08:00:00.000Z"
    }
  ],
  comments: [
    { id: "comment-1", eventId: "evt-demo-novacore", author: "Sarah", body: "Ajouter le scenario facturation dans la demo.", createdAt: "2026-05-24T08:00:00.000Z" }
  ],
  availabilitySlots: [
    { id: "slot-sarah-1", userEmail: "sarah@centrix.fr", dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }
  ]
};
