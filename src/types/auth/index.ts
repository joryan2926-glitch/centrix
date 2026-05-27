export type AuthMode = "login" | "register" | "forgot";

export type AuthFormValues = {
  name?: string;
  email: string;
  password?: string;
};

export type AuthProvider = "google";
