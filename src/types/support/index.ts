export type TicketStatus = "open" | "pending" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportAgent = {
  id: string;
  name: string;
  email: string;
  role: "agent" | "lead" | "admin";
  online: boolean;
  avatarUrl: string | null;
  activeTickets: number;
  satisfactionScore: number;
};

export type SupportCategory = {
  id: string;
  name: string;
  color: string;
  slaHours: number;
};

export type SupportTicket = {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  priority: TicketPriority;
  categoryId: string;
  status: TicketStatus;
  assignedAgentId: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  ticketId: string;
  authorName: string;
  authorType: "client" | "agent" | "system";
  content: string;
  createdAt: string;
};

export type SupportComment = {
  id: string;
  ticketId: string;
  agentId: string;
  content: string;
  internal: boolean;
  createdAt: string;
};

export type SupportArticle = {
  id: string;
  categoryId: string;
  title: string;
  excerpt: string;
  content: string;
  views: number;
  likes: number;
  published: boolean;
  updatedAt: string;
};

export type SupportFeedback = {
  id: string;
  ticketId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
};

export type SupportNotification = {
  id: string;
  ticketId: string | null;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type SupportData = {
  tickets: SupportTicket[];
  messages: SupportMessage[];
  comments: SupportComment[];
  agents: SupportAgent[];
  categories: SupportCategory[];
  articles: SupportArticle[];
  feedback: SupportFeedback[];
  notifications: SupportNotification[];
};
