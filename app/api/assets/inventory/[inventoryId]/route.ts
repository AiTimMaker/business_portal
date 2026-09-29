import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageAssets } from "@/lib/authorization";
import { completeInventorySession, importInventoryItems, updateInventoryItem } from "@/lib/inventory-store";
import type { AssetCondition, InventoryResult } from "@/lib/asset-types";

const results: InventoryResult[] = ["Khớp", "Sai vị trí", "Sai người sử dụng", "Hư hỏng", "Không tìm thấy"];
const conditions: AssetCondition[] = ["Mới", "Tốt", "Khá", "Cần sửa chữa", "Hỏng"];

export async function PATCH(request: Request, context: { params: Promise<{ inventoryId: string }> }) {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền cập nhật kiểm kê" }, { status: 403 });
  const body = await request.json() as { action?: "check" | "complete" | "import"; itemId?: string; result?: InventoryResult; actualLocation?: string; actualEmployeeId?: string; actualEmployeeName?: string; actualCondition?: AssetCondition; note?: string; items?: Array<{ assetCode?: string; result?: InventoryResult; actualLocation?: string; actualEmployeeName?: string; actualCondition?: AssetCondition; note?: string }> };
  const { inventoryId } = await context.params;
  try {
    if (body.action === "complete") return NextResponse.json(await completeInventorySession(inventoryId));
    if (body.action === "import" && Array.isArray(body.items)) {
      const items = body.items.filter((item) => item.assetCode && item.result && results.includes(item.result) && (!item.actualCondition || conditions.includes(item.actualCondition))).slice(0, 5000).map((item) => ({ assetCode: String(item.assetCode).slice(0, 40), result: item.result as InventoryResult, actualLocation: item.actualLocation?.trim().slice(0, 120), actualEmployeeName: item.actualEmployeeName?.trim().slice(0, 120), actualCondition: item.actualCondition, note: item.note?.trim().slice(0, 500) }));
      if (!items.length) return NextResponse.json({ error: "File không có dòng dữ liệu hợp lệ" }, { status: 400 });
      return NextResponse.json(await importInventoryItems(inventoryId, items, session?.user?.name ?? "Quản trị viên Viet Robot"));
    }
    if (body.action === "check" && body.itemId && body.result && results.includes(body.result) && (!body.actualCondition || conditions.includes(body.actualCondition))) {
      return NextResponse.json(await updateInventoryItem(inventoryId, body.itemId, { result: body.result, actualLocation: body.actualLocation?.trim().slice(0, 120), actualEmployeeId: body.actualEmployeeId, actualEmployeeName: body.actualEmployeeName?.trim().slice(0, 120), actualCondition: body.actualCondition, note: body.note?.trim().slice(0, 500), checkedBy: session?.user?.name ?? "Quản trị viên Viet Robot" }));
    }
    return NextResponse.json({ error: "Thông tin kiểm kê không hợp lệ" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể cập nhật kiểm kê" }, { status: 409 }); }
}
