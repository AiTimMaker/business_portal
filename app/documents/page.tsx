import { getServerSession } from "next-auth";
import { DocumentTable } from "@/components/document-table";
import { FileIcon } from "@/components/file-icon";
import { Icons } from "@/components/icons";
import { Topbar } from "@/components/topbar";
import { UploadButton } from "@/components/upload-button";
import { authOptions } from "@/lib/auth";
import { departments } from "@/lib/demo-data";
import { getDocuments } from "@/lib/documents";

export default async function DocumentsPage() {
  const session = process.env.DEMO_MODE === "true" ? null : await getServerSession(authOptions);
  const items = await getDocuments(session?.accessToken);
  return (
    <>
      <Topbar eyebrow="Không gian tri thức" title="Kho tài liệu" />
      <div className="content documents-content">
        <section className="documents-summary">
          <div><span className="summary-icon"><Icons.Folder size={25} /></span><div><strong>{items.length || 560}</strong><small>Tài liệu đang hoạt động</small></div></div>
          <div><span className="summary-icon green"><Icons.ShieldCheck size={25} /></span><div><strong>{items.filter((item) => item.status === "Đã ban hành").length}</strong><small>Tài liệu đã ban hành</small></div></div>
          <div><span className="summary-icon amber"><Icons.Clock3 size={25} /></span><div><strong>{items.filter((item) => item.status === "Chờ duyệt").length}</strong><small>Đang chờ phê duyệt</small></div></div>
          <UploadButton />
        </section>

        <section className="featured-section">
          <div className="section-heading"><div><span>Được đề xuất</span><h3>Tài liệu quan trọng</h3></div></div>
          <div className="featured-documents">{items.filter((item) => item.featured).map((item) => <article className="featured-document" key={item.id}><FileIcon type={item.type} large /><span className="pill blue">{item.category}</span><h4>{item.name}</h4><p>{item.department} · Phiên bản {item.version}</p><footer><span className="avatar tiny">{item.modifiedBy.split(" ").slice(-2).map((word) => word[0]).join("")}</span><small>Cập nhật {item.modifiedAt.toLowerCase()}</small><button><Icons.MoreHorizontal size={19} /></button></footer></article>)}</div>
        </section>

        <section className="library-section">
          <div className="section-heading"><div><span>Thư viện chung</span><h3>Tất cả tài liệu</h3></div><span className="result-count">{items.length} kết quả</span></div>
          <DocumentTable items={items} />
        </section>

        <section className="library-hint"><Icons.ShieldCheck size={20} /><span><strong>Kho tài liệu được bảo vệ bởi Microsoft 365</strong><small>Quyền truy cập được áp dụng theo phòng ban và vai trò của bạn.</small></span><span>{departments.length} phòng ban đã kết nối</span></section>
      </div>
    </>
  );
}
