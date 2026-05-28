import type { User } from "@supabase/supabase-js";
import type { WorkspaceContext } from "@/types/data-platform";
import type { AuthProfile } from "@/providers/AuthProvider";

export const DEMO_WORKSPACE = {
  id: "demo",
  name: "CENTRIX SAS"
} as const;

export const DEMO_USER = {
  id: "admin",
  email: "admin@centrix.fr",
  full_name: "Administrateur"
} as const;

export const DEMO_AUTH_USER = {
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date(0).toISOString(),
  email: DEMO_USER.email,
  id: DEMO_USER.id,
  role: "authenticated",
  user_metadata: {
    company: DEMO_WORKSPACE.name,
    name: DEMO_USER.full_name
  }
} as User;

export const DEMO_AUTH_PROFILE: AuthProfile = {
  avatarUrl: null,
  email: DEMO_USER.email,
  fullName: DEMO_USER.full_name,
  id: DEMO_USER.id,
  role: "admin",
  workspaceId: DEMO_WORKSPACE.id,
  workspaceName: DEMO_WORKSPACE.name
};

export const DEMO_WORKSPACE_CONTEXT: WorkspaceContext = {
  role: "admin",
  userId: DEMO_USER.id,
  workspaceId: DEMO_WORKSPACE.id,
  workspaceName: DEMO_WORKSPACE.name
};
