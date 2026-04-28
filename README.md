# 🦷 Hệ Thống Quản Lý Nha Khoa Mec (Mec Dental Management System)

[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)

Hệ thống quản lý nha khoa toàn diện với giao diện Landing Page cao cấp, được thiết kế theo triết lý **"Medical Sanctuary"** (Thánh đường Y khoa). Dự án không chỉ tập trung vào trải nghiệm người dùng mà còn được xây dựng làm nền tảng cho việc nghiên cứu **Kiểm thử Phần mềm và Đảm bảo Chất lượng (QA)**.

---

## ✨ Các Tính Năng Chính

### 1. Landing Page Cao Cấp (Trải nghiệm Bệnh nhân)
- **Giao diện Hero:** Ấn tượng với hiệu ứng kính mờ (Glassmorphism), icon 3D bay bổng và tiêu đề thu hút.
- **Dịch vụ Chuyên sâu:** Trình bày danh mục dịch vụ (Implant, Chỉnh nha, Răng sứ...) dưới dạng lưới tương tác.
- **Đội ngũ Bác sĩ:** Thẻ thông tin bác sĩ chuyên nghiệp, hiển thị chuyên môn và vai trò rõ ràng.
- **Không gian Phòng khám:** Thư viện ảnh (Gallery) phong cách Bento-grid hiện đại, giới thiệu cơ sở vật chất chuẩn 5 sao.
- **Đặt lịch hẹn thông minh:** Form đăng ký tư vấn tối ưu hóa trải nghiệm, hỗ trợ bệnh nhân đặt lịch nhanh chóng.

### 2. Hệ Thống Quản Lý (Nghiệp vụ Nha khoa)
- **Quản lý Bệnh nhân:** Lưu trữ hồ sơ, lịch sử điều trị và thông tin liên lạc.
- **Quản lý Lịch hẹn:** Sắp xếp và theo dõi trạng thái lịch khám thời gian thực.
- **Xác thực Bảo mật:** Hệ thống đăng nhập an toàn sử dụng JWT (JSON Web Token) và mã hóa mật khẩu Bcrypt.
- **Tối ưu QA:** Cấu trúc mã nguồn rõ ràng, dễ dàng triển khai các kịch bản kiểm thử (Unit Test, Integration Test).

---

## 🎨 Triết Lý Thiết Kế: "Medical Sanctuary"
Ứng dụng sử dụng **Tailwind CSS v4** với hệ thống Design Tokens tùy chỉnh:
- **Màu sắc:** Sự kết hợp giữa sắc xanh Primary chuyên sâu (`#003b9a`) tạo sự tin tưởng và các tone màu nền sáng mịn tạo cảm giác an tâm.
- **Hiệu ứng:** Sử dụng tối đa Backdrop Blur (làm mờ nền) và Shadow (đổ bóng) đa lớp để tạo chiều sâu.
- **Typography:** Phông chữ **Manrope** hiện đại, mang lại cảm giác sạch sẽ và chuyên nghiệp.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Material Symbols |
| **Backend** | Node.js, Express.js |
| **Bảo mật** | JWT, Bcrypt.js, CORS |

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu cầu hệ thống
- Node.js (Phiên bản 18 trở lên)
- Trình duyệt hiện đại (Chrome, Edge, Brave...)

### 1. Thiết lập Backend (Máy chủ)
```bash
cd backend
npm install
```
Tạo tệp `.env` trong thư mục `backend` và cấu hình:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dental_db
JWT_SECRET=your_secret_key
```
Chạy máy chủ:
```bash
npm run dev
```

### 2. Thiết lập Frontend (Giao diện)
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

---

## 📂 Cấu Trúc Thư Mục
```text
.
├── backend/            # Mã nguồn phía máy chủ (API)
│   ├── src/            # Logic nghiệp vụ, Models, Routes
│   └── package.json    # Thư viện và Scripts
├── frontend/           # Mã nguồn giao diện người dùng
│   ├── src/
│   │   ├── assets/     # Tài nguyên hình ảnh, biểu tượng
│   │   ├── components/ # Các thành phần UI tái sử dụng
│   │   └── index.css   # Cấu hình Tailwind v4 & Design Tokens
│   └── package.json
└── README.md           # Tài liệu hướng dẫn dự án
```

---

## 📄 Bản quyền
Dự án được phát hành dưới giấy phép MIT. Xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.

---
*Phát triển bởi ❤️ dành cho sự hoàn mỹ của nụ cười.*
