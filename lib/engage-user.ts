import type { Session } from "next-auth";
import type { EngageAuthor } from "./engage-types";

export function engageAuthor(session: Session | null): EngageAuthor {
  const name = session?.user?.name ?? "Tim Nguyễn"; const email = session?.user?.email?.toLowerCase() ?? "tim.nguyen@vietrobot.vn";
  return { name, email, title: session?.user?.role ?? "Nhân viên", initials: name.split(" ").slice(-2).map((word) => word[0]).join("").toUpperCase() };
}
