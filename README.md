# Viet Robot Internal Portal

MVP web app cho cổng thông tin và kho tài liệu nội bộ Viet Robot. Ứng dụng dùng Next.js, Microsoft Entra ID và Microsoft Graph; tệp thật được lưu trong thư viện SharePoint thay vì lưu trên web server.

## Chạy chế độ demo

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở `http://localhost:3000`. Với `DEMO_MODE=true`, ứng dụng sử dụng dữ liệu mẫu và không yêu cầu Microsoft 365.

## Kết nối Microsoft 365

1. Tạo App Registration trong Microsoft Entra admin center.
2. Thêm redirect URI loại Web: `http://localhost:3000/api/auth/callback/azure-ad` và URL production tương ứng.
3. Cấp delegated permissions: `User.Read`, `Files.ReadWrite.All`, `Sites.Read.All`, `Tasks.ReadWrite`, `Group.Read.All`, `Schedule.ReadWrite.All`, `Team.ReadBasic.All`, `offline_access`, rồi thực hiện admin consent nếu chính sách tenant yêu cầu.
4. Tạo/chọn document library trên SharePoint và lấy Drive ID qua Microsoft Graph.
5. Sao chép `.env.example` thành `.env.local`, đặt `DEMO_MODE=false` và điền các biến Entra/SharePoint.
6. Tạo `NEXTAUTH_SECRET` bằng một giá trị ngẫu nhiên dài, không commit file `.env.local`.

## Chức năng hiện có

- Portal responsive với thông báo, lối tắt, phòng ban và tài liệu gần đây.
- Đăng nhập Microsoft 365 qua Entra ID, tự làm mới access token.
- Kho tài liệu: tìm kiếm, lọc phòng ban/loại, trạng thái và phiên bản.
- Đọc danh sách tệp từ SharePoint Document Library qua Microsoft Graph.
- Mở tệp trực tiếp trong SharePoint/Office web.
- Tải lên PDF/Word/Excel/PowerPoint tối đa 20 MB.
- Trang SOP và danh mục phòng ban.
- Bảng công việc Planner theo ba trạng thái, tìm kiếm và lọc dự án.
- Tạo task mới trên Microsoft Planner và tự giao cho người đang đăng nhập.
- Cập nhật tiến độ Planner an toàn bằng ETag để tránh ghi đè dữ liệu mới hơn.
- Trang Teams Shifts với ca hôm nay, lịch tuần và bảng công cá nhân.
- Vào ca/kết thúc ca trực tiếp từ portal và đồng bộ Microsoft Shifts timeCard.
- Theo dõi giờ công, thời gian nghỉ, vị trí chấm công và trạng thái xác nhận.
- Dashboard HR, bộ lọc và hồ sơ chi tiết của nhân viên.
- Thêm/chỉnh sửa thông tin nhân viên, phòng ban, chức danh, quản lý và hợp đồng.
- Phân quyền HR/Admin bằng biến `HR_ADMIN_EMAILS`; không xóa cứng hồ sơ đã nghỉ việc.
- Cổng tự phục vụ “Hồ sơ của tôi” cho từng tài khoản đăng nhập.
- Thông tin cá nhân, quá trình công tác, số dư nghỉ phép và hợp đồng.
- Bảng công đồng bộ Teams Shifts, phiếu lương riêng tư và KPI cá nhân.
- Trang quản lý tài sản/CCDC với tổng quan số lượng, giá trị, trạng thái và danh mục.
- Thêm/chỉnh sửa hồ sơ tài sản, thông tin mua sắm, bảo hành, vị trí và tình trạng sử dụng.
- Bàn giao/thu hồi tài sản theo nhân viên và lưu lịch sử luân chuyển; không xóa cứng tài sản đã thanh lý.
- Chuyển giao tài sản trực tiếp giữa hai nhân viên và tự động lập biên bản giao nhận có thể in.
- Lập đợt kiểm kê theo địa điểm/danh mục, chọn tài sản trong phạm vi, tích kiểm nhanh hoặc ghi nhận chênh lệch.
- Nhập hiện trạng hàng loạt từ Excel `.xlsx`/CSV, xuất danh sách và in biên bản kiểm kê riêng cho từng đợt.
- Mạng xã hội nội bộ “Cộng đồng Viet Robot”: bảng tin, cộng đồng, bài viết, thông báo, câu hỏi, khen thưởng, lượt thích và bình luận.
- Chế độ production dùng Viva Engage Embed chính thức; danh sách cộng đồng được đọc từ Microsoft Graph với quyền `Community.Read.All`.
- Phân quyền quản lý tài sản bằng biến `ASSET_ADMIN_EMAILS` (đồng thời chấp nhận tài khoản trong `HR_ADMIN_EMAILS`).

## Lưu ý về dữ liệu HR

Môi trường test lưu dữ liệu mẫu tại `data/hr-employees.json` để thao tác có thể được giữ lại sau khi tải lại trang. Trước khi đưa vào production, cần chuyển dữ liệu HR sang PostgreSQL, SQL Server hoặc Dataverse, mã hóa dữ liệu nhạy cảm, bổ sung audit log và chính sách sao lưu. Không dùng file JSON để lưu dữ liệu nhân sự thật.

## Lưu ý về dữ liệu tài sản

Môi trường test lưu dữ liệu tài sản tại `data/assets.json` và các đợt kiểm kê tại `data/inventory-sessions.json`. Đây chỉ là kho dữ liệu phát triển; trước khi đưa vào production cần chuyển sang PostgreSQL, SQL Server hoặc Dataverse, bổ sung audit log, quy trình duyệt chênh lệch kiểm kê/bảo trì và phân quyền theo đơn vị. Nút in tem QR hiện là giao diện chuẩn bị cho bước tích hợp tạo mã và máy in tem.

## Kết nối Viva Engage

Môi trường demo lưu bài viết tại `data/engage.json`. Khi chuyển sang production, cấp delegated permission `Community.Read.All` và admin consent cho App Registration, tạo iframe tại Viva Engage Embed widget, rồi đặt URL `src` vào `VIVA_ENGAGE_EMBED_URL`. Portal sẽ dùng iframe chính thức của Microsoft cho bảng tin và Microsoft Graph để đọc danh sách cộng đồng.

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run build
```

## Trước khi đưa vào production

- Tạo app registration riêng cho Dev/Test/Production.
- Dùng HTTPS và secret manager của nền tảng triển khai.
- Giảm Graph permissions theo thiết kế thư viện và nhóm bảo mật thực tế.
- Thay người dùng demo trong sidebar bằng thông tin session.
- Áp dụng metadata/content type, quy trình duyệt và retention trên SharePoint.
- Bổ sung antivirus/DLP, giới hạn tải lên và nhật ký nghiệp vụ theo chính sách Viet Robot.
