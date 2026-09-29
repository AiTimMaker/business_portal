import "server-only";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { listAssets } from "./asset-store";
import type { AssetCondition, InventoryItem, InventoryResult, InventorySession } from "./asset-types";

const dataPath = path.join(process.cwd(), "data", "inventory-sessions.json");

export async function listInventorySessions(): Promise<InventorySession[]> {
  try {
    const sessions = JSON.parse(await readFile(dataPath, "utf8")) as InventorySession[]; const assets = await listAssets(); const byId = new Map(assets.map((asset) => [asset.id, asset]));
    return sessions.map((session) => ({ ...session, items: session.items.map((item) => { const asset = byId.get(item.assetId); return { ...item, assetCategory: item.assetCategory ?? asset?.category, serialNumber: item.serialNumber ?? asset?.serialNumber }; }) }));
  }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}

async function saveInventorySessions(sessions: InventorySession[]) {
  const temporaryPath = `${dataPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
  await rename(temporaryPath, dataPath);
}

export async function createInventorySession(input: { title: string; inventoryDate: string; location: string; createdBy: string; assetIds?: string[] }) {
  const [sessions, assets] = await Promise.all([listInventorySessions(), listAssets()]);
  const year = input.inventoryDate.slice(0, 4);
  const sequence = sessions.filter((item) => item.code.startsWith(`KK-${year}-`)).length + 1;
  const selectedIds = input.assetIds?.length ? new Set(input.assetIds) : undefined;
  const scopedAssets = assets.filter((asset) => asset.status !== "Đã thanh lý" && (selectedIds ? selectedIds.has(asset.id) : input.location === "Tất cả địa điểm" || asset.location === input.location));
  if (!scopedAssets.length) throw new Error("Không có tài sản trong phạm vi kiểm kê");
  const items: InventoryItem[] = scopedAssets.map((asset) => ({ id: crypto.randomUUID(), assetId: asset.id, assetCode: asset.assetCode, assetName: asset.name, assetCategory: asset.category, serialNumber: asset.serialNumber, expectedLocation: asset.location, expectedEmployeeId: asset.assignedEmployeeId, expectedEmployeeName: asset.assignedEmployeeName, expectedCondition: asset.condition, result: "Chưa kiểm" }));
  const code = `KK-${year}-${String(sequence).padStart(3, "0")}`;
  const session: InventorySession = { id: crypto.randomUUID(), code, minutesNumber: `BBKK-${year}-${String(sequence).padStart(3, "0")}`, title: input.title, inventoryDate: input.inventoryDate, location: input.location, status: "Đang kiểm kê", createdBy: input.createdBy, createdAt: new Date().toISOString(), items };
  await saveInventorySessions([session, ...sessions]); return session;
}

export async function importInventoryItems(sessionId: string, updates: Array<{ assetCode: string; result: InventoryResult; actualLocation?: string; actualEmployeeName?: string; actualCondition?: AssetCondition; note?: string }>, checkedBy: string) {
  const sessions = await listInventorySessions(); const sessionIndex = sessions.findIndex((item) => item.id === sessionId); if (sessionIndex < 0) throw new Error("Không tìm thấy đợt kiểm kê");
  const session = sessions[sessionIndex]; if (session.status === "Đã hoàn tất") throw new Error("Đợt kiểm kê đã hoàn tất");
  const byCode = new Map(updates.map((item) => [item.assetCode.trim().toLowerCase(), item])); let matched = 0;
  session.items = session.items.map((item) => { const update = byCode.get(item.assetCode.toLowerCase()); if (!update) return item; matched += 1; return { ...item, ...update, checkedBy, checkedAt: new Date().toISOString() }; });
  if (!matched) throw new Error("Không tìm thấy mã tài sản phù hợp trong đợt kiểm kê");
  sessions[sessionIndex] = session; await saveInventorySessions(sessions); return { session, importedCount: matched, ignoredCount: Math.max(0, updates.length - matched) };
}

export async function updateInventoryItem(sessionId: string, itemId: string, input: { result: InventoryResult; actualLocation?: string; actualEmployeeId?: string; actualEmployeeName?: string; actualCondition?: AssetCondition; note?: string; checkedBy: string }) {
  const sessions = await listInventorySessions(); const sessionIndex = sessions.findIndex((item) => item.id === sessionId); if (sessionIndex < 0) throw new Error("Không tìm thấy đợt kiểm kê");
  const session = sessions[sessionIndex]; if (session.status === "Đã hoàn tất") throw new Error("Đợt kiểm kê đã hoàn tất");
  const itemIndex = session.items.findIndex((item) => item.id === itemId); if (itemIndex < 0) throw new Error("Không tìm thấy tài sản trong đợt kiểm kê");
  session.items[itemIndex] = { ...session.items[itemIndex], ...input, checkedAt: new Date().toISOString() };
  sessions[sessionIndex] = session; await saveInventorySessions(sessions); return session;
}

export async function completeInventorySession(sessionId: string) {
  const sessions = await listInventorySessions(); const index = sessions.findIndex((item) => item.id === sessionId); if (index < 0) throw new Error("Không tìm thấy đợt kiểm kê");
  const session = sessions[index]; if (session.items.some((item) => item.result === "Chưa kiểm")) throw new Error("Cần kiểm kê toàn bộ tài sản trước khi hoàn tất");
  sessions[index] = { ...session, status: "Đã hoàn tất", completedAt: new Date().toISOString() };
  await saveInventorySessions(sessions); return sessions[index];
}
