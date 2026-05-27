import type { HrData } from "@/types/hr";

export const hrFallbackData: HrData = {
  employees: [
    {
      id: "emp-lea",
      firstName: "Lea",
      lastName: "Martin",
      email: "lea.martin@centrix.example",
      phone: "+33 6 11 22 33 44",
      role: "Product Designer",
      department: "product",
      status: "onboarding",
      location: "Paris",
      manager: "Nora",
      startDate: "2026-05-14",
      avatarInitials: "LM",
      createdAt: "2026-05-01T08:00:00.000Z",
      updatedAt: "2026-05-24T10:00:00.000Z"
    },
    {
      id: "emp-sarah",
      firstName: "Sarah",
      lastName: "Diallo",
      email: "sarah.diallo@centrix.example",
      phone: "+33 6 55 44 33 22",
      role: "Sales Lead",
      department: "sales",
      status: "active",
      location: "Lyon",
      manager: "CEO",
      startDate: "2025-11-03",
      avatarInitials: "SD",
      createdAt: "2025-11-03T08:00:00.000Z",
      updatedAt: "2026-05-21T09:00:00.000Z"
    },
    {
      id: "emp-adam",
      firstName: "Adam",
      lastName: "Nguyen",
      email: "adam.nguyen@centrix.example",
      phone: "+33 7 14 25 36 47",
      role: "Fullstack Engineer",
      department: "engineering",
      status: "active",
      location: "Remote",
      manager: "Nora",
      startDate: "2025-09-12",
      avatarInitials: "AN",
      createdAt: "2025-09-12T08:00:00.000Z",
      updatedAt: "2026-05-20T11:00:00.000Z"
    }
  ],
  contracts: [
    { id: "contract-lea", employeeId: "emp-lea", type: "cdi", startDate: "2026-05-14", endDate: null, weeklyHours: 39, signed: true, createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "contract-sarah", employeeId: "emp-sarah", type: "cdi", startDate: "2025-11-03", endDate: null, weeklyHours: 39, signed: true, createdAt: "2025-11-03T08:00:00.000Z" },
    { id: "contract-adam", employeeId: "emp-adam", type: "freelance", startDate: "2025-09-12", endDate: "2026-09-12", weeklyHours: 32, signed: true, createdAt: "2025-09-12T08:00:00.000Z" }
  ],
  leaves: [
    { id: "leave-sarah", employeeId: "emp-sarah", type: "paid", startDate: "2026-06-10", endDate: "2026-06-14", status: "approved", days: 5, createdAt: "2026-05-20T08:00:00.000Z" },
    { id: "leave-adam", employeeId: "emp-adam", type: "remote", startDate: "2026-05-28", endDate: "2026-05-30", status: "pending", days: 3, createdAt: "2026-05-23T08:00:00.000Z" }
  ],
  absences: [
    { id: "absence-lea", employeeId: "emp-lea", reason: "Formation onboarding", date: "2026-05-27", justified: true, createdAt: "2026-05-24T08:00:00.000Z" }
  ],
  salaries: [
    { id: "salary-lea", employeeId: "emp-lea", grossAnnual: 56000, bonus: 4000, currency: "EUR", effectiveDate: "2026-05-14", createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "salary-sarah", employeeId: "emp-sarah", grossAnnual: 72000, bonus: 12000, currency: "EUR", effectiveDate: "2026-01-01", createdAt: "2026-01-01T08:00:00.000Z" },
    { id: "salary-adam", employeeId: "emp-adam", grossAnnual: 92000, bonus: 0, currency: "EUR", effectiveDate: "2026-01-01", createdAt: "2026-01-01T08:00:00.000Z" }
  ],
  documents: [
    { id: "doc-lea-contract", employeeId: "emp-lea", title: "Contrat CDI signe", category: "contract", url: "#", createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "doc-sarah-payroll", employeeId: "emp-sarah", title: "Bulletin avril", category: "payroll", url: "#", createdAt: "2026-05-01T08:00:00.000Z" }
  ],
  schedule: [
    { id: "schedule-lea", employeeId: "emp-lea", date: "2026-05-28", label: "Point onboarding", kind: "meeting", createdAt: "2026-05-24T08:00:00.000Z" },
    { id: "schedule-adam", employeeId: "emp-adam", date: "2026-05-29", label: "Revue architecture", kind: "review", createdAt: "2026-05-24T08:00:00.000Z" }
  ],
  notifications: [
    { id: "notif-leave", title: "Conge a valider", detail: "Adam demande 3 jours remote.", tone: "warning", createdAt: "2026-05-23T08:00:00.000Z" },
    { id: "notif-contract", title: "Document signe", detail: "Le contrat de Lea est complet.", tone: "success", createdAt: "2026-05-24T08:00:00.000Z" }
  ]
};
