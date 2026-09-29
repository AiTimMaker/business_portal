"use client";

import { FormEvent, useMemo, useState } from "react";
import type { PlannerPlan, PlannerTask } from "@/lib/demo-data";
import { Icons } from "./icons";

const columns = [
  { value: 0 as const, title: "Chưa bắt đầu", icon: Icons.CircleDashed },
  { value: 50 as const, title: "Đang thực hiện", icon: Icons.CircleDot },
  { value: 100 as const, title: "Hoàn thành", icon: Icons.CircleCheck },
];

function priorityLabel(priority: number) {
  if (priority <= 1) return { label: "Khẩn cấp", className: "urgent" };
  if (priority <= 4) return { label: "Quan trọng", className: "important" };
  if (priority <= 7) return { label: "Trung bình", className: "medium" };
  return { label: "Thấp", className: "low" };
}

function formatDate(date?: string) {
  if (!date) return "Chưa có hạn";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(`${date}T00:00:00`));
}

export function PlannerBoard({ initialTasks, plans }: { initialTasks: PlannerTask[]; plans: PlannerPlan[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [planId, setPlanId] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [busyTask, setBusyTask] = useState<string>();
  const [error, setError] = useState("");

  const filtered = useMemo(() => tasks.filter((task) =>
    (planId === "all" || task.planId === planId) && task.title.toLowerCase().includes(query.toLowerCase())
  ), [tasks, query, planId]);
  const overdue = tasks.filter((task) => task.percentComplete < 100 && task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date()).length;

  async function advance(task: PlannerTask) {
    const next = task.percentComplete === 0 ? 50 : task.percentComplete === 50 ? 100 : 0;
    setBusyTask(task.id);
    setError("");
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, percentComplete: next } : item));
    const response = await fetch(`/api/planner/tasks/${encodeURIComponent(task.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percentComplete: next, etag: task.etag }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Không thể cập nhật công việc" }));
      setTasks((current) => current.map((item) => item.id === task.id ? task : item));
      setError(payload.error);
    } else {
      const updated = await response.json().catch(() => null) as { "@odata.etag"?: string } | null;
      if (updated?.["@odata.etag"]) setTasks((current) => current.map((item) => item.id === task.id ? { ...item, etag: updated["@odata.etag"]! } : item));
    }
    setBusyTask(undefined);
  }

  return (
    <>
      <section className="planner-summary">
        <div><span className="planner-metric-icon blue"><Icons.ListChecks size={22} /></span><span><strong>{tasks.length}</strong><small>Tổng công việc</small></span></div>
        <div><span className="planner-metric-icon amber"><Icons.CircleDot size={22} /></span><span><strong>{tasks.filter((task) => task.percentComplete === 50).length}</strong><small>Đang thực hiện</small></span></div>
        <div><span className="planner-metric-icon coral"><Icons.Flag size={22} /></span><span><strong>{overdue}</strong><small>Đã quá hạn</small></span></div>
        <div><span className="planner-metric-icon green"><Icons.CircleCheck size={22} /></span><span><strong>{tasks.filter((task) => task.percentComplete === 100).length}</strong><small>Đã hoàn thành</small></span></div>
      </section>

      <section className="planner-workspace">
        <div className="planner-toolbar">
          <div><span>Microsoft Planner</span><h2>Công việc của tôi</h2></div>
          <label className="planner-search"><Icons.Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm công việc..." /></label>
          <select value={planId} onChange={(event) => setPlanId(event.target.value)}><option value="all">Tất cả dự án</option>{plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.title}</option>)}</select>
          <button className="button button-primary" onClick={() => setShowCreate(true)}><Icons.Plus size={18} /> Tạo công việc</button>
        </div>
        {error && <div className="planner-error"><Icons.CircleDashed size={17} />{error}<button onClick={() => setError("")}><Icons.X size={15} /></button></div>}
        <div className="planner-board">
          {columns.map(({ value, title, icon: Icon }) => {
            const items = filtered.filter((task) => task.percentComplete === value);
            return <div className="planner-column" key={value}>
              <header><span><Icon size={18} />{title}</span><b>{items.length}</b></header>
              <div className="planner-cards">{items.map((task) => {
                const priority = priorityLabel(task.priority);
                const isOverdue = task.percentComplete < 100 && task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date();
                return <article className="task-card" key={task.id}>
                  <div className="task-card-top"><span className={`task-priority ${priority.className}`}><i />{priority.label}</span><button><Icons.MoreHorizontal size={18} /></button></div>
                  <h3>{task.title}</h3>
                  <span className="task-plan">{task.planTitle}</span>
                  <div className="task-meta"><span className={isOverdue ? "overdue" : ""}><Icons.CalendarDays size={14} />{formatDate(task.dueDate)}</span><span>{task.bucketTitle}</span></div>
                  <footer><span className="avatar tiny">{task.assignee === "Bạn" ? "B" : task.assignee.split(" ").slice(-2).map((word) => word[0]).join("")}</span><button disabled={busyTask === task.id} onClick={() => advance(task)} title="Chuyển sang trạng thái tiếp theo">{value === 100 ? <Icons.CircleCheck size={21} /> : value === 50 ? <Icons.CircleDot size={21} /> : <Icons.CircleDashed size={21} />}<span>{value === 100 ? "Hoàn tất" : value === 50 ? "Đang làm" : "Bắt đầu"}</span></button></footer>
                </article>;
              })}{!items.length && <div className="planner-empty"><span>Không có công việc</span></div>}</div>
            </div>;
          })}
        </div>
      </section>
      {showCreate && <CreateTaskDialog plans={plans} onClose={() => setShowCreate(false)} onCreated={(task) => { setTasks((current) => [task, ...current]); setShowCreate(false); }} />}
    </>
  );
}

function CreateTaskDialog({ plans, onClose, onCreated }: { plans: PlannerPlan[]; onClose: () => void; onCreated: (task: PlannerTask) => void }) {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const plan = plans.find((item) => item.id === selectedPlan);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = { title: String(form.get("title") ?? ""), planId: selectedPlan, bucketId: String(form.get("bucketId") ?? ""), dueDate: String(form.get("dueDate") ?? ""), priority: Number(form.get("priority") ?? 5) };
    const response = await fetch("/api/planner/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Không thể tạo công việc"); setSaving(false); return; }
    const bucket = plan?.buckets.find((item) => item.id === payload.bucketId);
    onCreated({ id: result.id, title: payload.title, planId: payload.planId, planTitle: plan?.title ?? "Planner", bucketId: payload.bucketId, bucketTitle: bucket?.name ?? "Chưa phân nhóm", percentComplete: 0, priority: payload.priority, dueDate: payload.dueDate || undefined, assignee: "Bạn", etag: result["@odata.etag"] ?? "demo-new-task" });
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="task-dialog" onSubmit={submit}><header><div><span>Tạo trên Microsoft Planner</span><h2>Công việc mới</h2></div><button type="button" onClick={onClose}><Icons.X size={20} /></button></header><label>Tiêu đề<input name="title" required maxLength={255} autoFocus placeholder="Nhập tên công việc" /></label><div className="form-row"><label>Dự án<select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)} required>{plans.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label>Nhóm công việc<select name="bucketId"><option value="">Chưa phân nhóm</option>{plan?.buckets.map((bucket) => <option value={bucket.id} key={bucket.id}>{bucket.name}</option>)}</select></label></div><div className="form-row"><label>Hạn hoàn thành<input name="dueDate" type="date" /></label><label>Mức ưu tiên<select name="priority" defaultValue="5"><option value="1">Khẩn cấp</option><option value="3">Quan trọng</option><option value="5">Trung bình</option><option value="9">Thấp</option></select></label></div>{error && <p className="dialog-error">{error}</p>}<footer><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button disabled={saving || !plans.length} className="button button-primary">{saving ? "Đang tạo..." : "Tạo công việc"}</button></footer></form></div>;
}
