import { documents as demoDocuments, type DocumentItem } from "./demo-data";

type GraphDriveItem = {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  lastModifiedBy?: { user?: { displayName?: string } };
  file?: { mimeType?: string };
  webUrl?: string;
};

function extensionType(name: string): DocumentItem["type"] {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "doc" || extension === "docx") return "docx";
  if (extension === "xls" || extension === "xlsx") return "xlsx";
  if (extension === "ppt" || extension === "pptx") return "pptx";
  return "pdf";
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function getDocuments(accessToken?: string): Promise<DocumentItem[]> {
  if (process.env.DEMO_MODE === "true" || !accessToken || !process.env.SHAREPOINT_DRIVE_ID) {
    return demoDocuments;
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${process.env.SHAREPOINT_DRIVE_ID}/root/children?$select=id,name,size,lastModifiedDateTime,lastModifiedBy,file,webUrl`,
    { headers: { Authorization: `Bearer ${accessToken}` }, next: { revalidate: 60 } },
  );
  if (!response.ok) throw new Error(`Microsoft Graph returned ${response.status}`);
  const payload = (await response.json()) as { value: GraphDriveItem[] };
  return payload.value.filter((item) => item.file).map((item) => ({
    id: item.id,
    name: item.name.replace(/\.[^.]+$/, ""),
    type: extensionType(item.name),
    department: "Tài liệu chung",
    category: "Tài liệu",
    status: "Đã ban hành",
    version: "1.0",
    modifiedAt: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(item.lastModifiedDateTime)),
    modifiedBy: item.lastModifiedBy?.user?.displayName ?? "Viet Robot",
    size: formatSize(item.size),
    webUrl: item.webUrl,
  }));
}
