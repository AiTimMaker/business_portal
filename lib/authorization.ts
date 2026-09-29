import type { Session } from "next-auth";

export function canManageHR(session: Session | null) {
  if (process.env.DEMO_MODE === "true") return true;
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;
  const hrAdmins = (process.env.HR_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return hrAdmins.includes(email);
}

export function canManageAssets(session: Session | null) {
  if (process.env.DEMO_MODE === "true") return true;
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;
  const allowed = `${process.env.ASSET_ADMIN_EMAILS ?? ""},${process.env.HR_ADMIN_EMAILS ?? ""}`.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email);
}
