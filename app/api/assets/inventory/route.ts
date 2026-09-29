import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageAssets } from "@/lib/authorization";
import { createInventorySession, listInventorySessions } from "@/lib/inventory-store";

export async function GET() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền xem kiểm kê" }, { status: 403 });
  return NextResponse.json(await listInventorySessions());
}

export async function POST(request: Request) {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền tạo đợt kiểm kê" }, { status: 403 });
  const body = await request.json() as { title?: string; inventoryDate?: string; location?: string; assetIds?: string[] };
  if (!body.title?.trim() || !body.inventoryDate || !body.location?.trim()) return NextResponse.json({ error: "Thiếu thông tin đợt kiểm kê" }, { status: 400 });
  try {
    return NextResponse.json(await createInventorySession({ title: body.title.trim().slice(0, 160), inventoryDate: body.inventoryDate, location: body.location.trim().slice(0, 120), createdBy: session?.user?.name ?? "Quản trị viên Viet Robot", assetIds: Array.isArray(body.assetIds) ? body.assetIds.slice(0, 5000) : undefined }), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo đợt kiểm kê" }, { status: 409 }); }
}
