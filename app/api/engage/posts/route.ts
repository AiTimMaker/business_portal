import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createEngagePost, getEngageData } from "@/lib/engage-store";
import { engageAuthor } from "@/lib/engage-user";
import type { EngagePostType } from "@/lib/engage-types";

const types: EngagePostType[] = ["Bài viết", "Thông báo", "Câu hỏi", "Khen thưởng"];
export async function GET() { if (process.env.DEMO_MODE !== "true") return NextResponse.json({ error: "Bảng tin production được cung cấp bởi Viva Engage Embed" }, { status: 409 }); return NextResponse.json(await getEngageData()); }
export async function POST(request: Request) { if (process.env.DEMO_MODE !== "true") return NextResponse.json({ error: "Hãy đăng bài trong Viva Engage Embed" }, { status: 409 }); const body = await request.json() as { communityId?: string; type?: EngagePostType; content?: string }; const content = body.content?.trim(); if (!body.communityId || !body.type || !types.includes(body.type) || !content || content.length > 5000) return NextResponse.json({ error: "Nội dung bài viết không hợp lệ" }, { status: 400 }); const session = await getServerSession(authOptions); try { return NextResponse.json(await createEngagePost({ author: engageAuthor(session), communityId: body.communityId, type: body.type, content }), { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể đăng bài" }, { status: 409 }); } }
