import { plannerPlans, plannerTasks, type PlannerPlan, type PlannerTask } from "./demo-data";

type GraphTask = {
  id: string;
  title: string;
  planId: string;
  bucketId?: string;
  percentComplete: number;
  priority: number;
  dueDateTime?: string;
  startDateTime?: string;
  "@odata.etag": string;
};

type GraphPlan = { id: string; title: string };
type GraphBucket = { id: string; name: string };

export type PlannerData = { tasks: PlannerTask[]; plans: PlannerPlan[] };

async function graphGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Microsoft Graph ${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

function normalizeProgress(value: number): 0 | 50 | 100 {
  if (value >= 100) return 100;
  if (value > 0) return 50;
  return 0;
}

export async function getPlannerData(accessToken?: string): Promise<PlannerData> {
  if (process.env.DEMO_MODE === "true" || !accessToken) {
    return { tasks: plannerTasks, plans: plannerPlans };
  }

  const taskPayload = await graphGet<{ value: GraphTask[] }>("/me/planner/tasks", accessToken);
  const configuredPlanIds = (process.env.PLANNER_PLAN_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  const planIds = [...new Set([...taskPayload.value.map((task) => task.planId), ...configuredPlanIds])];
  const planResults = await Promise.all(planIds.map(async (planId) => {
    const [plan, buckets] = await Promise.all([
      graphGet<GraphPlan>(`/planner/plans/${encodeURIComponent(planId)}`, accessToken),
      graphGet<{ value: GraphBucket[] }>(`/planner/plans/${encodeURIComponent(planId)}/buckets`, accessToken),
    ]);
    return { id: plan.id, title: plan.title, buckets: buckets.value.map((bucket) => ({ id: bucket.id, name: bucket.name })) } satisfies PlannerPlan;
  }));

  const planMap = new Map(planResults.map((plan) => [plan.id, plan]));
  const tasks = taskPayload.value.map((task) => {
    const plan = planMap.get(task.planId);
    const bucket = plan?.buckets.find((item) => item.id === task.bucketId);
    return {
      id: task.id,
      title: task.title,
      planId: task.planId,
      planTitle: plan?.title ?? "Microsoft Planner",
      bucketId: task.bucketId,
      bucketTitle: bucket?.name ?? "Chưa phân nhóm",
      percentComplete: normalizeProgress(task.percentComplete),
      priority: task.priority,
      dueDate: task.dueDateTime?.slice(0, 10),
      startDate: task.startDateTime?.slice(0, 10),
      assignee: "Bạn",
      etag: task["@odata.etag"],
    } satisfies PlannerTask;
  });
  return { tasks, plans: planResults };
}
