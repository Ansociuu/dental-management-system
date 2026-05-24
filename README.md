# Mec Dental Management System

[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)

Mec là hệ thống quản lý phòng khám nha khoa gồm landing page cho bệnh nhân và các phân hệ nội bộ cho quản trị viên, lễ tân và bác sĩ. Dự án sử dụng React, Vite, Tailwind CSS, Node.js, Express và MongoDB.

## Tính Năng Chính

### Landing Page
- Giới thiệu phòng khám, đội ngũ bác sĩ, dịch vụ nha khoa và không gian phòng khám.
- Giao diện responsive, sử dụng Tailwind CSS v4 và Material Symbols.
- Hỗ trợ luồng đặt lịch/tư vấn từ phía bệnh nhân.

### Phân Hệ Quản Trị
- Dashboard tổng quan: bệnh nhân, lịch hẹn hôm nay, doanh thu, hàng đợi khám.
- Quản lý nhân viên, bác sĩ, bệnh nhân, dịch vụ, phân quyền và cấu hình hệ thống.
- Quản lý ca làm việc, ngày nghỉ và lịch trực bác sĩ.
- Theo dõi lịch hẹn và báo cáo nghiệp vụ.
- Gọi lại sau khám cho các lịch đã hoàn thành từ ngày hôm trước.

### Phân Hệ Lễ Tân
- Module riêng tại `/receptionist`, không dùng chung quyền quản trị.
- Đặt lịch, theo dõi lịch khám, check-in, hủy lịch và đánh dấu bệnh nhân không đến.
- Xem lịch trực bác sĩ ở chế độ chỉ đọc; lễ tân không đăng ký hoặc hủy lịch trực.
- Quản lý bệnh nhân cơ bản.
- Gọi lại sau khám:
  - `PENDING`: chờ gọi.
  - `CALLED`: đã gọi thành công.
  - `UNREACHABLE`: không nghe máy, có thể gọi lại sau.
  - Có ghi chú tình trạng, thời điểm gọi và người thực hiện.

### Phân Hệ Bác Sĩ
- Xem danh sách lịch khám trong ngày.
- Tiếp nhận ca đã check-in và cập nhật hồ sơ khám.
- Lưu chẩn đoán, ghi chú lâm sàng, dịch vụ thực hiện, đơn thuốc, ảnh răng và sơ đồ răng.
- Hoàn tất ca khám bằng trạng thái `COMPLETED`.

## Luồng Trạng Thái Lịch Khám

Trạng thái lịch khám chính:

```text
PENDING -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED
PENDING/CONFIRMED/CHECKED_IN -> CANCELLED
PENDING/CONFIRMED -> NO_SHOW
```

Gọi lại sau khám không dùng `appointment.status`. Hệ thống giữ lịch ở `COMPLETED` và lưu trạng thái hậu khám bằng `followUpStatus`:

```text
PENDING -> CALLED
PENDING -> UNREACHABLE
UNREACHABLE -> CALLED
```

## Công Nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Bảo mật | JWT, Bcrypt.js, CORS |

## Cài Đặt

### Yêu Cầu
- Node.js 18 trở lên.
- MongoDB Atlas hoặc MongoDB local.
- npm.

### Backend

```bash
cd backend
npm install
```

Tạo file `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

Chạy backend:

```bash
npm run dev
```

Nạp dữ liệu mẫu:

```bash
npm run seed
```

Tài khoản mẫu sau khi seed:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@mec.vn` | `123456` |
| Lễ tân | `lan.nguyen@mec.vn` | `123456` |
| Bác sĩ | `minh.nguyen@mec.vn` | `123456` |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Truy cập ứng dụng tại:

```text
http://localhost:5173
```

Backend mặc định chạy tại:

```text
http://localhost:5000/api/v1
```

## API Chính

### Xác Thực
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

### Lịch Hẹn
- `POST /api/v1/appointments`
- `GET /api/v1/appointments`
- `GET /api/v1/appointments/monitor`
- `PATCH /api/v1/appointments/:id/status`
- `GET /api/v1/appointments/doctor-today`
- `PUT /api/v1/appointments/:id/examine`

### Gọi Lại Sau Khám
- `GET /api/v1/appointments/follow-ups?date=YYYY-MM-DD&status=PENDING`
- `PATCH /api/v1/appointments/:id/follow-up`

Chỉ `ADMIN` và `RECEPTIONIST` được cập nhật gọi lại sau khám.

### Dữ Liệu Danh Mục
- `GET /api/v1/patients`
- `GET /api/v1/services`
- `GET /api/v1/shifts`
- `GET /api/v1/duty-schedules`

## Cấu Trúc Thư Mục

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Kiểm Tra Nhanh

Build frontend:

```bash
cd frontend
npm run build
```

Kiểm tra backend load được module chính:

```bash
cd backend
node -e "require('./src/models/Appointment'); require('./src/controllers/appointmentController'); require('./src/routes/appointmentRoutes'); console.log('backend modules ok')"
```

## Ghi Chú Triển Khai

- Lễ tân không có lịch trực riêng trong hệ thống hiện tại; `DutySchedule` chỉ dùng cho lịch trực bác sĩ.
- Danh sách gọi lại ngày hôm nay được tính từ các lịch `COMPLETED` của ngày hôm trước.
- Nếu cần thu ngân hoặc chấm công lễ tân, nên tạo module riêng thay vì dùng lại lịch trực bác sĩ.
