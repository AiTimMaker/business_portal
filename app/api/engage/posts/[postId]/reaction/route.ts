import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { toggleEngageLike } from "@/lib/engage-store";
import { engageAuthor } from "@/lib/engage-user";

export async function POST(_request: Request, context: { params: Promise<{ postId: string }> }) { if (process.env.DEMO_MODE !== "true") return NextResponse.json({ error: "Hãy tương tác trong Viva Engage Embed" }, { status: 409 }); const session = await getServerSession(authOptions); const { postId } = await context.params; try { return NextResponse.json(await toggleEngageLike(postId, engageAuthor(session).email)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể cập nhật cảm xúc" }, { status: 404 }); } }
