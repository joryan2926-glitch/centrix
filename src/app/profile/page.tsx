import { ProfileSettings } from "@/components/auth/ProfileSettings";
import { DEMO_USER, DEMO_WORKSPACE } from "@/lib/auth/demo-session";

export default async function ProfilePage() {
  return (
    <ProfileSettings
      profile={{
        abonnement: "starter",
        avatarUrl: null,
        email: DEMO_USER.email,
        entreprise: DEMO_WORKSPACE.name,
        nom: DEMO_USER.full_name,
        preferences: { notifications: true, weeklyDigest: true },
        role: "admin"
      }}
    />
  );
}
