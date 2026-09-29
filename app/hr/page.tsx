import { getServerSession } from "next-auth";
import { HrDashboard } from "@/components/hr-dashboard";
import { Topbar } from "@/components/topbar";
import { authOptions } from "@/lib/auth";
import { canManageHR } from "@/lib/authorization";
import { listEmployees } from "@/lib/hr-store";

export default async function HrPage() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageHR(session)) return <><Topbar eyebrow="Quản trị nội bộ" title="Quản lý nhân sự" /><div className="content"><div className="access-denied"><strong>Bạn không có quyền truy cập phân hệ HR</strong><span>Hãy liên hệ quản trị viên để được thêm vào nhóm HR/Admin.</span></div></div></>;
  const employees = await listEmployees();
  return <><Topbar eyebrow="Quản trị nội bộ" title="Quản lý nhân sự" /><div className="content hr-content"><HrDashboard initialEmployees={employees} referenceDate={new Date().toISOString().slice(0, 10)} /></div></>;
}
