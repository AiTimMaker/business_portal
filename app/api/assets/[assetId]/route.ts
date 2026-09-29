import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageAssets } from "@/lib/authorization";
import { updateAsset } from "@/lib/asset-store";
import { parseAssetInput } from "@/lib/asset-validation";

export async function PATCH(request: Request, context: { params: Promise<{ assetId: string }> }) { const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions); if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền cập nhật" }, { status: 403 }); const input = parseAssetInput(await request.json()); if (!input) return NextResponse.json({ error: "Thông tin tài sản không hợp lệ" }, { status: 400 }); const { assetId } = await context.params; try { return NextResponse.json(await updateAsset(assetId, input)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể cập nhật tài sản" }, { status: 409 }); } }
