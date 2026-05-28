export type AuthMode = "login" | "register" | "forgot" | "reset";

export type AuthFormValues = {
  name?: string;
  email: string;
  password?: string;
};

export type AuthProvider = "google";

export type UserRole = "admin" | "manager" | "employee" | "client";

export type CentrixUser = {
  id: string;
  nom: string;
  email: string;
  entreprise: string;
  role: UserRole;
  abonnement: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
