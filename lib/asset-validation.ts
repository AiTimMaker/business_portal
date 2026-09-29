import type { AssetCategory, AssetCondition, AssetInput, AssetStatus } from "./asset-types";

const categories: AssetCategory[] = ["Thiết bị CNTT", "Robot & linh kiện", "Công cụ dụng cụ", "Thiết bị đào tạo", "Nội thất"];
const statuses: AssetStatus[] = ["Sẵn sàng", "Đang sử dụng", "Bảo trì", "Mất/Hỏng", "Đã thanh lý"];
const conditions: AssetCondition[] = ["Mới", "Tốt", "Khá", "Cần sửa chữa", "Hỏng"];

export function parseAssetInput(value: unknown): AssetInput | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const required = ["assetCode", "name", "category", "status", "condition", "location", "purchaseDate", "supplier"];
  if (required.some((key) => typeof item[key] !== "string" || !String(item[key]).trim())) return null;
  if (!categories.includes(item.category as AssetCategory) || !statuses.includes(item.status as AssetStatus) || !conditions.includes(item.condition as AssetCondition)) return null;
  const purchasePrice = Number(item.purchasePrice);
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null;
  return { assetCode: String(item.assetCode).trim().slice(0, 40), name: String(item.name).trim().slice(0, 160), category: item.category as AssetCategory, serialNumber: item.serialNumber ? String(item.serialNumber).trim().slice(0, 100) : undefined, status: item.status as AssetStatus, condition: item.condition as AssetCondition, location: String(item.location).trim().slice(0, 120), purchaseDate: String(item.purchaseDate), purchasePrice, supplier: String(item.supplier).trim().slice(0, 160), warrantyUntil: item.warrantyUntil ? String(item.warrantyUntil) : undefined, nextMaintenance: item.nextMaintenance ? String(item.nextMaintenance) : undefined, notes: item.notes ? String(item.notes).trim().slice(0, 1000) : undefined };
}
