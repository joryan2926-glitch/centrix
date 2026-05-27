export type PortalInvoiceStatus = "paid" | "pending" | "overdue" | "draft";
export type PortalProjectStatus = "planned" | "active" | "waiting" | "completed";
export type PortalTicketStatus = "open" | "pending" | "resolved" | "closed";
export type SignatureStatus = "pending" | "signed" | "expired";

export type ClientPortal = {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  plan: string;
  lastLoginAt: string;
};

export type ClientInvoice = {
  id: string;
  portalId: string;
  number: string;
  title: string;
  amount: number;
  status: PortalInvoiceStatus;
  dueAt: string;
  pdfUrl: string;
};

export type ClientProject = {
  id: string;
  portalId: string;
  title: string;
  description: string;
  status: PortalProjectStatus;
  progress: number;
  deadline: string;
};

export type ClientDocument = {
  id: string;
  portalId: string;
  name: string;
  category: "contract" | "quote" | "invoice" | "project" | "shared";
  fileType: string;
  sizeMb: number;
  secureUrl: string;
  createdAt: string;
};

export type ClientMessage = {
  id: string;
  portalId: string;
  author: string;
  role: "client" | "company" | "support";
  content: string;
  attachmentName?: string;
  createdAt: string;
};

export type ClientNotification = {
  id: string;
  portalId: string;
  title: string;
  detail: string;
  read: boolean;
  createdAt: string;
};

export type ClientAppointment = {
  id: string;
  portalId: string;
  title: string;
  type: "meeting" | "support" | "project" | "billing";
  status: "confirmed" | "pending" | "cancelled";
  startsAt: string;
};

export type ClientSignature = {
  id: string;
  portalId: string;
  documentName: string;
  status: SignatureStatus;
  requestedAt: string;
  signedAt?: string;
};

export type ClientActivityLog = {
  id: string;
  portalId: string;
  label: string;
  module: string;
  createdAt: string;
};

export type ClientPortalData = {
  portals: ClientPortal[];
  invoices: ClientInvoice[];
  projects: ClientProject[];
  documents: ClientDocument[];
  messages: ClientMessage[];
  notifications: ClientNotification[];
  appointments: ClientAppointment[];
  signatures: ClientSignature[];
  activityLogs: ClientActivityLog[];
};
