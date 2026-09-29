"use client";

import { useMemo, useState } from "react";
import type { DocumentItem } from "@/lib/demo-data";
import { FileIcon } from "./file-icon";
import { Icons } from "./icons";

export function DocumentTable({ items }: { items: DocumentItem[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("Tất cả phòng ban");
  const filtered = useMemo(() => items.filter((item) =>
    (department === "Tất cả phòng ban" || item.department === department) &&
    `${item.name} ${item.category} ${item.modifiedBy}`.toLowerCase().includes(query.toLowerCase())
  ), [items, query, department]);
  const departments = [...new Set(items.map((item) => item.department))];

  return (
    <>
      <div className="document-toolbar">
        <label className="table-search"><Icons.Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm trong kho tài liệu" />{query && <button onClick={() => setQuery("")}><Icons.X size={16} /></button>}</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}><option>Tất cả phòng ban</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
        <select><option>Tất cả loại tài liệu</option><option>SOP</option><option>Chính sách</option><option>Biểu mẫu</option><option>Báo cáo</option></select>
        <button className="view-button"><Icons.LayoutGrid size={18} /></button>
      </div>
      <div className="table-wrap">
        <table className="document-table">
          <thead><tr><th>Tên tài liệu</th><th>Phòng ban</th><th>Trạng thái</th><th>Phiên bản</th><th>Cập nhật</th><th /></tr></thead>
          <tbody>{filtered.map((item) => (
            <tr key={item.id}>
              <td>{item.webUrl ? <a className="document-name" href={item.webUrl} target="_blank" rel="noreferrer"><FileIcon type={item.type} /><span><strong>{item.name}</strong><small>{item.category} · {item.size}</small></span></a> : <div className="document-name"><FileIcon type={item.type} /><span><strong>{item.name}</strong><small>{item.category} · {item.size}</small></span></div>}</td>
              <td><span className="department-cell">{item.department}</span></td>
              <td><span className={`status ${item.status === "Đã ban hành" ? "published" : item.status === "Chờ duyệt" ? "pending" : "draft"}`}><i />{item.status}</span></td>
              <td><span className="version">v{item.version}</span></td>
              <td><span className="modified"><strong>{item.modifiedAt}</strong><small>{item.modifiedBy}</small></span></td>
              <td><button className="row-menu"><Icons.MoreHorizontal size={20} /></button></td>
            </tr>
          ))}</tbody>
        </table>
        {!filtered.length && <div className="empty-state"><Icons.Search size={30} /><strong>Không tìm thấy tài liệu</strong><span>Hãy thử một từ khóa hoặc bộ lọc khác.</span></div>}
      </div>
    </>
  );
}
