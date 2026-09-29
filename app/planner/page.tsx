import { getServerSession } from "next-auth";
import { PlannerBoard } from "@/components/planner-board";
import { Topbar } from "@/components/topbar";
import { authOptions } from "@/lib/auth";
import { getPlannerData } from "@/lib/planner";

export default async function PlannerPage() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  const data = await getPlannerData(session?.accessToken);
  return <><Topbar eyebrow="Microsoft 365" title="Công việc & dự án" /><div className="content planner-content"><PlannerBoard initialTasks={data.tasks} plans={data.plans} /></div></>;
}
