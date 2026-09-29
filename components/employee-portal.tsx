"use client";

import { useMemo, useState } from "react";
import type { EmployeePortalData, Payslip } from "@/lib/employee-portal";
import { Icons } from "./icons";

type Tab = "overview" | "history" | "attendance" | "payroll" | "kpi";
const tabs: { id: Tab; label: string; icon: typeof Icons.Home }[] = [
  { id: "overview", label: "Tổng quan", icon: Icons.Home }, { id: "history", label: "Quá trình công tác", icon: Icons.History },
  { id: "attendance", label: "Chấm công", icon: Icons.Clock3 }, { id: "payroll", label: "Phiếu lương", icon: Icons.WalletCards },
  { id: "kpi", label: "KPI của tôi", icon: Icons.Target },
];
function initials(name: string) { return name.split(" ").slice(-2).map((word) => word[0]).join("").toUpperCase(); }
function dateLabel(date?: string) { return date ? new Intl.DateTimeFormat("vi-VN").format(new Date(`${date}T00:00:00`)) : "Chưa cập nhật"; }
function money(value: number) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value); }
function monthLabel(value: string) { const [year, month] = value.split("-"); return `Tháng ${Number(month)}/${year}`; }
function duration(minutes: number) { return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`; }
function workedMinutes(clockIn: string, clockOut?: string, breaks = 0) { if (!clockOut) return 0; const [ih, im] = clockIn.split(":").map(Number); const [oh, om] = clockOut.split(":").map(Number); return Math.max(0, oh * 60 + om - ih * 60 - im - breaks); }

export function EmployeePortal({ data }: { data: EmployeePortalData }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [payslip, setPayslip] = useState<Payslip>();
  const kpiScore = useMemo(() => Math.round(data.kpis.reduce((sum, item) => sum + Math.min(item.current / item.target, 1) * item.weight, 0)), [data.kpis]);
  const leaveRemaining = data.leaveBalances[0].allowance - data.leaveBalances[0].used - data.leaveBalances[0].pending;
  return <>
    <section className="myhr-hero"><div className="myhr-avatar">{initials(data.employee.fullName)}</div><div className="myhr-identity"><span>HỒ SƠ NHÂN VIÊN · {data.employee.employeeCode}</span><h2>{data.employee.fullName}</h2><p>{data.employee.jobTitle} · {data.employee.department}</p><div><span><Icons.Mail size={14} />{data.employee.email}</span><span><Icons.MapPin size={14} />{data.employee.location}</span><span><Icons.BriefcaseBusiness size={14} />Từ {dateLabel(data.employee.joinDate)}</span></div></div><div className="myhr-profile-state"><span><i />{data.employee.status}</span><small>Quản lý trực tiếp</small><strong>{data.employee.manager}</strong></div></section>
    <nav className="myhr-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={17} />{label}</button>)}</nav>
    {tab === "overview" && <Overview data={data} kpiScore={kpiScore} leaveRemaining={leaveRemaining} onTab={setTab} />}
    {tab === "history" && <EmploymentHistory data={data} />}
    {tab === "attendance" && <Attendance data={data} />}
    {tab === "payroll" && <Payroll data={data} onOpen={setPayslip} />}
    {tab === "kpi" && <Kpi data={data} score={kpiScore} />}
    {payslip && <PayslipDialog payslip={payslip} employeeName={data.employee.fullName} onClose={() => setPayslip(undefined)} />}
  </>;
}

function Overview({ data, kpiScore, leaveRemaining, onTab }: { data: EmployeePortalData; kpiScore: number; leaveRemaining: number; onTab: (tab: Tab) => void }) {
  const latestPay = data.payslips[0];
  return <div className="myhr-overview"><section className="myhr-stat-grid"><div><span className="myhr-stat-icon teal"><Icons.FileCheck2 size={22} /></span><span><small>Hợp đồng</small><strong>{data.employee.contractType}</strong><em>{data.employee.contractEndDate ? `Đến ${dateLabel(data.employee.contractEndDate)}` : "Không thời hạn"}</em></span></div><div><span className="myhr-stat-icon amber"><Icons.Umbrella size={22} /></span><span><small>Phép năm còn lại</small><strong>{leaveRemaining} ngày</strong><em>Đã dùng {data.leaveBalances[0].used}/{data.leaveBalances[0].allowance}</em></span></div><div><span className="myhr-stat-icon blue"><Icons.Timer size={22} /></span><span><small>Giờ công gần đây</small><strong>{duration(data.attendance.totalMinutes)}</strong><em>{data.attendance.workingDays} ngày làm việc</em></span></div><div><span className="myhr-stat-icon purple"><Icons.Target size={22} /></span><span><small>Tiến độ KPI</small><strong>{kpiScore}%</strong><em>{data.kpis.filter((item) => item.status === "Hoàn thành").length}/{data.kpis.length} mục tiêu hoàn thành</em></span></div></section>
    <div className="myhr-overview-grid"><section className="myhr-panel personal-info"><header><div><span>HỒ SƠ</span><h3>Thông tin cá nhân</h3></div><button><Icons.Pencil size={15} /> Yêu cầu cập nhật</button></header><dl><div><dt>Mã nhân viên</dt><dd>{data.employee.employeeCode}</dd></div><div><dt>Email công việc</dt><dd>{data.employee.email}</dd></div><div><dt>Số điện thoại</dt><dd>{data.employee.phone}</dd></div><div><dt>Ngày sinh</dt><dd>{dateLabel(data.employee.birthDate)}</dd></div><div><dt>Phòng ban</dt><dd>{data.employee.department}</dd></div><div><dt>Chức danh</dt><dd>{data.employee.jobTitle}</dd></div><div><dt>Nơi làm việc</dt><dd>{data.employee.location}</dd></div><div><dt>Ngày vào làm</dt><dd>{dateLabel(data.employee.joinDate)}</dd></div></dl></section>
      <aside className="myhr-side-widgets"><section className="myhr-panel latest-pay"><header><div><span>THU NHẬP</span><h3>Phiếu lương mới nhất</h3></div><Icons.WalletCards size={21} /></header><small>{monthLabel(latestPay.month)}</small><strong>{money(latestPay.net)}</strong><p>Thực nhận sau bảo hiểm và thuế</p><button onClick={() => onTab("payroll")}>Xem phiếu lương <Icons.ChevronRight size={15} /></button></section><section className="myhr-panel leave-widget"><header><div><span>NGHỈ PHÉP</span><h3>Số dư của tôi</h3></div><Icons.Umbrella size={21} /></header>{data.leaveBalances.map((item) => <div key={item.type}><span>{item.type}<small>Đã dùng {item.used} {item.unit}</small></span><strong>{item.allowance - item.used - item.pending} <small>{item.unit}</small></strong></div>)}</section></aside></div>
  </div>;
}

function EmploymentHistory({ data }: { data: EmployeePortalData }) {
  const icons = { join: Icons.LogIn, promotion: Icons.TrendingUp, contract: Icons.FileCheck2, award: Icons.Award };
  return <section className="myhr-panel myhr-history"><header><div><span>HÀNH TRÌNH TẠI VIET ROBOT</span><h3>Quá trình công tác</h3></div><small>{data.employmentHistory.length} dấu mốc</small></header><div className="history-timeline">{data.employmentHistory.map((event) => { const Icon = icons[event.type]; return <article key={`${event.date}-${event.title}`}><span className={`history-icon ${event.type}`}><Icon size={18} /></span><div><time>{dateLabel(event.date)}</time><h4>{event.title}</h4><p>{event.description}</p></div></article>; })}</div></section>;
}

function Attendance({ data }: { data: EmployeePortalData }) {
  return <><section className="myhr-stat-grid attendance-stats"><div><span className="myhr-stat-icon teal"><Icons.Timer size={22} /></span><span><small>Tổng giờ làm</small><strong>{duration(data.attendance.totalMinutes)}</strong></span></div><div><span className="myhr-stat-icon blue"><Icons.CalendarDays size={22} /></span><span><small>Ngày có công</small><strong>{data.attendance.workingDays}</strong></span></div><div><span className="myhr-stat-icon coral"><Icons.Clock3 size={22} /></span><span><small>Đi muộn</small><strong>{data.attendance.lateCount} lần</strong></span></div><div><span className="myhr-stat-icon purple"><Icons.TrendingUp size={22} /></span><span><small>Làm thêm giờ</small><strong>{duration(data.attendance.overtimeMinutes)}</strong></span></div></section><section className="myhr-panel myhr-attendance"><header><div><span>DỮ LIỆU TEAMS SHIFTS</span><h3>Bảng công cá nhân</h3></div><a href="/shifts">Mở trang chấm công <Icons.ArrowUpRight size={15} /></a></header><table><thead><tr><th>Ngày</th><th>Vào ca</th><th>Ra ca</th><th>Nghỉ</th><th>Giờ công</th><th>Xác nhận</th></tr></thead><tbody>{data.attendance.records.map((card) => <tr key={card.id}><td>{dateLabel(card.date)}</td><td>{card.clockIn}</td><td>{card.clockOut ?? "Đang làm"}</td><td>{card.breakMinutes} phút</td><td><strong>{card.clockOut ? duration(workedMinutes(card.clockIn, card.clockOut, card.breakMinutes)) : "—"}</strong></td><td><span className={`pay-status ${card.confirmed ? "paid" : "pending"}`}>{card.confirmed ? "Đã xác nhận" : "Chờ xác nhận"}</span></td></tr>)}</tbody></table></section></>;
}

function Payroll({ data, onOpen }: { data: EmployeePortalData; onOpen: (item: Payslip) => void }) {
  return <section className="myhr-panel payroll-panel"><header><div><span>THÔNG TIN BẢO MẬT</span><h3>Phiếu lương của tôi</h3><p>Chỉ bạn và bộ phận HR được phép xem dữ liệu này.</p></div><span className="secure-badge"><Icons.ShieldCheck size={15} /> Riêng tư</span></header><div className="payroll-list">{data.payslips.map((item) => <article key={item.id}><span className="payroll-month"><Icons.WalletCards size={20} /></span><div><strong>{monthLabel(item.month)}</strong><small>{item.paidAt ? `Thanh toán ${dateLabel(item.paidAt)}` : "Đang chờ HR phê duyệt"}</small></div><span><small>Tổng thu nhập</small><strong>{money(item.gross)}</strong></span><span><small>Thực nhận</small><strong>{money(item.net)}</strong></span><span className={`pay-status ${item.status === "Đã thanh toán" ? "paid" : "pending"}`}>{item.status}</span><button onClick={() => onOpen(item)}>Xem chi tiết <Icons.ChevronRight size={15} /></button></article>)}</div></section>;
}

function Kpi({ data, score }: { data: EmployeePortalData; score: number }) {
  return <><section className="kpi-hero"><div><span>CHU KỲ ĐÁNH GIÁ 2026</span><h2>Tiến độ mục tiêu cá nhân</h2><p>Cập nhật gần nhất bởi quản lý trực tiếp.</p></div><div className="kpi-score"><strong>{score}<small>%</small></strong><span>Điểm tiến độ tổng</span></div></section><section className="kpi-grid">{data.kpis.map((item) => { const percent = Math.min(Math.round(item.current / item.target * 100), 100); return <article className="myhr-panel kpi-card" key={item.id}><header><span>{item.category}</span><em>Trọng số {item.weight}%</em></header><h3>{item.title}</h3><div className="kpi-numbers"><strong>{item.current}{item.unit.startsWith("/") ? item.unit : ` ${item.unit}`}</strong><span>Mục tiêu {item.target}{item.unit.startsWith("/") ? item.unit : ` ${item.unit}`}</span></div><div className="kpi-progress"><i style={{ width: `${percent}%` }} /></div><footer><span>{percent}% hoàn thành</span><strong className={item.status === "Cần chú ý" ? "attention" : ""}>{item.status}</strong></footer></article>; })}</section></>;
}

function PayslipDialog({ payslip, employeeName, onClose }: { payslip: Payslip; employeeName: string; onClose: () => void }) {
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="payslip-dialog"><header><div><span>VIET ROBOT</span><h2>Phiếu lương {monthLabel(payslip.month)}</h2><p>{employeeName}</p></div><button onClick={onClose}><Icons.X size={20} /></button></header><div className="payslip-lines"><div><span>Tổng thu nhập</span><strong>{money(payslip.gross)}</strong></div><div><span>Bảo hiểm bắt buộc</span><strong>-{money(payslip.insurance)}</strong></div><div><span>Thuế thu nhập cá nhân</span><strong>-{money(payslip.tax)}</strong></div><div><span>Khấu trừ khác</span><strong>-{money(payslip.otherDeductions)}</strong></div></div><div className="payslip-net"><span>THỰC NHẬN</span><strong>{money(payslip.net)}</strong></div><footer><span className={`pay-status ${payslip.status === "Đã thanh toán" ? "paid" : "pending"}`}>{payslip.status}</span><button className="button button-primary" onClick={() => window.print()}><Icons.Download size={16} /> In / lưu PDF</button></footer></section></div>;
}
