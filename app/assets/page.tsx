import { getServerSession } from "next-auth";
import { AssetsDashboard } from "@/components/assets-dashboard";
import { Topbar } from "@/components/topbar";
import { authOptions } from "@/lib/auth";
import { canManageAssets } from "@/lib/authorization";
import { listAssets } from "@/lib/asset-store";
import { listInventorySessions } from "@/lib/inventory-store";
import { listEmployees } from "@/lib/hr-store";

export const dynamic = "force-dynamic";

export default async function AssetsPage() { const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions); if (!canManageAssets(session)) return <><Topbar eyebrow="Quản trị nội bộ" title="Tài sản & CCDC" /><div className="content"><div className="access-denied"><strong>Bạn không có quyền quản lý tài sản</strong><span>Hãy liên hệ quản trị viên hoặc bộ phận hành chính.</span></div></div></>; const [assets, inventories, employees] = await Promise.all([listAssets(), listInventorySessions(), listEmployees()]); return <><Topbar eyebrow="Quản trị nội bộ" title="Tài sản & công cụ dụng cụ" /><div className="content assets-content"><AssetsDashboard initialAssets={assets} initialInventories={inventories} employees={employees} referenceDate={new Date().toISOString().slice(0, 10)} /></div></>; }
