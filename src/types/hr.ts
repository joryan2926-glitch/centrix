export type HrDepartment = "product" | "sales" | "finance" | "people" | "engineering" | "marketing";

export type HrEmployeeStatus = "active" | "onboarding" | "offboarding" | "leave";

export type HrContractType = "cdi" | "cdd" | "freelance" | "internship";

export type HrLeaveStatus = "pending" | "approved" | "rejected";

export type HrEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: HrDepartment;
  status: HrEmployeeStatus;
  location: string;
  manager: string;
  startDate: string;
  avatarInitials: string;
  createdAt: string;
  updatedAt: string;
};

export type HrContract = {
  id: string;
  employeeId: string;
  type: HrContractType;
  startDate: string;
  endDate: string | null;
  weeklyHours: number;
  signed: boolean;
  createdAt: string;
};

export type HrLeave = {
  id: string;
  employeeId: string;
  type: "paid" | "sick" | "remote" | "parental" | "unpaid";
  startDate: string;
  endDate: string;
  status: HrLeaveStatus;
  days: number;
  createdAt: string;
};

export type HrAbsence = {
  id: string;
  employeeId: string;
  reason: string;
  date: string;
  justified: boolean;
  createdAt: string;
};

export type HrSalary = {
  id: string;
  employeeId: string;
  grossAnnual: number;
  bonus: number;
  currency: "EUR";
  effectiveDate: string;
  createdAt: string;
};

export type HrDocument = {
  id: string;
  employeeId: string;
  title: string;
  category: "contract" | "payroll" | "identity" | "policy";
  url: string;
  createdAt: string;
};

export type HrScheduleItem = {
  id: string;
  employeeId: string;
  date: string;
  label: string;
  kind: "shift" | "meeting" | "review" | "training";
  createdAt: string;
};

export type HrNotification = {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning";
  createdAt: string;
};

export type HrData = {
  employees: HrEmployee[];
  contracts: HrContract[];
  leaves: HrLeave[];
  absences: HrAbsence[];
  salaries: HrSalary[];
  documents: HrDocument[];
  schedule: HrScheduleItem[];
  notifications: HrNotification[];
};

export type HrFilters = {
  query: string;
  department: "all" | HrDepartment;
  status: "all" | HrEmployeeStatus;
};
