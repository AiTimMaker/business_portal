import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { addEngageComment } from "@/lib/engage-store";
import { engageAuthor } from "@/lib/engage-user";

export async function POST(request: Request, context: { params: Promise<{ postId: string }> }) { if (process.env.DEMO_MODE !== "true") return NextResponse.json({ error: "Hãy bình luận trong Viva Engage Embed" }, { status: 409 }); const body = await request.json() as { content?: string }; const content = body.content?.trim(); if (!content || content.length > 2000) return NextResponse.json({ error: "Bình luận không hợp lệ" }, { status: 400 }); const session = await getServerSession(authOptions); const { postId } = await context.params; try { return NextResponse.json(await addEngageComment(postId, engageAuthor(session), content), { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể bình luận" }, { status: 404 }); } }
