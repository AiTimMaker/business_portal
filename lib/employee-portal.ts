import "server-only";
import type { Employee } from "./hr-types";
import { listEmployees } from "./hr-store";
import { getShiftsData, type TimeCard } from "./shifts";

export type EmploymentEvent = { date: string; title: string; description: string; type: "join" | "promotion" | "contract" | "award" };
export type Payslip = { id: string; month: string; gross: number; insurance: number; tax: number; otherDeductions: number; net: number; status: "Đã thanh toán" | "Chờ duyệt"; paidAt?: string };
export type KpiItem = { id: string; title: string; category: string; weight: number; current: number; target: number; unit: string; status: "Đúng tiến độ" | "Cần chú ý" | "Hoàn thành" };
export type LeaveBalance = { type: string; allowance: number; used: number; pending: number; unit: string };
export type EmployeePortalData = {
  employee: Employee;
  employmentHistory: EmploymentEvent[];
  payslips: Payslip[];
  kpis: KpiItem[];
  leaveBalances: LeaveBalance[];
  attendance: { records: TimeCard[]; totalMinutes: number; lateCount: number; workingDays: number; overtimeMinutes: number };
};

function workedMinutes(card: TimeCard) {
  if (!card.clockOut) return 0;
  const [inHour, inMinute] = card.clockIn.split(":").map(Number);
  const [outHour, outMinute] = card.clockOut.split(":").map(Number);
  return Math.max(0, outHour * 60 + outMinute - inHour * 60 - inMinute - card.breakMinutes);
}

export async function getEmployeePortalData(email: string | null | undefined, accessToken?: string): Promise<EmployeePortalData | null> {
  const employees = await listEmployees();
  const demoEmail = process.env.DEMO_EMPLOYEE_EMAIL ?? "tim.nguyen@vietrobot.vn";
  const employee = employees.find((item) => item.email.toLowerCase() === (email || demoEmail).toLowerCase());
  if (!employee) return null;
  let cards: TimeCard[] = [];
  try { cards = (await getShiftsData(accessToken)).timeCards; } catch { cards = []; }
  const totalMinutes = cards.reduce((sum, card) => sum + workedMinutes(card), 0);
  return {
    employee,
    employmentHistory: [
      { date: employee.joinDate, title: `Gia nhập Viet Robot`, description: `Bắt đầu công tác tại phòng ${employee.department}.`, type: "join" },
      { date: "2023-01-01", title: "Bổ nhiệm Điều phối dự án", description: "Điều phối các chương trình Robotics cấp khu vực.", type: "promotion" },
      { date: "2024-08-16", title: "Ký hợp đồng không xác định thời hạn", description: "Cập nhật loại hợp đồng lao động và chế độ phúc lợi.", type: "contract" },
      { date: "2025-12-20", title: "Nhân sự xuất sắc năm 2025", description: "Ghi nhận đóng góp trong hoạt động tổ chức giải Robotics.", type: "award" },
    ].sort((a, b) => b.date.localeCompare(a.date)) as EmploymentEvent[],
    payslips: [
      { id: "pay-2026-09", month: "2026-09", gross: 32_500_000, insurance: 3_412_500, tax: 1_435_000, otherDeductions: 0, net: 27_652_500, status: "Chờ duyệt" },
      { id: "pay-2026-08", month: "2026-08", gross: 32_500_000, insurance: 3_412_500, tax: 1_435_000, otherDeductions: 300_000, net: 27_352_500, status: "Đã thanh toán", paidAt: "2026-09-05" },
      { id: "pay-2026-07", month: "2026-07", gross: 35_700_000, insurance: 3_412_500, tax: 1_755_000, otherDeductions: 0, net: 30_532_500, status: "Đã thanh toán", paidAt: "2026-08-05" },
      { id: "pay-2026-06", month: "2026-06", gross: 32_500_000, insurance: 3_412_500, tax: 1_435_000, otherDeductions: 0, net: 27_652_500, status: "Đã thanh toán", paidAt: "2026-07-05" },
    ],
    kpis: [
      { id: "kpi-1", title: "Hoàn thành dự án đúng hạn", category: "Hiệu suất", weight: 35, current: 8, target: 10, unit: "dự án", status: "Đúng tiến độ" },
      { id: "kpi-2", title: "Mức hài lòng của đơn vị phối hợp", category: "Chất lượng", weight: 25, current: 4.7, target: 4.8, unit: "/5", status: "Đúng tiến độ" },
      { id: "kpi-3", title: "Chuẩn hóa quy trình vận hành", category: "Cải tiến", weight: 25, current: 5, target: 6, unit: "SOP", status: "Đúng tiến độ" },
      { id: "kpi-4", title: "Đào tạo và phát triển đội ngũ", category: "Con người", weight: 15, current: 3, target: 5, unit: "buổi", status: "Cần chú ý" },
    ],
    leaveBalances: [
      { type: "Phép năm", allowance: 12, used: 5, pending: 1, unit: "ngày" },
      { type: "Nghỉ bù", allowance: 4, used: 1, pending: 0, unit: "ngày" },
      { type: "Làm việc từ xa", allowance: 24, used: 11, pending: 0, unit: "ngày" },
    ],
    attendance: { records: cards, totalMinutes, lateCount: cards.filter((card) => card.clockIn > "08:30").length, workingDays: cards.length, overtimeMinutes: cards.reduce((sum, card) => sum + Math.max(0, workedMinutes(card) - 480), 0) },
  };
}
