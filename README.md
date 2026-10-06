# Việc Học Của Tôi - Task Management App

Ứng dụng web quản lý công việc học tập cá nhân (Fullstack TodoApp) được xây dựng bằng **Next.js (App Router)**, **Supabase Auth & Database**, **Tailwind CSS** và **Zod**.

---

## Thông Tin & Triển Khai

* **URL Vercel (Production):** [https://viec-hoc-nine.vercel.app](https://viec-hoc-nine.vercel.app)
* **GitHub Repository:** [https://github.com/k-zannnne/viec-hoc](https://github.com/k-zannnne/viec-hoc)
* **Tài khoản thử nghiệm sẵn (Test Accounts):**
  * **User A:** `usera@gmail.com` | Mật khẩu: `123456`
  * **User B:** `userb@gmail.com` | Mật khẩu: `123456`

---

## Yêu Cầu Tiền Đề (Prerequisites)

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
* **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên ([Tải tại đây](https://nodejs.org/))
* **Git**: Dùng để clone repository ([Tải tại đây](https://git-scm.com/))
* **Tài khoản Supabase**: Để khởi tạo Database và Auth ([Trang chủ Supabase](https://supabase.com/))

---

## Hướng Dẫn Tạo Database & Cấu Hình Supabase

Nếu bạn muốn tự thiết lập Cơ sở dữ liệu riêng trên dự án Supabase mới, hãy làm theo các bước sau:

1. **Tạo dự án mới trên Supabase:**
   * Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard).
   * Bấm **New Project**, nhập tên dự án và mật khẩu Database, chọn khu vực gần nhất (ví dụ: Singapore) và bấm **Create new project**.

2. **Khởi tạo Bảng & Bật chính sách Bảo mật RLS:**
   * Mở mục **SQL Editor** ở thanh menu bên trái của Supabase Dashboard.
   * Tạo một truy vấn mới (New Query), dán toàn bộ đoạn mã SQL dưới đây và bấm **Run**:

```sql
-- 1. Tạo bảng tasks lưu trữ công việc học tập
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  is_done boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bật tính năng Row Level Security (RLS) để cách ly dữ liệu
alter table public.tasks enable row level security;

-- 3. Tạo chính sách bảo mật cho phép người dùng quản lý đúng dữ liệu của chính họ
create policy "Users can manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
