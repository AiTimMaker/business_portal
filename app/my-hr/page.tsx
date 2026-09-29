import { getServerSession } from "next-auth";
import { EmployeePortal } from "@/components/employee-portal";
import { Topbar } from "@/components/topbar";
import { authOptions } from "@/lib/auth";
import { getEmployeePortalData } from "@/lib/employee-portal";

export default async function MyHrPage() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  const data = await getEmployeePortalData(session?.user?.email, session?.accessToken);
  if (!data) return <><Topbar eyebrow="Không gian cá nhân" title="Hồ sơ của tôi" /><div className="content"><div className="access-denied"><strong>Chưa tìm thấy hồ sơ nhân viên</strong><span>Hãy liên hệ HR để liên kết email Microsoft 365 với mã nhân viên của bạn.</span></div></div></>;
  return <><Topbar eyebrow="Không gian cá nhân" title="Hồ sơ của tôi" /><div className="content myhr-content"><EmployeePortal data={data} /></div></>;
}
