"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "./icons";

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  async function upload(file?: File) {
    if (!file) return;
    if (demo) {
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
      return;
    }
    setState("uploading");
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/documents", { method: "POST", body: form });
    if (!response.ok) {
      setState("error");
      return;
    }
    setState("done");
    router.refresh();
    window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <>
      <input ref={inputRef} className="sr-only" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(event) => upload(event.target.files?.[0])} />
      <button className="button button-primary" disabled={state === "uploading"} onClick={() => inputRef.current?.click()}>
        <Icons.Upload size={18} /> {state === "uploading" ? "Đang tải..." : state === "done" ? (demo ? "Demo: đã nhận tệp" : "Đã tải lên") : state === "error" ? "Tải lên thất bại" : "Tải tài liệu lên"}
      </button>
    </>
  );
}
