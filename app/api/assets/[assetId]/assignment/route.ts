import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageAssets } from "@/lib/authorization";
import { assignAsset, returnAsset, transferAsset } from "@/lib/asset-store";
import type { AssetCondition } from "@/lib/asset-types";

type Body = { action?: "assign" | "return" | "transfer"; employeeId?: string; employeeName?: string; date?: string; condition?: AssetCondition; accessories?: string; note?: string };
const conditions: AssetCondition[] = ["Mới", "Tốt", "Khá", "Cần sửa chữa", "Hỏng"];
export async function POST(request: Request, context: { params: Promise<{ assetId: string }> }) {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions); if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền cập nhật" }, { status: 403 });
  const body = await request.json() as Body; const { assetId } = await context.params; const date = body.date || new Date().toISOString().slice(0, 10);
  const accessories = body.accessories?.trim().slice(0, 500); const note = body.note?.trim().slice(0, 500);
  try {
    if (body.action === "assign" && body.employeeId && body.employeeName) return NextResponse.json(await assignAsset(assetId, body.employeeId, body.employeeName.trim().slice(0, 120), date, accessories, note));
    if (body.action === "return" && body.condition && conditions.includes(body.condition)) return NextResponse.json(await returnAsset(assetId, date, body.condition, accessories, note));
    if (body.action === "transfer" && body.employeeId && body.employeeName && body.condition && conditions.includes(body.condition)) return NextResponse.json(await transferAsset(assetId, body.employeeId, body.employeeName.trim().slice(0, 120), date, body.condition, accessories, note));
    return NextResponse.json({ error: "Thông tin bàn giao không hợp lệ" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể cập nhật bàn giao" }, { status: 409 }); }
}
