"use client";

import { useMemo, useState } from "react";
import type { ShiftsData, TimeCard } from "@/lib/shifts";
import { Icons } from "./icons";

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatDay(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return { weekday: weekdays[value.getDay()], day: String(value.getDate()).padStart(2, "0"), month: String(value.getMonth() + 1).padStart(2, "0") };
}

function workedMinutes(card: TimeCard) {
  if (!card.clockOut) return 0;
  const [inHour, inMinute] = card.clockIn.split(":").map(Number);
  const [outHour, outMinute] = card.clockOut.split(":").map(Number);
  return Math.max(0, outHour * 60 + outMinute - inHour * 60 - inMinute - card.breakMinutes);
}

function durationLabel(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function currentTime() {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}

export function ShiftsDashboard({ data }: { data: ShiftsData }) {
  const [cards, setCards] = useState(data.timeCards);
  const [active, setActive] = useState(data.activeTimeCard);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const todayShift = data.shifts.find((shift) => shift.date === data.referenceDate);
  const totalMinutes = useMemo(() => cards.reduce((total, card) => total + workedMinutes(card), 0), [cards]);

  async function toggleClock() {
    setBusy(true);
    setMessage("");
    const action = active ? "clockOut" : "clockIn";
    const response = await fetch("/api/shifts/timeclock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, timeCardId: active?.id }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Không thể thực hiện chấm công"); setBusy(false); return; }
    if (action === "clockIn") {
      const card: TimeCard = { id: result.id, date: data.referenceDate, clockIn: currentTime(), breakMinutes: 0, state: "clockedIn", confirmed: false };
      setActive(card);
      setCards((current) => [card, ...current.filter((item) => item.date !== data.referenceDate)]);
      setMessage("Đã ghi nhận thời gian vào ca trên Teams Shifts.");
    } else {
      const updated = { ...active!, clockOut: currentTime(), state: "clockedOut" as const };
      setCards((current) => current.map((item) => item.id === active!.id ? updated : item));
      setActive(undefined);
      setMessage("Đã kết thúc ca làm việc.");
    }
    setBusy(false);
  }

  return <>
    <section className="shift-hero">
      <div className="shift-hero-copy"><span className="shift-eyebrow"><i /> MICROSOFT TEAMS SHIFTS</span><h2>{active ? "Bạn đang trong ca" : "Sẵn sàng bắt đầu ngày mới?"}</h2><p>{data.teamName} · Múi giờ Việt Nam</p><div className="shift-today"><span><Icons.CalendarRange size={18} /><i><small>Ca hôm nay</small><strong>{todayShift ? `${todayShift.start} — ${todayShift.end}` : "Không có lịch"}</strong></i></span><span><Icons.MapPin size={18} /><i><small>Địa điểm</small><strong>Văn phòng Viet Robot</strong></i></span></div>{message && <div className={`shift-message ${message.includes("Không thể") ? "error" : ""}`}>{message}</div>}</div>
      <div className={`timeclock-card ${active ? "active" : ""}`}><span className="timeclock-status"><i />{active ? "ĐANG TRONG CA" : "CHƯA VÀO CA"}</span><strong>{active?.clockIn ?? todayShift?.start ?? "--:--"}</strong><small>{active ? `Bắt đầu lúc ${active.clockIn}` : "Giờ bắt đầu dự kiến"}</small><button disabled={busy || (!active && !todayShift)} onClick={toggleClock}>{active ? <Icons.LogOut size={20} /> : <Icons.LogIn size={20} />}{busy ? "Đang đồng bộ..." : active ? "Kết thúc ca" : "Vào ca làm việc"}</button><p><Icons.ShieldCheck size={14} /> Đồng bộ an toàn với Teams Shifts</p></div>
    </section>

    <section className="shift-metrics">
      <div><span className="shift-metric-icon teal"><Icons.Timer size={22} /></span><span><strong>{durationLabel(totalMinutes)}</strong><small>Tổng giờ gần đây</small></span></div>
      <div><span className="shift-metric-icon blue"><Icons.CalendarDays size={22} /></span><span><strong>{data.shifts.length}</strong><small>Ca trong tuần</small></span></div>
      <div><span className="shift-metric-icon amber"><Icons.Clock3 size={22} /></span><span><strong>{cards.filter((card) => card.clockIn > "08:30").length}</strong><small>Lần đi muộn</small></span></div>
      <div><span className="shift-metric-icon green"><Icons.CircleCheck size={22} /></span><span><strong>{cards.filter((card) => card.confirmed).length}</strong><small>Bản ghi đã xác nhận</small></span></div>
    </section>

    <div className="shifts-grid">
      <section className="week-schedule"><header><div><span>LỊCH LÀM VIỆC</span><h2>Tuần này</h2></div><button>Trong tuần <Icons.ChevronDown size={15} /></button></header><div className="week-days">{data.shifts.map((shift) => { const day = formatDay(shift.date); return <article className={shift.date === data.referenceDate ? "today" : ""} key={shift.id}><div className="day-label"><span>{day.weekday}</span><strong>{day.day}</strong><small>/{day.month}</small></div><div className={`shift-block ${shift.color}`}><span>{shift.title}</span><strong>{shift.start} — {shift.end}</strong><small>{shift.activities[0] ?? "Làm việc"}</small></div>{shift.date === data.referenceDate && <i className="today-dot" />}</article>; })}</div></section>
      <aside className="attendance-note"><span className="shift-metric-icon coral"><Icons.Coffee size={24} /></span><h3>Nhắc giờ nghỉ</h3><p>Thời gian nghỉ giữa ca hôm nay dự kiến từ <strong>12:00 đến 13:00</strong>.</p><div><span>Thời lượng nghỉ</span><strong>60 phút</strong></div></aside>
    </div>

    <section className="timesheet-section"><header><div><span>BẢNG CÔNG CÁ NHÂN</span><h2>Chấm công gần đây</h2></div><button>Xem trên Teams <Icons.ArrowUpRight size={16} /></button></header><div className="timesheet-table-wrap"><table className="timesheet-table"><thead><tr><th>Ngày làm việc</th><th>Vào ca</th><th>Ra ca</th><th>Nghỉ</th><th>Giờ công</th><th>Vị trí</th><th>Trạng thái</th></tr></thead><tbody>{cards.slice(0, 7).map((card) => { const day = formatDay(card.date); return <tr key={card.id}><td><strong>{day.weekday}, {day.day}/{day.month}</strong></td><td>{card.clockIn}</td><td>{card.clockOut ?? "Đang làm"}</td><td>{card.breakMinutes} phút</td><td><strong>{card.clockOut ? durationLabel(workedMinutes(card)) : "—"}</strong></td><td><span className={card.approvedLocation ? "location-ok" : "location-neutral"}><Icons.MapPin size={13} />{card.approvedLocation ? "Đúng vị trí" : "Không xác định"}</span></td><td><span className={`time-status ${card.confirmed ? "confirmed" : card.state === "clockedOut" ? "pending" : "working"}`}><i />{card.confirmed ? "Đã xác nhận" : card.state === "clockedOut" ? "Chờ xác nhận" : "Đang trong ca"}</span></td></tr>; })}</tbody></table></div></section>
  </>;
}
