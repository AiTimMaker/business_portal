import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canManageAssets } from "@/lib/authorization";
import { createAsset, listAssets } from "@/lib/asset-store";
import { parseAssetInput } from "@/lib/asset-validation";

export async function GET() { const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions); if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 }); return NextResponse.json(await listAssets()); }
export async function POST(request: Request) { const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions); if (!canManageAssets(session)) return NextResponse.json({ error: "Không có quyền cập nhật" }, { status: 403 }); const input = parseAssetInput(await request.json()); if (!input) return NextResponse.json({ error: "Thông tin tài sản không hợp lệ" }, { status: 400 }); try { return NextResponse.json(await createAsset(input), { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo tài sản" }, { status: 409 }); } }
