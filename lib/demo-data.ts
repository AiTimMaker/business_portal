export type DocumentItem = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "pptx";
  department: string;
  category: string;
  status: "Đã ban hành" | "Chờ duyệt" | "Bản nháp";
  version: string;
  modifiedAt: string;
  modifiedBy: string;
  size: string;
  featured?: boolean;
  webUrl?: string;
};

export const departments = [
  { name: "Nhân sự", short: "NS", color: "coral", documents: 86 },
  { name: "Kinh doanh", short: "KD", color: "blue", documents: 124 },
  { name: "Marketing", short: "MKT", color: "purple", documents: 73 },
  { name: "Kỹ thuật", short: "KT", color: "green", documents: 218 },
  { name: "Đào tạo", short: "ĐT", color: "amber", documents: 165 },
  { name: "Tài chính", short: "TC", color: "pink", documents: 92 },
];

export const documents: DocumentItem[] = [
  { id: "doc-001", name: "Quy trình tiếp nhận nhân viên mới", type: "pdf", department: "Nhân sự", category: "SOP", status: "Đã ban hành", version: "3.2", modifiedAt: "Hôm nay, 09:42", modifiedBy: "Nguyễn Minh Anh", size: "2.4 MB", featured: true },
  { id: "doc-002", name: "Bộ nhận diện thương hiệu Viet Robot 2026", type: "pptx", department: "Marketing", category: "Hướng dẫn", status: "Đã ban hành", version: "2.0", modifiedAt: "Hôm qua, 16:20", modifiedBy: "Trần Hoài Nam", size: "18.7 MB", featured: true },
  { id: "doc-003", name: "Quy chuẩn lắp ráp Robot VEX", type: "docx", department: "Kỹ thuật", category: "SOP", status: "Đã ban hành", version: "5.1", modifiedAt: "26/09/2026", modifiedBy: "Lê Thanh Tùng", size: "6.1 MB", featured: true },
  { id: "doc-004", name: "Kế hoạch đào tạo giáo viên Q4", type: "xlsx", department: "Đào tạo", category: "Kế hoạch", status: "Chờ duyệt", version: "1.4", modifiedAt: "25/09/2026", modifiedBy: "Phạm Mỹ Linh", size: "842 KB" },
  { id: "doc-005", name: "Chính sách công tác phí", type: "pdf", department: "Tài chính", category: "Chính sách", status: "Đã ban hành", version: "2.3", modifiedAt: "23/09/2026", modifiedBy: "Vũ Ngọc Hà", size: "1.2 MB" },
  { id: "doc-006", name: "Quy trình bàn giao cơ hội kinh doanh", type: "docx", department: "Kinh doanh", category: "SOP", status: "Bản nháp", version: "0.8", modifiedAt: "22/09/2026", modifiedBy: "Đỗ Quốc Bảo", size: "956 KB" },
  { id: "doc-007", name: "Mẫu đánh giá thử việc", type: "docx", department: "Nhân sự", category: "Biểu mẫu", status: "Đã ban hành", version: "1.1", modifiedAt: "19/09/2026", modifiedBy: "Nguyễn Minh Anh", size: "420 KB" },
  { id: "doc-008", name: "Báo cáo doanh số tháng 8", type: "xlsx", department: "Kinh doanh", category: "Báo cáo", status: "Đã ban hành", version: "1.0", modifiedAt: "05/09/2026", modifiedBy: "Đỗ Quốc Bảo", size: "3.8 MB" },
];

export const announcements = [
  { tag: "Toàn công ty", date: "28.09", title: "Khởi động chương trình sáng kiến Viet Robot 2026", excerpt: "Chia sẻ ý tưởng giúp công việc hiệu quả hơn và cùng xây dựng môi trường đổi mới mỗi ngày.", color: "blue" },
  { tag: "Nhân sự", date: "26.09", title: "Cập nhật chính sách nghỉ phép từ tháng 10", excerpt: "Một số thay đổi quan trọng về quy trình đăng ký và phê duyệt nghỉ phép.", color: "coral" },
  { tag: "Đào tạo", date: "24.09", title: "Lịch workshop Robotics nâng cao", excerpt: "Chuỗi workshop nội bộ dành cho đội ngũ kỹ thuật và giáo viên trong tháng 10.", color: "green" },
];

export const quickLinks = [
  { title: "Kho tài liệu", description: "Tìm SOP, biểu mẫu và tài liệu", href: "/documents", icon: "folder" },
  { title: "Công việc", description: "Planner và tiến độ dự án", href: "/planner", icon: "tasks" },
  { title: "Hồ sơ của tôi", description: "Lương, công, KPI và quá trình công tác", href: "/my-hr", icon: "users" },
  { title: "Chấm công", description: "Lịch ca và bảng công cá nhân", href: "/shifts", icon: "clock" },
];

export type PlannerTask = {
  id: string;
  title: string;
  planId: string;
  planTitle: string;
  bucketId?: string;
  bucketTitle: string;
  percentComplete: 0 | 50 | 100;
  priority: number;
  dueDate?: string;
  startDate?: string;
  assignee: string;
  etag: string;
  webUrl?: string;
};

export type PlannerPlan = {
  id: string;
  title: string;
  buckets: { id: string; name: string }[];
};

export const plannerPlans: PlannerPlan[] = [
  { id: "plan-robotics-2026", title: "Giải Robotics 2026", buckets: [{ id: "b1", name: "Chuẩn bị" }, { id: "b2", name: "Đang triển khai" }, { id: "b3", name: "Kiểm tra" }] },
  { id: "plan-portal", title: "Cổng thông tin nội bộ", buckets: [{ id: "b4", name: "Backlog" }, { id: "b5", name: "Đang làm" }, { id: "b6", name: "Nghiệm thu" }] },
  { id: "plan-training", title: "Đào tạo Q4/2026", buckets: [{ id: "b7", name: "Nội dung" }, { id: "b8", name: "Tổ chức" }] },
];

export const plannerTasks: PlannerTask[] = [
  { id: "task-01", title: "Hoàn thiện bộ tiêu chí chấm thi Robotics", planId: "plan-robotics-2026", planTitle: "Giải Robotics 2026", bucketId: "b2", bucketTitle: "Đang triển khai", percentComplete: 50, priority: 1, dueDate: "2026-09-30", startDate: "2026-09-22", assignee: "Tim Nguyễn", etag: "demo-01" },
  { id: "task-02", title: "Rà soát phân quyền kho tài liệu", planId: "plan-portal", planTitle: "Cổng thông tin nội bộ", bucketId: "b5", bucketTitle: "Đang làm", percentComplete: 50, priority: 3, dueDate: "2026-10-02", startDate: "2026-09-26", assignee: "Tim Nguyễn", etag: "demo-02" },
  { id: "task-03", title: "Chuẩn bị tài liệu workshop VEX nâng cao", planId: "plan-training", planTitle: "Đào tạo Q4/2026", bucketId: "b7", bucketTitle: "Nội dung", percentComplete: 0, priority: 5, dueDate: "2026-10-08", assignee: "Tim Nguyễn", etag: "demo-03" },
  { id: "task-04", title: "Xác nhận danh sách địa điểm thi", planId: "plan-robotics-2026", planTitle: "Giải Robotics 2026", bucketId: "b3", bucketTitle: "Kiểm tra", percentComplete: 0, priority: 3, dueDate: "2026-09-27", assignee: "Tim Nguyễn", etag: "demo-04" },
  { id: "task-05", title: "Thiết kế trang tổng quan portal", planId: "plan-portal", planTitle: "Cổng thông tin nội bộ", bucketId: "b6", bucketTitle: "Nghiệm thu", percentComplete: 100, priority: 5, dueDate: "2026-09-25", assignee: "Tim Nguyễn", etag: "demo-05" },
  { id: "task-06", title: "Gửi lịch đào tạo tới các chi nhánh", planId: "plan-training", planTitle: "Đào tạo Q4/2026", bucketId: "b8", bucketTitle: "Tổ chức", percentComplete: 100, priority: 9, dueDate: "2026-09-24", assignee: "Tim Nguyễn", etag: "demo-06" },
];
