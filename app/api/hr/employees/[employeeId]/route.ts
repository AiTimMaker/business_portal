import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageHR } from "@/lib/authorization";
import { updateEmployee } from "@/lib/hr-store";
import { parseEmployeeInput } from "@/lib/hr-validation";

export async function PATCH(request: Request, context: { params: Promise<{ employeeId: string }> }) {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageHR(session)) return NextResponse.json({ error: "Không có quyền cập nhật" }, { status: 403 });
  const input = parseEmployeeInput(await request.json());
  if (!input) return NextResponse.json({ error: "Thông tin nhân viên không hợp lệ" }, { status: 400 });
  const { employeeId } = await context.params;
  try {
    return NextResponse.json(await updateEmployee(employeeId, input));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể cập nhật nhân viên" }, { status: 409 });
  }
}
