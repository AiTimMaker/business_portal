import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageHR } from "@/lib/authorization";
import { createEmployee, listEmployees } from "@/lib/hr-store";
import { parseEmployeeInput } from "@/lib/hr-validation";

export async function GET() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageHR(session)) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  return NextResponse.json(await listEmployees());
}

export async function POST(request: Request) {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageHR(session)) return NextResponse.json({ error: "Không có quyền cập nhật" }, { status: 403 });
  const input = parseEmployeeInput(await request.json());
  if (!input) return NextResponse.json({ error: "Thông tin nhân viên không hợp lệ" }, { status: 400 });
  try {
    return NextResponse.json(await createEmployee(input), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo nhân viên" }, { status: 409 });
  }
}
