import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./planner.css";
import "./shifts.css";
import "./hr.css";
import "./my-hr.css";
import "./assets.css";
import "./engage.css";

export const metadata: Metadata = {
  title: "Viet Robot — Cổng thông tin nội bộ",
  description: "Cổng thông tin và kho tài liệu nội bộ Viet Robot",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
