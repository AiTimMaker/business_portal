"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return <div className="login-page"><div className="login-panel"><Logo /><div className="login-copy"><span>CỔNG THÔNG TIN NỘI BỘ</span><h1>Nơi tri thức<br />tạo nên sức mạnh.</h1><p>Truy cập tài liệu, quy trình và mọi thông tin bạn cần để cùng Viet Robot tiến về phía trước.</p></div><small>© 2026 Viet Robot. Internal use only.</small></div><div className="login-form-wrap"><div className="login-form"><span className="login-badge">VR</span><h2>Chào mừng trở lại</h2><p>Đăng nhập bằng tài khoản Microsoft 365 được Viet Robot cấp.</p><button onClick={() => signIn("azure-ad", { callbackUrl: "/" })} className="microsoft-button"><i><b /><b /><b /><b /></i>Đăng nhập với Microsoft</button>{process.env.NEXT_PUBLIC_DEMO_MODE === "true" && <Link className="demo-link" href="/">Tiếp tục với chế độ demo →</Link>}<small>Bằng việc đăng nhập, bạn đồng ý với chính sách sử dụng hệ thống nội bộ của Viet Robot.</small></div></div></div>;
}
