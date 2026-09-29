import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { departments } from "@/lib/demo-data";
import { Icons } from "@/components/icons";

export default function DepartmentsPage() {
  return <><Topbar eyebrow="Cấu trúc tổ chức" title="Phòng ban" /><div className="content"><section className="department-page-grid">{departments.map((item) => <Link href={`/documents?department=${item.name}`} className="department-page-card" key={item.name}><span className={`department-mark ${item.color}`}>{item.short}</span><h2>{item.name}</h2><p>Thông tin, tài liệu và quy trình của phòng {item.name.toLowerCase()}.</p><footer><span>{item.documents} tài liệu</span><Icons.ChevronRight size={19} /></footer></Link>)}</section></div></>;
}
