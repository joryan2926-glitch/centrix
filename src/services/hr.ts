import type { HrData, HrDepartment, HrEmployee, HrEmployeeStatus, HrFilters, HrNotification } from "@/types/hr";

export const departmentLabels: Record<HrDepartment, string> = {
  product: "Product",
  sales: "Sales",
  finance: "Finance",
  people: "People",
  engineering: "Engineering",
  marketing: "Marketing"
};

export const employeeStatusLabels: Record<HrEmployeeStatus, string> = {
  active: "Actif",
  onboarding: "Onboarding",
  offboarding: "Offboarding",
  leave: "Conge"
};

export function createHrId(prefix = "hr") {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function formatHrCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function formatHrDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function statusTone(status: HrEmployeeStatus) {
  if (status === "active") return "emerald";
  if (status === "onboarding") return "cyan";
  if (status === "leave") return "violet";
  return "rose";
}

export function filterEmployees(employees: HrEmployee[], filters: HrFilters) {
  const query = filters.query.trim().toLowerCase();

  return employees.filter((employee) => {
    const matchesQuery =
      !query ||
      [
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.role,
        employee.manager,
        employee.location,
        departmentLabels[employee.department]
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesDepartment = filters.department === "all" || employee.department === filters.department;
    const matchesStatus = filters.status === "all" || employee.status === filters.status;

    return matchesQuery && matchesDepartment && matchesStatus;
  });
}

export function buildEmployee(count: number): HrEmployee {
  const now = new Date().toISOString();

  return {
    id: createHrId("employee"),
    firstName: "Nouveau",
    lastName: `Collaborateur ${count + 1}`,
    email: "collaborateur@centrix.fr",
    phone: "+33 6 00 00 00 00",
    role: "Role a definir",
    department: "people",
    status: "onboarding",
    location: "Paris",
    manager: "People Team",
    startDate: now.slice(0, 10),
    avatarInitials: "NC",
    createdAt: now,
    updatedAt: now
  };
}

export function getHrDashboard(data: HrData) {
  const payroll = data.salaries.reduce((sum, salary) => sum + salary.grossAnnual + salary.bonus, 0);
  const pendingLeaves = data.leaves.filter((leave) => leave.status === "pending").length;
  const signedContracts = data.contracts.filter((contract) => contract.signed).length;
  const upcomingSchedule = data.schedule.filter((item) => new Date(item.date) >= new Date()).length;

  return {
    employees: data.employees.length,
    payroll,
    pendingLeaves,
    signedContracts,
    upcomingSchedule
  };
}

export function createNotification(title: string, detail: string, tone: HrNotification["tone"] = "info"): HrNotification {
  return {
    id: createHrId("notification"),
    title,
    detail,
    tone,
    createdAt: new Date().toISOString()
  };
}
