import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { FileIcon } from "@/components/file-icon";
import { Icons } from "@/components/icons";
import { announcements, departments, documents, quickLinks } from "@/lib/demo-data";

const iconMap = { folder: Icons.Folder, send: Icons.Send, tasks: Icons.ListChecks, users: Icons.Users, headphones: Icons.Headphones, clock: Icons.Clock3 };

export default function DashboardPage() {
  return (
    <>
      <Topbar eyebrow="Cổng thông tin nội bộ" title="Xin chào, Tim!" />
      <div className="content dashboard-content">
        <section className="hero-card">
          <div className="hero-pattern" />
          <div className="hero-copy"><span className="eyebrow-light"><Icons.Sparkles size={15} /> CÙNG KIẾN TẠO TƯƠNG LAI</span><h2>Thông tin đúng.<br />Hành động nhanh.</h2><p>Mọi kiến thức, quy trình và công cụ bạn cần — trong một không gian làm việc thống nhất.</p><Link href="/documents" className="button button-light">Khám phá kho tài liệu <Icons.ChevronRight size={18} /></Link></div>
          <div className="hero-visual"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><div className="robot-core"><div className="core-eye one" /><div className="core-eye two" /><i /></div><div className="float-card card-one"><Icons.BookOpen size={19} /><span><strong>560+</strong><small>Tài liệu</small></span></div><div className="float-card card-two"><Icons.ShieldCheck size={19} /><span><strong>Đã xác thực</strong><small>Nội dung tin cậy</small></span></div></div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><span>Truy cập nhanh</span><h3>Bắt đầu công việc</h3></div></div>
          <div className="quick-grid">{quickLinks.map((item) => { const Icon = iconMap[item.icon as keyof typeof iconMap]; return <Link href={item.href} className="quick-card" key={item.title}><span className="quick-icon"><Icon size={22} /></span><span><strong>{item.title}</strong><small>{item.description}</small></span><Icons.ChevronRight size={18} /></Link>; })}</div>
        </section>

        <div className="dashboard-columns">
          <section className="section-block">
            <div className="section-heading"><div><span>Mới nhất</span><h3>Thông báo công ty</h3></div><button>Xem tất cả <Icons.ChevronRight size={16} /></button></div>
            <div className="announcement-list">{announcements.map((item) => <article className="announcement" key={item.title}><time className={item.color}><strong>{item.date.split(".")[0]}</strong><small>THÁNG {item.date.split(".")[1]}</small></time><div><span className={`pill ${item.color}`}>{item.tag}</span><h4>{item.title}</h4><p>{item.excerpt}</p></div></article>)}</div>
          </section>
          <section className="section-block recent-panel">
            <div className="section-heading"><div><span>Tiếp tục</span><h3>Tài liệu gần đây</h3></div><Link href="/documents">Mở kho <Icons.ChevronRight size={16} /></Link></div>
            <div className="recent-list">{documents.slice(0, 4).map((item) => <div className="recent-document" key={item.id}><FileIcon type={item.type} /><div><strong>{item.name}</strong><span>{item.department} · v{item.version}</span></div><button><Icons.Star size={17} /></button></div>)}</div>
          </section>
        </div>

        <section className="section-block department-section">
          <div className="section-heading"><div><span>Không gian nội dung</span><h3>Phòng ban</h3></div><Link href="/departments">Xem tất cả <Icons.ChevronRight size={16} /></Link></div>
          <div className="department-grid">{departments.map((item) => <Link href={`/documents?department=${encodeURIComponent(item.name)}`} className="department-card" key={item.name}><span className={`department-mark ${item.color}`}>{item.short}</span><div><strong>{item.name}</strong><small>{item.documents} tài liệu</small></div><Icons.ChevronRight size={18} /></Link>)}</div>
        </section>
      </div>
    </>
  );
}
