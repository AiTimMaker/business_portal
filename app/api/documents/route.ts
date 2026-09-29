import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]);

export async function POST(request: Request) {
  if (process.env.DEMO_MODE === "true") return NextResponse.json({ demo: true });
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!process.env.SHAREPOINT_DRIVE_ID) return NextResponse.json({ error: "Chưa cấu hình thư viện SharePoint" }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Không tìm thấy tệp" }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "Định dạng tệp không được hỗ trợ" }, { status: 415 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Tệp vượt quá giới hạn 20 MB" }, { status: 413 });

  const safeName = file.name.replace(/["*:<>?/\\|#%]/g, "-");
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${process.env.SHAREPOINT_DRIVE_ID}/root:/${encodeURIComponent(safeName)}:/content`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": file.type || "application/octet-stream" },
      body: Buffer.from(await file.arrayBuffer()),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    console.error("Microsoft Graph upload failed", response.status, detail);
    return NextResponse.json({ error: "Không thể tải tệp lên SharePoint" }, { status: 502 });
  }
  return NextResponse.json(await response.json(), { status: 201 });
}
