"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useHrData } from "@/hooks/useHrData";
import {
  buildEmployee,
  createHrId,
  createNotification,
  departmentLabels,
  employeeStatusLabels,
  filterEmployees,
  formatHrCurrency,
  formatHrDate,
  getHrDashboard,
  statusTone
} from "@/services/hr";
import type { HrDepartment, HrEmployee, HrFilters } from "@/types/hr";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const hrViews = [
  { id: "employees", label: "Employes", icon: UsersRound },
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "payroll", label: "Salaires", icon: WalletCards }
] as const;

type HrView = (typeof hrViews)[number]["id"];

type EmployeeDraft = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: HrDepartment;
  salary: number;
};

const emptyDraft: EmployeeDraft = {
  firstName: "Nouveau",
  lastName: "Collaborateur",
  email: "collaborateur@centrix.fr",
  role: "Role a definir",
  department: "people",
  salary: 52000
};

export function HrWorkspace() {
  const { data, loading, mode, toast, mutate, removeEmployee, sync } = useHrData();
  const [view, setView] = useState<HrView>("employees");
  const [selectedId, setSelectedId] = useState("emp-lea");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft>(emptyDraft);
  const [filters, setFilters] = useState<HrFilters>({ query: "", department: "all", status: "all" });

  const employees = useMemo(() => filterEmployees(data.employees, filters), [data.employees, filters]);
  const selected = data.employees.find((employee) => employee.id === selectedId) ?? data.employees[0] ?? null;
  const dashboard = useMemo(() => getHrDashboard(data), [data]);
  const selectedContracts = data.contracts.filter((contract) => contract.employeeId === selected?.id);
  const selectedLeaves = data.leaves.filter((leave) => leave.employeeId === selected?.id);
  const selectedAbsences = data.absences.filter((absence) => absence.employeeId === selected?.id);
  const selectedSalaries = data.salaries.filter((salary) => salary.employeeId === selected?.id);
  const selectedDocuments = data.documents.filter((document) => document.employeeId === selected?.id);

  function createEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const employee = {
      ...buildEmployee(data.employees.length),
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      role: draft.role,
      department: draft.department,
      avatarInitials: `${draft.firstName[0] ?? "N"}${draft.lastName[0] ?? "C"}`.toUpperCase()
    };

    mutate(
      (current) => ({
        ...current,
        employees: [employee, ...current.employees],
        contracts: [
          {
            id: createHrId("contract"),
            employeeId: employee.id,
            type: "cdi",
            startDate: employee.startDate,
            endDate: null,
            weeklyHours: 39,
            signed: false,
            createdAt: new Date().toISOString()
          },
          ...current.contracts
        ],
        salaries: [
          {
            id: createHrId("salary"),
            employeeId: employee.id,
            grossAnnual: Number(draft.salary),
            bonus: 0,
            currency: "EUR",
            effectiveDate: employee.startDate,
            createdAt: new Date().toISOString()
          },
          ...current.salaries
        ],
        notifications: [createNotification("Employe cree", `${employee.firstName} ${employee.lastName} rejoint le module RH.`, "success"), ...current.notifications]
      }),
      { title: "Employe cree", detail: `${employee.firstName} ${employee.lastName} est ajoute.` }
    );
    setSelectedId(employee.id);
    setModalOpen(false);
  }

  function approveFirstLeave() {
    const leave = data.leaves.find((item) => item.status === "pending");
    if (!leave) return;

    mutate(
      (current) => ({
        ...current,
        leaves: current.leaves.map((item) => (item.id === leave.id ? { ...item, status: "approved" } : item)),
        notifications: [createNotification("Conge approuve", "La demande de conge a ete validee.", "success"), ...current.notifications]
      }),
      { title: "Conge approuve", detail: "La demande est maintenant validee." }
    );
  }

  function updateEmployee(employeeId: string, patch: Partial<HrEmployee>) {
    mutate((current) => ({
      ...current,
      employees: current.employees.map((employee) => employee.id === employeeId ? { ...employee, ...patch, updatedAt: new Date().toISOString() } : employee)
    }));
  }

  async function removeSelectedEmployee(employeeId: string) {
    if (!window.confirm("Supprimer cet employe et ses donnees RH liees ?")) return;
    await removeEmployee(employeeId);
    mutate((current) => ({
      ...current,
      absences: current.absences.filter((item) => item.employeeId !== employeeId),
      contracts: current.contracts.filter((item) => item.employeeId !== employeeId),
      documents: current.documents.filter((item) => item.employeeId !== employeeId),
      employees: current.employees.filter((item) => item.id !== employeeId),
      leaves: current.leaves.filter((item) => item.employeeId !== employeeId),
      notifications: [createNotification("Employe supprime", "La fiche RH et les donnees liees ont ete retirees.", "warning"), ...current.notifications],
      salaries: current.salaries.filter((item) => item.employeeId !== employeeId),
      schedule: current.schedule.filter((item) => item.employeeId !== employeeId)
    }), { title: "Employe supprime", detail: "La base RH est mise a jour." });
    setSelectedId("");
  }

  function addLeave(employeeId: string) {
    mutate((current) => ({
      ...current,
      leaves: [{
        createdAt: new Date().toISOString(),
        days: 1,
        employeeId,
        endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        id: createHrId("leave"),
        startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        status: "pending",
        type: "paid"
      }, ...current.leaves],
      notifications: [createNotification("Conge cree", "Nouvelle demande de conge ajoutee.", "info"), ...current.notifications]
    }), { title: "Conge ajoute", detail: "La demande est en attente de validation." });
  }

  function addAbsence(employeeId: string) {
    mutate((current) => ({
      ...current,
      absences: [{
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().slice(0, 10),
        employeeId,
        id: createHrId("absence"),
        justified: false,
        reason: "Absence a justifier"
      }, ...current.absences]
    }), { title: "Absence ajoutee", detail: "Le suivi absence est mis a jour." });
  }

  function addDocument(employeeId: string) {
    mutate((current) => ({
      ...current,
      documents: [{
        category: "contract",
        createdAt: new Date().toISOString(),
        employeeId,
        id: createHrId("doc"),
        title: "Nouveau document RH",
        url: "#"
      }, ...current.documents]
    }), { title: "Document ajoute", detail: "Le document est rattache a la fiche employe." });
  }

  function addSchedule(employeeId: string) {
    mutate((current) => ({
      ...current,
      schedule: [{
        createdAt: new Date().toISOString(),
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        employeeId,
        id: createHrId("schedule"),
        kind: "meeting",
        label: "Point RH"
      }, ...current.schedule]
    }), { title: "Planning ajoute", detail: "Un evenement RH est planifie." });
  }

  function addSalary(employeeId: string) {
    mutate((current) => ({
      ...current,
      salaries: [{
        bonus: 0,
        createdAt: new Date().toISOString(),
        currency: "EUR",
        effectiveDate: new Date().toISOString().slice(0, 10),
        employeeId,
        grossAnnual: 45000,
        id: createHrId("salary")
      }, ...current.salaries]
    }), { title: "Salaire ajoute", detail: "La variable salariale est creee." });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </section>
        <Skeleton className="h-[520px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast title={toast.title} detail={toast.detail} /> : null}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
            <ShieldCheck size={14} />
            People operations
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">RH</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Employes, contrats, conges, absences, salaires, documents et planning dans un systeme RH SaaS premium.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModalOpen(true)} variant="primary">
            <Plus size={17} />
            Employe
          </Button>
          <Button onClick={approveFirstLeave}>
            <CheckCircle2 size={17} />
            Valider conge
          </Button>
          <Button onClick={sync}>
            <Save size={17} />
            {mode === "supabase" ? "Sync Supabase" : "Sauver local"}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HrStat icon={<UsersRound size={19} />} label="Employes" value={String(dashboard.employees)} />
        <HrStat icon={<WalletCards size={19} />} label="Masse salariale" value={formatHrCurrency(dashboard.payroll)} />
        <HrStat icon={<Clock3 size={19} />} label="Conges a valider" value={String(dashboard.pendingLeaves)} />
        <HrStat icon={<CalendarDays size={19} />} label="Planning a venir" value={String(dashboard.upcomingSchedule)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[220px_1fr]">
        <Card className="h-fit p-3">
          <nav className="space-y-1">
            {hrViews.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-sm font-medium transition-all duration-200 ${
                    view === item.id ? "bg-white/12 text-white shadow-glow" : "text-slate-400 hover:bg-white/8 hover:text-white"
                  }`}
                  onClick={() => setView(item.id)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Notifications</p>
            <p className="mt-1 text-sm text-slate-300">{data.notifications.length} alertes RH</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <label className="flex h-11 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Search size={17} />
                <input
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="Recherche employe, role, manager..."
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                />
              </label>
              <label className="flex h-11 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-slate-400">
                <Filter size={16} />
                <select
                  className="w-full bg-slate-950/80 text-white outline-none"
                  value={filters.department}
                  onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value as HrFilters["department"] }))}
                >
                  <option value="all">Tous poles</option>
                  {Object.entries(departmentLabels).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <select
                className="h-11 rounded-[8px] border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as HrFilters["status"] }))}
              >
                <option value="all">Tous statuts</option>
                {Object.entries(employeeStatusLabels).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {view === "employees" ? (
            <EmployeesView employees={employees} selectedId={selected?.id ?? ""} setSelectedId={setSelectedId} />
          ) : null}
          {view === "planning" ? <PlanningView data={data} /> : null}
          {view === "documents" ? <DocumentsView data={data} /> : null}
          {view === "payroll" ? <PayrollView data={data} /> : null}

          <EmployeeDetail
            addAbsence={addAbsence}
            addDocument={addDocument}
            addLeave={addLeave}
            addSalary={addSalary}
            addSchedule={addSchedule}
            absences={selectedAbsences}
            contracts={selectedContracts}
            documents={selectedDocuments}
            employee={selected}
            leaves={selectedLeaves}
            removeEmployee={removeSelectedEmployee}
            salaries={selectedSalaries}
            updateEmployee={updateEmployee}
          />
        </div>
      </section>

      <CreateEmployeeModal draft={draft} open={modalOpen} setDraft={setDraft} onClose={() => setModalOpen(false)} onSubmit={createEmployee} />
    </div>
  );
}

function HrStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="p-5" interactive>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-cyan-300/10 text-cyan-100">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function EmployeesView({ employees, selectedId, setSelectedId }: { employees: HrEmployee[]; selectedId: string; setSelectedId: (id: string) => void }) {
  if (!employees.length) {
    return <EmptyState icon={<UsersRound size={18} />} title="Aucun employe" detail="Ajoutez un collaborateur pour demarrer." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {employees.map((employee) => (
        <Card key={employee.id} className={`p-5 ${employee.id === selectedId ? "border-cyan-200/40" : ""}`} interactive>
          <button className="w-full text-left" onClick={() => setSelectedId(employee.id)}>
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-white/[0.08] text-sm font-semibold text-cyan-100">
                {employee.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-lg font-semibold text-white">{employee.firstName} {employee.lastName}</h3>
                  <Badge tone={statusTone(employee.status)}>{employeeStatusLabels[employee.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">{employee.role}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="cyan">{departmentLabels[employee.department]}</Badge>
              <Badge tone="violet">{employee.location}</Badge>
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}

function PlanningView({ data }: { data: ReturnType<typeof useHrData>["data"] }) {
  return (
    <Card>
      <div className="divide-y divide-white/10">
        {data.schedule.map((item) => {
          const employee = data.employees.find((candidate) => candidate.id === item.employeeId);
          return (
            <div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[150px_1fr_140px] sm:items-center">
              <span className="text-sm font-semibold text-cyan-100">{formatHrDate(item.date)}</span>
              <span className="text-sm text-white">{item.label}</span>
              <span className="text-sm text-slate-400">{employee?.firstName} {employee?.lastName}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DocumentsView({ data }: { data: ReturnType<typeof useHrData>["data"] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Document</th>
              <th className="px-5 py-4 font-medium">Employe</th>
              <th className="px-5 py-4 font-medium">Categorie</th>
              <th className="px-5 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {data.documents.map((document) => {
              const employee = data.employees.find((candidate) => candidate.id === document.employeeId);
              return (
                <tr key={document.id} className="hover:bg-white/[0.045]">
                  <td className="px-5 py-4 font-semibold text-white">{document.title}</td>
                  <td className="px-5 py-4">{employee?.firstName} {employee?.lastName}</td>
                  <td className="px-5 py-4"><Badge tone="violet">{document.category}</Badge></td>
                  <td className="px-5 py-4">{formatHrDate(document.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PayrollView({ data }: { data: ReturnType<typeof useHrData>["data"] }) {
  return (
    <Card>
      <div className="divide-y divide-white/10">
        {data.salaries.map((salary) => {
          const employee = data.employees.find((candidate) => candidate.id === salary.employeeId);
          return (
            <div key={salary.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_160px_160px] sm:items-center">
              <span className="text-sm font-semibold text-white">{employee?.firstName} {employee?.lastName}</span>
              <span className="text-sm text-cyan-100">{formatHrCurrency(salary.grossAnnual)}</span>
              <span className="text-sm text-slate-400">Bonus {formatHrCurrency(salary.bonus)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EmployeeDetail({
  addAbsence,
  addDocument,
  addLeave,
  addSalary,
  addSchedule,
  employee,
  contracts,
  leaves,
  absences,
  salaries,
  documents,
  removeEmployee,
  updateEmployee
}: {
  addAbsence: (employeeId: string) => void;
  addDocument: (employeeId: string) => void;
  addLeave: (employeeId: string) => void;
  addSalary: (employeeId: string) => void;
  addSchedule: (employeeId: string) => void;
  employee: HrEmployee | null;
  contracts: ReturnType<typeof useHrData>["data"]["contracts"];
  leaves: ReturnType<typeof useHrData>["data"]["leaves"];
  absences: ReturnType<typeof useHrData>["data"]["absences"];
  salaries: ReturnType<typeof useHrData>["data"]["salaries"];
  documents: ReturnType<typeof useHrData>["data"]["documents"];
  removeEmployee: (employeeId: string) => void;
  updateEmployee: (employeeId: string, patch: Partial<HrEmployee>) => void;
}) {
  if (!employee) {
    return <EmptyState icon={<UserRound size={18} />} title="Aucune fiche selectionnee" detail="Selectionnez un employe." />;
  }

  return (
    <Card className="p-5">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[8px] bg-white/[0.08] text-lg font-semibold text-cyan-100">
              {employee.avatarInitials}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{employee.firstName} {employee.lastName}</h2>
              <p className="mt-1 text-sm text-slate-400">{employee.role} · {departmentLabels[employee.department]}</p>
              <div className="mt-3"><Badge tone={statusTone(employee.status)}>{employeeStatusLabels[employee.status]}</Badge></div>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <Input label="Prenom" value={employee.firstName} onChange={(value) => updateEmployee(employee.id, { firstName: value, avatarInitials: `${value[0] ?? "?"}${employee.lastName[0] ?? "?"}`.toUpperCase() })} />
            <Input label="Nom" value={employee.lastName} onChange={(value) => updateEmployee(employee.id, { lastName: value, avatarInitials: `${employee.firstName[0] ?? "?"}${value[0] ?? "?"}`.toUpperCase() })} />
            <Input label="Email" value={employee.email} onChange={(value) => updateEmployee(employee.id, { email: value })} />
            <Input label="Telephone" value={employee.phone} onChange={(value) => updateEmployee(employee.id, { phone: value })} />
            <Input label="Role" value={employee.role} onChange={(value) => updateEmployee(employee.id, { role: value })} />
            <Input label="Manager" value={employee.manager} onChange={(value) => updateEmployee(employee.id, { manager: value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs text-slate-500">Departement</span>
                <select className="h-10 w-full rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={employee.department} onChange={(event) => updateEmployee(employee.id, { department: event.target.value as HrDepartment })}>
                  {Object.entries(departmentLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs text-slate-500">Statut</span>
                <select className="h-10 w-full rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={employee.status} onChange={(event) => updateEmployee(employee.id, { status: event.target.value as HrEmployee["status"] })}>
                  {Object.entries(employeeStatusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => addLeave(employee.id)} type="button" variant="surface">Congé</Button>
            <Button onClick={() => addAbsence(employee.id)} type="button" variant="surface">Absence</Button>
            <Button onClick={() => addSchedule(employee.id)} type="button" variant="surface">Planning</Button>
            <Button onClick={() => addDocument(employee.id)} type="button" variant="surface">Document</Button>
            <Button onClick={() => addSalary(employee.id)} type="button" variant="surface">Salaire</Button>
            <Button onClick={() => removeEmployee(employee.id)} type="button" variant="ghost"><Trash2 size={16} /> Supprimer</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MiniPanel icon={<BriefcaseBusiness size={17} />} title="Contrats" items={contracts.map((item) => `${item.type.toUpperCase()} · ${item.signed ? "signe" : "a signer"}`)} />
          <MiniPanel icon={<CalendarDays size={17} />} title="Conges" items={leaves.map((item) => `${item.type} · ${item.days} j · ${item.status}`)} />
          <MiniPanel icon={<Clock3 size={17} />} title="Absences" items={absences.map((item) => `${formatHrDate(item.date)} · ${item.reason}`)} />
          <MiniPanel icon={<WalletCards size={17} />} title="Salaires" items={salaries.map((item) => `${formatHrCurrency(item.grossAnnual)} · bonus ${formatHrCurrency(item.bonus)}`)} />
          <div className="lg:col-span-2">
            <MiniPanel icon={<FileText size={17} />} title="Documents" items={documents.map((item) => `${item.title} · ${item.category}`)} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniPanel({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-cyan-200">{icon}</span>
        {title}
      </h3>
      <div className="space-y-2">
        {items.length ? items.map((item) => <p key={item} className="rounded-[8px] bg-white/[0.045] p-3 text-sm text-slate-300">{item}</p>) : <p className="text-sm text-slate-500">Aucun element.</p>}
      </div>
    </div>
  );
}

function CreateEmployeeModal({
  open,
  draft,
  setDraft,
  onSubmit,
  onClose
}: {
  open: boolean;
  draft: EmployeeDraft;
  setDraft: (draft: EmployeeDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title="Creer un employe" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Prenom" value={draft.firstName} onChange={(value) => setDraft({ ...draft, firstName: value })} />
          <Input label="Nom" value={draft.lastName} onChange={(value) => setDraft({ ...draft, lastName: value })} />
          <Input label="Email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
          <Input label="Role" value={draft.role} onChange={(value) => setDraft({ ...draft, role: value })} />
          <label className="space-y-2">
            <span className="text-xs text-slate-500">Departement</span>
            <select className="h-10 w-full rounded-[8px] border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none" value={draft.department} onChange={(event) => setDraft({ ...draft, department: event.target.value as HrDepartment })}>
              {Object.entries(departmentLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <Input label="Salaire brut annuel" type="number" value={String(draft.salary)} onChange={(value) => setDraft({ ...draft, salary: Number(value) })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} type="button" variant="ghost">Annuler</Button>
          <Button type="submit" variant="primary">Creer</Button>
        </div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs text-slate-500">{label}</span>
      <input className="h-10 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition focus:border-cyan-200/50" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
