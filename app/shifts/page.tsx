import { getServerSession } from "next-auth";
import { ShiftsDashboard } from "@/components/shifts-dashboard";
import { Topbar } from "@/components/topbar";
import { authOptions } from "@/lib/auth";
import { getShiftsData } from "@/lib/shifts";

export default async function ShiftsPage() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  const data = await getShiftsData(session?.accessToken);
  return <><Topbar eyebrow="Microsoft Teams" title="Lịch làm & chấm công" /><div className="content shifts-content"><ShiftsDashboard data={data} /></div></>;
}
