import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type CreateTaskBody = { title?: string; planId?: string; bucketId?: string; dueDate?: string; priority?: number };

export async function POST(request: Request) {
  const body = await request.json() as CreateTaskBody;
  const title = body.title?.trim();
  if (!title || title.length > 255 || !body.planId) {
    return NextResponse.json({ error: "Tiêu đề và dự án là bắt buộc" }, { status: 400 });
  }
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.json({ id: `demo-${Date.now()}`, title }, { status: 201 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const meResponse = await fetch("https://graph.microsoft.com/v1.0/me?$select=id", { headers: { Authorization: `Bearer ${session.accessToken}` } });
  if (!meResponse.ok) return NextResponse.json({ error: "Không xác định được người dùng" }, { status: 502 });
  const me = await meResponse.json() as { id: string };

  const plannerBody: Record<string, unknown> = {
    planId: body.planId,
    title,
    priority: typeof body.priority === "number" ? body.priority : 5,
    assignments: { [me.id]: { "@odata.type": "#microsoft.graph.plannerAssignment", orderHint: " !" } },
  };
  if (body.bucketId) plannerBody.bucketId = body.bucketId;
  if (body.dueDate) plannerBody.dueDateTime = `${body.dueDate}T10:00:00Z`;

  const response = await fetch("https://graph.microsoft.com/v1.0/planner/tasks", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(plannerBody),
  });
  if (!response.ok) {
    console.error("Planner create task failed", response.status, await response.text());
    return NextResponse.json({ error: "Không thể tạo công việc trên Planner" }, { status: 502 });
  }
  return NextResponse.json(await response.json(), { status: 201 });
}
