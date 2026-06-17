export function isGoogleAuthEnabled() {
  return process.env.NEXT_PUBLIC_CENTRIX_DISABLE_GOOGLE_AUTH !== "true";
}
