import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type UpdateTaskBody = { percentComplete?: number; etag?: string };

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const body = await request.json() as UpdateTaskBody;
  if (![0, 50, 100].includes(body.percentComplete ?? -1) || !body.etag) {
    return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ" }, { status: 400 });
  }
  if (process.env.DEMO_MODE === "true") return NextResponse.json({ ok: true });

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const response = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      "If-Match": body.etag,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ percentComplete: body.percentComplete }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Planner update task failed", response.status, detail);
    const status = response.status === 412 ? 409 : 502;
    return NextResponse.json({ error: status === 409 ? "Công việc đã được thay đổi. Hãy tải lại trang." : "Không thể cập nhật Planner" }, { status });
  }
  return NextResponse.json(await response.json());
}
