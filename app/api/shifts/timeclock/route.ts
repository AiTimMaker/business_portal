import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type TimeClockBody = { action?: "clockIn" | "clockOut"; timeCardId?: string; notes?: string };

export async function POST(request: Request) {
  const body = await request.json() as TimeClockBody;
  if (body.action !== "clockIn" && body.action !== "clockOut") return NextResponse.json({ error: "Thao tác không hợp lệ" }, { status: 400 });
  if (body.action === "clockOut" && !body.timeCardId) return NextResponse.json({ error: "Thiếu mã timecard" }, { status: 400 });
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.json(body.action === "clockIn" ? { id: "demo-active", state: "clockedIn" } : { state: "clockedOut" });
  }

  const teamId = process.env.SHIFTS_TEAM_ID;
  if (!teamId) return NextResponse.json({ error: "Chưa cấu hình Team Shifts" }, { status: 503 });
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const notes = { content: body.notes?.trim() || "Chấm công từ Viet Robot Portal", contentType: "text" };

  if (body.action === "clockIn") {
    const meResponse = await fetch("https://graph.microsoft.com/v1.0/me?$select=id", { headers: { Authorization: `Bearer ${session.accessToken}` } });
    if (!meResponse.ok) return NextResponse.json({ error: "Không xác định được người dùng" }, { status: 502 });
    const me = await meResponse.json() as { id: string };
    const response = await fetch(`https://graph.microsoft.com/v1.0/teams/${encodeURIComponent(teamId)}/schedule/timeCards/clockIn`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isAtApprovedLocation: false, onBehalfOfUserId: me.id, notes }),
    });
    if (!response.ok) {
      console.error("Shifts clock-in failed", response.status, await response.text());
      return NextResponse.json({ error: "Không thể vào ca trên Teams Shifts" }, { status: 502 });
    }
    return NextResponse.json(await response.json(), { status: 201 });
  }

  const response = await fetch(`https://graph.microsoft.com/v1.0/teams/${encodeURIComponent(teamId)}/schedule/timeCards/${encodeURIComponent(body.timeCardId!)}/clockOut`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ isAtApprovedLocation: false, notes }),
  });
  if (!response.ok) {
    console.error("Shifts clock-out failed", response.status, await response.text());
    return NextResponse.json({ error: "Không thể kết thúc ca trên Teams Shifts" }, { status: 502 });
  }
  return NextResponse.json({ state: "clockedOut" });
}
