"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ContractType, Employee, EmployeeInput, EmployeeStatus } from "@/lib/hr-types";
import { Icons } from "./icons";

const departments = ["Nhân sự", "Kinh doanh", "Marketing", "Kỹ thuật", "Đào tạo", "Tài chính", "Ban Giám đốc"];
const locations = ["Đà Nẵng", "Hà Nội", "TP. Hồ Chí Minh"];
const statuses: EmployeeStatus[] = ["Đang làm việc", "Thử việc", "Nghỉ phép", "Đã nghỉ việc"];
const contracts: ContractType[] = ["Không xác định thời hạn", "Xác định thời hạn", "Thử việc", "Cộng tác viên"];

function initials(name: string) { return name.split(" ").slice(-2).map((word) => word[0]).join("").toUpperCase(); }
function formatDate(date?: string) { return date ? new Intl.DateTimeFormat("vi-VN").format(new Date(`${date}T00:00:00`)) : "Chưa cập nhật"; }
function statusClass(status: EmployeeStatus) { return status === "Đang làm việc" ? "active" : status === "Thử việc" ? "probation" : status === "Nghỉ phép" ? "leave" : "inactive"; }

export function HrDashboard({ initialEmployees, referenceDate }: { initialEmployees: Employee[]; referenceDate: string }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("Tất cả phòng ban");
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [selected, setSelected] = useState<Employee>();
  const [editing, setEditing] = useState<Employee | null>();
  const [showEditor, setShowEditor] = useState(false);
  const reference = new Date(`${referenceDate}T00:00:00`);
  const inDays = (date?: string) => date ? Math.ceil((new Date(`${date}T00:00:00`).getTime() - reference.getTime()) / 86_400_000) : Infinity;
  const sinceDays = (date: string) => Math.floor((reference.getTime() - new Date(`${date}T00:00:00`).getTime()) / 86_400_000);

  const filtered = useMemo(() => employees.filter((employee) => {
    const haystack = `${employee.fullName} ${employee.employeeCode} ${employee.email} ${employee.jobTitle}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (department === "Tất cả phòng ban" || employee.department === department) && (status === "Tất cả trạng thái" || employee.status === status);
  }), [employees, query, department, status]);
  const activeCount = employees.filter((item) => item.status !== "Đã nghỉ việc").length;
  const probationCount = employees.filter((item) => item.status === "Thử việc").length;
  const newHires = employees.filter((item) => sinceDays(item.joinDate) >= 0 && sinceDays(item.joinDate) <= 90).length;
  const expiring = employees.filter((item) => inDays(item.contractEndDate) >= 0 && inDays(item.contractEndDate) <= 90).length;

  function openCreate() { setEditing(null); setShowEditor(true); }
  function openEdit(employee: Employee) { setEditing(employee); setShowEditor(true); }
  function saved(employee: Employee) {
    setEmployees((current) => current.some((item) => item.id === employee.id) ? current.map((item) => item.id === employee.id ? employee : item) : [employee, ...current]);
    setSelected((current) => current?.id === employee.id ? employee : current);
    setShowEditor(false);
  }

  return <>
    <section className="hr-metrics">
      <div><span className="hr-metric-icon teal"><Icons.Users size={23} /></span><span><strong>{activeCount}</strong><small>Nhân sự hiện tại</small></span><em>+{newHires} mới</em></div>
      <div><span className="hr-metric-icon blue"><Icons.Building2 size={23} /></span><span><strong>{departments.length}</strong><small>Phòng ban</small></span></div>
      <div><span className="hr-metric-icon amber"><Icons.UserRoundCheck size={23} /></span><span><strong>{probationCount}</strong><small>Đang thử việc</small></span></div>
      <div><span className="hr-metric-icon coral"><Icons.BriefcaseBusiness size={23} /></span><span><strong>{expiring}</strong><small>Hợp đồng sắp hết hạn</small></span></div>
    </section>

    <section className="hr-workspace">
      <header className="hr-workspace-head"><div><span>HỒ SƠ TỔ CHỨC</span><h2>Danh sách nhân viên</h2><p>{filtered.length} trong tổng số {employees.length} hồ sơ</p></div><button className="button button-primary" onClick={openCreate}><Icons.UserPlus size={18} /> Thêm nhân viên</button></header>
      <div className="hr-toolbar"><label><Icons.Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, mã, email hoặc chức danh..." />{query && <button onClick={() => setQuery("")}><Icons.X size={15} /></button>}</label><select value={department} onChange={(event) => setDepartment(event.target.value)}><option>Tất cả phòng ban</option>{departments.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Tất cả trạng thái</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><button className="filter-button"><Icons.SlidersHorizontal size={17} /></button></div>
      <div className="hr-table-wrap"><table className="hr-table"><thead><tr><th>Nhân viên</th><th>Phòng ban & chức danh</th><th>Quản lý trực tiếp</th><th>Ngày vào làm</th><th>Loại hợp đồng</th><th>Trạng thái</th><th /></tr></thead><tbody>{filtered.map((employee) => <tr key={employee.id} onClick={() => setSelected(employee)}><td><div className="employee-identity"><span className="employee-avatar">{initials(employee.fullName)}</span><span><strong>{employee.fullName}</strong><small>{employee.employeeCode} · {employee.email}</small></span></div></td><td><span className="employee-role"><strong>{employee.jobTitle}</strong><small>{employee.department} · {employee.location}</small></span></td><td>{employee.manager}</td><td>{formatDate(employee.joinDate)}</td><td><span className="contract-label">{employee.contractType}</span></td><td><span className={`employee-status ${statusClass(employee.status)}`}><i />{employee.status}</span></td><td><button className="row-menu" onClick={(event) => { event.stopPropagation(); openEdit(employee); }}><Icons.Pencil size={16} /></button></td></tr>)}</tbody></table>{!filtered.length && <div className="hr-empty"><Icons.Users size={30} /><strong>Không tìm thấy nhân viên</strong><span>Hãy thay đổi từ khóa hoặc bộ lọc.</span></div>}</div>
    </section>
    {selected && <EmployeeDrawer employee={selected} onClose={() => setSelected(undefined)} onEdit={() => openEdit(selected)} />}
    {showEditor && <EmployeeEditor employee={editing ?? undefined} onClose={() => setShowEditor(false)} onSaved={saved} />}
  </>;
}

function EmployeeDrawer({ employee, onClose, onEdit }: { employee: Employee; onClose: () => void; onEdit: () => void }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="employee-drawer"><header><button onClick={onClose}><Icons.X size={20} /></button></header><div className="profile-head"><span className="employee-avatar large">{initials(employee.fullName)}</span><h2>{employee.fullName}</h2><p>{employee.jobTitle}</p><span className={`employee-status ${statusClass(employee.status)}`}><i />{employee.status}</span></div><div className="profile-actions"><a href={`mailto:${employee.email}`}><Icons.Mail size={17} /> Gửi email</a><button onClick={onEdit}><Icons.Pencil size={17} /> Chỉnh sửa</button></div><section><h3>Thông tin liên hệ</h3><dl><div><dt><Icons.IdCard size={16} />Mã nhân viên</dt><dd>{employee.employeeCode}</dd></div><div><dt><Icons.Mail size={16} />Email</dt><dd>{employee.email}</dd></div><div><dt><Icons.Phone size={16} />Điện thoại</dt><dd>{employee.phone}</dd></div><div><dt><Icons.MapPin size={16} />Nơi làm việc</dt><dd>{employee.location}</dd></div></dl></section><section><h3>Thông tin công việc</h3><dl><div><dt>Phòng ban</dt><dd>{employee.department}</dd></div><div><dt>Quản lý trực tiếp</dt><dd>{employee.manager}</dd></div><div><dt>Ngày vào làm</dt><dd>{formatDate(employee.joinDate)}</dd></div><div><dt>Loại hợp đồng</dt><dd>{employee.contractType}</dd></div><div><dt>Ngày hết hạn</dt><dd>{formatDate(employee.contractEndDate)}</dd></div></dl></section><footer>Cập nhật gần nhất {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(employee.updatedAt))}</footer></aside></div>;
}

function EmployeeEditor({ employee, onClose, onSaved }: { employee?: Employee; onClose: () => void; onSaved: (employee: Employee) => void }) {
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); const form = new FormData(event.currentTarget);
    const input: EmployeeInput = { employeeCode: String(form.get("employeeCode")), fullName: String(form.get("fullName")), email: String(form.get("email")), phone: String(form.get("phone")), department: String(form.get("department")), jobTitle: String(form.get("jobTitle")), manager: String(form.get("manager")), location: String(form.get("location")), joinDate: String(form.get("joinDate")), birthDate: String(form.get("birthDate")) || undefined, status: String(form.get("status")) as EmployeeStatus, contractType: String(form.get("contractType")) as ContractType, contractEndDate: String(form.get("contractEndDate")) || undefined };
    const response = await fetch(employee ? `/api/hr/employees/${employee.id}` : "/api/hr/employees", { method: employee ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Không thể lưu hồ sơ"); setSaving(false); return; } onSaved(result);
  }
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="employee-editor" onSubmit={submit}><header><div><span>HỒ SƠ NHÂN SỰ</span><h2>{employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</h2></div><button type="button" onClick={onClose}><Icons.X size={20} /></button></header><div className="employee-form-scroll"><h3>Thông tin cơ bản</h3><div className="employee-form-grid"><label>Họ và tên<input name="fullName" required defaultValue={employee?.fullName} /></label><label>Mã nhân viên<input name="employeeCode" required defaultValue={employee?.employeeCode} placeholder="VR061" /></label><label>Email công việc<input name="email" type="email" required defaultValue={employee?.email} /></label><label>Số điện thoại<input name="phone" required defaultValue={employee?.phone} /></label><label>Ngày sinh<input name="birthDate" type="date" defaultValue={employee?.birthDate} /></label><label>Nơi làm việc<select name="location" defaultValue={employee?.location ?? locations[0]}>{locations.map((item) => <option key={item}>{item}</option>)}</select></label></div><h3>Thông tin công việc</h3><div className="employee-form-grid"><label>Phòng ban<select name="department" defaultValue={employee?.department ?? departments[0]}>{departments.map((item) => <option key={item}>{item}</option>)}</select></label><label>Chức danh<input name="jobTitle" required defaultValue={employee?.jobTitle} /></label><label>Quản lý trực tiếp<input name="manager" required defaultValue={employee?.manager} /></label><label>Ngày vào làm<input name="joinDate" type="date" required defaultValue={employee?.joinDate} /></label><label>Trạng thái<select name="status" defaultValue={employee?.status ?? "Thử việc"}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label>Loại hợp đồng<select name="contractType" defaultValue={employee?.contractType ?? "Thử việc"}>{contracts.map((item) => <option key={item}>{item}</option>)}</select></label><label>Ngày hết hạn hợp đồng<input name="contractEndDate" type="date" defaultValue={employee?.contractEndDate} /></label></div>{error && <p className="dialog-error">{error}</p>}</div><footer><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? "Đang lưu..." : employee ? "Lưu thay đổi" : "Tạo hồ sơ"}</button></footer></form></div>;
}
