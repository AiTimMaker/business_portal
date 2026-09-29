"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";
import { Logo } from "./logo";

const navigation = [
  { href: "/", label: "Tổng quan", icon: Icons.Home },
  { href: "/my-hr", label: "Hồ sơ của tôi", icon: Icons.IdCard },
  { href: "/documents", label: "Kho tài liệu", icon: Icons.Folder },
  { href: "/sop", label: "SOP & Quy trình", icon: Icons.BookOpen },
  { href: "/planner", label: "Công việc & dự án", icon: Icons.ListChecks },
  { href: "/shifts", label: "Lịch làm & chấm công", icon: Icons.Clock3 },
  { href: "/engage", label: "Cộng đồng nội bộ", icon: Icons.MessageCircle },
  { href: "/departments", label: "Phòng ban", icon: Icons.LayoutGrid },
  { href: "/hr", label: "Quản lý nhân sự", icon: Icons.Users },
  { href: "/assets", label: "Tài sản & CCDC", icon: Icons.Package },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-head"><Logo /></div>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        <p className="nav-label">Không gian làm việc</p>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return <Link className={`nav-link ${active ? "active" : ""}`} href={href} key={href}><Icon size={19} /><span>{label}</span>{active && <i />}</Link>;
        })}
        <p className="nav-label nav-label-spaced">Tiện ích</p>
        <a className="nav-link" href="#"><Icons.Send size={19} /><span>Yêu cầu & phê duyệt</span></a>
        <a className="nav-link" href="#"><Icons.Headphones size={19} /><span>Hỗ trợ IT</span></a>
      </nav>
      <div className="sidebar-footer">
        <div className="security-note"><Icons.ShieldCheck size={18} /><span>Kết nối an toàn với<br /><strong>Microsoft 365</strong></span></div>
        <button className="user-card"><span className="avatar">TN</span><span><strong>Tim Nguyễn</strong><small>Nhân viên</small></span><Icons.MoreHorizontal size={18} /></button>
      </div>
    </aside>
  );
}
