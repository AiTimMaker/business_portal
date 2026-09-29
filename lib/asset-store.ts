import "server-only";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Asset, AssetInput, AssignmentEvent } from "./asset-types";

const dataPath = path.join(process.cwd(), "data", "assets.json");
export async function listAssets(): Promise<Asset[]> { return JSON.parse(await readFile(dataPath, "utf8")) as Asset[]; }
async function saveAssets(assets: Asset[]) { const temporaryPath = `${dataPath}.tmp`; await writeFile(temporaryPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8"); await rename(temporaryPath, dataPath); }

export async function createAsset(input: AssetInput) {
  const assets = await listAssets();
  if (assets.some((item) => item.assetCode.toLowerCase() === input.assetCode.toLowerCase())) throw new Error("Mã tài sản đã tồn tại");
  const asset: Asset = { ...input, status: input.status === "Đang sử dụng" ? "Sẵn sàng" : input.status, id: crypto.randomUUID(), assignmentHistory: [], updatedAt: new Date().toISOString() };
  await saveAssets([asset, ...assets]); return asset;
}

export async function updateAsset(id: string, input: AssetInput) {
  const assets = await listAssets(); const index = assets.findIndex((item) => item.id === id); if (index < 0) throw new Error("Không tìm thấy tài sản");
  if (assets.some((item) => item.id !== id && item.assetCode.toLowerCase() === input.assetCode.toLowerCase())) throw new Error("Mã tài sản đã tồn tại");
  const current = assets[index]; const asset: Asset = { ...current, ...input, status: current.assignedEmployeeId ? "Đang sử dụng" : input.status, updatedAt: new Date().toISOString() };
  assets[index] = asset; await saveAssets(assets); return asset;
}

export async function assignAsset(id: string, employeeId: string, employeeName: string, date: string, accessories?: string, note?: string) {
  const assets = await listAssets(); const index = assets.findIndex((item) => item.id === id); if (index < 0) throw new Error("Không tìm thấy tài sản");
  const current = assets[index]; if (current.assignedEmployeeId) throw new Error("Tài sản đang được bàn giao cho người khác");
  if (["Bảo trì", "Mất/Hỏng", "Đã thanh lý"].includes(current.status)) throw new Error("Trạng thái tài sản không cho phép bàn giao");
  const event: AssignmentEvent = { id: crypto.randomUUID(), documentNumber: createDocumentNumber(date), type: "Bàn giao", employeeId, employeeName, fromEmployeeName: "Công ty Cổ phần Giáo dục Viet Robot", toEmployeeId: employeeId, toEmployeeName: employeeName, date, condition: current.condition, accessories, note };
  const asset: Asset = { ...current, status: "Đang sử dụng", assignedEmployeeId: employeeId, assignedEmployeeName: employeeName, assignedDate: date, assignmentHistory: [event, ...current.assignmentHistory], updatedAt: new Date().toISOString() };
  assets[index] = asset; await saveAssets(assets); return { asset, event };
}

export async function returnAsset(id: string, date: string, condition: Asset["condition"], accessories?: string, note?: string) {
  const assets = await listAssets(); const index = assets.findIndex((item) => item.id === id); if (index < 0) throw new Error("Không tìm thấy tài sản");
  const current = assets[index]; if (!current.assignedEmployeeId) throw new Error("Tài sản chưa được bàn giao");
  const event: AssignmentEvent = { id: crypto.randomUUID(), documentNumber: createDocumentNumber(date), type: "Thu hồi", employeeId: current.assignedEmployeeId, employeeName: current.assignedEmployeeName, fromEmployeeId: current.assignedEmployeeId, fromEmployeeName: current.assignedEmployeeName, toEmployeeName: "Công ty Cổ phần Giáo dục Viet Robot", date, condition, accessories, note };
  const nextStatus = condition === "Hỏng" ? "Mất/Hỏng" : condition === "Cần sửa chữa" ? "Bảo trì" : "Sẵn sàng";
  const asset: Asset = { ...current, status: nextStatus, condition, assignedEmployeeId: undefined, assignedEmployeeName: undefined, assignedDate: undefined, assignmentHistory: [event, ...current.assignmentHistory], updatedAt: new Date().toISOString() };
  assets[index] = asset; await saveAssets(assets); return { asset, event };
}

export async function transferAsset(id: string, employeeId: string, employeeName: string, date: string, condition: Asset["condition"], accessories?: string, note?: string) {
  const assets = await listAssets(); const index = assets.findIndex((item) => item.id === id); if (index < 0) throw new Error("Không tìm thấy tài sản");
  const current = assets[index]; if (!current.assignedEmployeeId || !current.assignedEmployeeName) throw new Error("Tài sản chưa được bàn giao");
  if (current.assignedEmployeeId === employeeId) throw new Error("Người nhận mới phải khác người đang sử dụng");
  const event: AssignmentEvent = { id: crypto.randomUUID(), documentNumber: createDocumentNumber(date), type: "Chuyển giao", employeeId, employeeName, fromEmployeeId: current.assignedEmployeeId, fromEmployeeName: current.assignedEmployeeName, toEmployeeId: employeeId, toEmployeeName: employeeName, date, condition, accessories, note };
  const asset: Asset = { ...current, condition, assignedEmployeeId: employeeId, assignedEmployeeName: employeeName, assignedDate: date, assignmentHistory: [event, ...current.assignmentHistory], updatedAt: new Date().toISOString() };
  assets[index] = asset; await saveAssets(assets); return { asset, event };
}

function createDocumentNumber(date: string) {
  return `BBGN-${date.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}
