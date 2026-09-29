import { Topbar } from "@/components/topbar";
import { DocumentTable } from "@/components/document-table";
import { documents } from "@/lib/demo-data";

export default function SopPage() {
  return <><Topbar eyebrow="Tiêu chuẩn vận hành" title="SOP & Quy trình" /><div className="content documents-content"><section className="library-section standalone"><div className="section-heading"><div><span>Phiên bản hiện hành</span><h3>Quy trình đã chuẩn hóa</h3></div></div><DocumentTable items={documents.filter((item) => item.category === "SOP" || item.category === "Chính sách")} /></section></div></>;
}
