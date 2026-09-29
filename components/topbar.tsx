"use client";

import { useState } from "react";
import { Icons } from "./icons";

export function Topbar({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <header className="topbar">
      <div className="page-heading">{eyebrow && <span>{eyebrow}</span>}<h1>{title}</h1></div>
      <div className="topbar-actions">
        <label className={`global-search ${focused ? "focused" : ""}`}>
          <Icons.Search size={18} />
          <input placeholder="Tìm tài liệu, con người, nội dung..." onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button" aria-label="Thông báo"><Icons.Bell size={20} /><i /></button>
        <button className="icon-button" aria-label="Cài đặt"><Icons.Settings size={20} /></button>
      </div>
    </header>
  );
}
