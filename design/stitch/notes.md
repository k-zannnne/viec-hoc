# Ghi chú thiết kế "Việc học của tôi"
## 1. Thông tin chung
- **Tên ứng dụng:** Việc học của tôi
- **Ngôn ngữ:** Tiếng Việt
- **Phong cách:** Bố cục đơn giản, nền sáng, chữ dễ đọc, đáp ứng tốt trên Desktop và Mobile (390px).

## 2. Yêu cầu giao diện & Thành phần
### Trang Đăng nhập (/login)
- Ô nhập Email
- Ô nhập Mật khẩu
- Nút "Đăng nhập"
- Liên kết mẫu "Xem giao diện công việc" chuyển đến `/tasks`

### Trang Quản lý Công việc (/tasks)
- Ô nhập "Tên công việc" + Nút "Thêm công việc"
- Bộ lọc danh sách: **Tất cả**, **Chưa xong**, **Đã xong**
- Danh sách công việc với:
  - Checkbox đánh dấu hoàn thành
  - Nút **Sửa**, **Xóa**
- Trạng thái đặc biệt: **Danh sách rỗng**, **Đang tải (Loading)**, **Báo lỗi (Error)**
- Nút **Đăng xuất**

## 3. Quy chuẩn Font & Màu sắc
- **Font chữ:** Inter, system-ui, sans-serif
- **Màu sắc chính:** Nền sáng (Gray-50/White), Màu chủ đạo xanh lam (Indigo/Blue-600), Chữ xám đậm (Gray-900)
- **Giới hạn:** Không tích hợp thanh toán, biểu đồ hay trang quản trị.' -Encoding UTF8
