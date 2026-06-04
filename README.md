# Mec Dental Management System

[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)

MEC là hệ thống quản lý phòng khám nha khoa gồm landing page cho bệnh nhân và các phân hệ nội bộ cho quản trị viên, lễ tân, bác sĩ. Dự án sử dụng React, Vite, Tailwind CSS, Node.js, Express và MongoDB.

## Tính Năng Chính

### Landing Page

- Giới thiệu phòng khám, đội ngũ bác sĩ, dịch vụ nha khoa và không gian phòng khám.
- Giao diện responsive, sử dụng Tailwind CSS v4 và Material Symbols.
- Hỗ trợ luồng đặt lịch, tư vấn từ phía bệnh nhân.

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
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- scripts/
|   `-- package.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- layouts/
|   |   |-- pages/
|   |   `-- services/
|   `-- package.json
|-- qa/
|   |-- e2e/
|   |-- performance/
|   `-- selenium-ide/
|-- docs/
`-- README.md
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

## Kiểm Thử Tự Động Và Phi Chức Năng

Tài liệu chi tiết nằm trong:

```text
docs/testing-plan.md
docs/uc3-automated-testing-report.md
```

### Kiểm Thử Chức Năng Bằng Selenium IDE

Selenium IDE là extension trên Chrome hoặc Edge, dùng để record và replay thao tác người dùng trên giao diện web.

Điều kiện trước khi test:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Nếu chưa có dữ liệu mẫu:

```bash
cd backend
npm run seed
```

Các bước thực hiện trên Selenium IDE:

1. Cài extension Selenium IDE cho Chrome hoặc Edge.
2. Mở Selenium IDE và chọn `Create a new project`.
3. Đặt Base URL là `http://localhost:5173`.
4. Tạo test case mới và bấm record.
5. Thao tác trên trình duyệt, sau đó stop record và chạy lại test.

Gợi ý command trong Selenium IDE cho test đăng nhập:

```text
open | /login
type | css=input[type="email"] | admin@mec.vn
type | css=input[type="password"] | 123456
click | xpath=//button[@type='submit']
waitForElementVisible | css=aside | 10000
assertElementPresent | css=aside
```

Nên ưu tiên selector ổn định như `css=input[type="email"]`, `css=input[type="password"]`, `xpath=//button[@type='submit']`, `css=aside`.

### Kiểm Thử Chức Năng Bằng Selenium WebDriver

Dự án có sẵn script Selenium WebDriver trong thư mục `qa`.

```bash
cd qa
npm install
npm run test:e2e
```

Script mặc định kiểm tra:

- Landing page hiển thị.
- Route admin được bảo vệ khi chưa đăng nhập.
- Đăng nhập admin thành công.
- Dashboard admin hiển thị.
- Đăng xuất quay về trang login.

Chạy bộ test Selenium cho chức năng ngày nghỉ:

```bash
cd qa
npm run test:e2e:holidays
```

Bộ test ngày nghỉ kiểm tra:

- Thêm ngày nghỉ lễ hợp lệ với đầy đủ thông tin.
- Bỏ trống tên ngày nghỉ bắt buộc.
- Bỏ trống ngày bắt đầu bắt buộc.
- Ngày kết thúc nhỏ hơn ngày bắt đầu.
- Khoảng thời gian trùng với ngày nghỉ đã tồn tại.
- Chỉnh sửa ngày kết thúc của ngày nghỉ.
- Ngưng áp dụng ngày nghỉ `ACTIVE`.
- Ngày nghỉ `ACTIVE` chặn đặt lịch khám.
- Ngày nghỉ `ACTIVE` chặn đăng ký lịch trực bác sĩ.
- Xác nhận ngày nghỉ không bị xóa cứng, chỉ chuyển sang `INACTIVE`.

Có thể cấu hình bằng biến môi trường:

```bash
$env:FRONTEND_URL="http://localhost:5173"
$env:ADMIN_EMAIL="admin@mec.vn"
$env:ADMIN_PASSWORD="123456"
$env:HEADLESS="false"
npm run test:e2e
```

### Kiểm Thử Phi Chức Năng Bằng Autocannon

Autocannon được dùng để kiểm thử performance cho backend Express. Công cụ này tạo tải HTTP và đo throughput, latency, lỗi request, timeout.

Điều kiện trước khi test:

```bash
cd backend
npm run dev
```

Chạy performance test chung:

```bash
cd qa
npm install
npm run test:performance
```

Cấu hình mặc định:

- 20 kết nối đồng thời.
- 15 giây.
- Latency trung bình `<= 300ms`.
- Throughput trung bình `>= 50 req/s`.
- Không có request error, timeout hoặc non-2xx response.

Có thể tăng tải khi chạy:

```bash
$env:CONNECTIONS=50
$env:DURATION=30
npm run test:performance
```

## Kiểm Thử UC3

### Kiểm Thử UC3 Bằng Selenium IDE

File Selenium IDE đã được tạo sẵn tại:

```text
qa/selenium-ide/uc3-selenium-ide.side
```

Cách chạy:

1. Mở extension Selenium IDE trên Chrome hoặc Edge.
2. Chọn `Open an existing project`.
3. Chọn file `qa/selenium-ide/uc3-selenium-ide.side`.
4. Đảm bảo backend và frontend đang chạy.
5. Trong Selenium IDE, chạy suite `UC3 Selenium IDE Smoke Suite`.

Các test trong file Selenium IDE:

| Tên test trong Selenium IDE | Tên tiếng Việt | Mục đích |
| --- | --- | --- |
| `UC3_PRE_LOGIN_ADMIN` | Tiền điều kiện - Đăng nhập tài khoản Admin | Kiểm tra đăng nhập admin thành công |
| `UC3.1_MONITOR_CHECK_IN_SCREEN` | UC3.1 - Kiểm thử màn hình theo dõi và check-in lịch khám | Đăng nhập lễ tân, mở màn theo dõi lịch khám, kiểm tra bộ lọc và màn hình check-in |
| `UC3.2_DOCTOR_DASHBOARD_SCREEN` | UC3.2 - Kiểm thử màn hình bác sĩ và luồng khám bệnh | Đăng nhập bác sĩ, mở dashboard bác sĩ để kiểm tra điểm vào luồng khám |
| `UC3.3_PAYMENT_SCREEN` | UC3.3 - Kiểm thử màn hình thanh toán hóa đơn | Đăng nhập lễ tân, mở màn thanh toán, kiểm tra bộ lọc ngày và phương thức thanh toán |
| `UC3.4_REVENUE_REPORT_SCREEN` | UC3.4 - Kiểm thử màn hình báo cáo doanh thu | Đăng nhập admin, mở báo cáo doanh thu, kiểm tra bộ lọc ngày và phương thức thanh toán |

Ghi chú:

- Selenium IDE phù hợp để minh họa thao tác UI và smoke test nhanh.
- Các test cần dữ liệu nghiệp vụ phức tạp như tạo lịch khám, check-in, khám bệnh, tạo hóa đơn nên chạy bằng Selenium WebDriver.
- Nếu Selenium IDE báo lỗi selector, dùng nút chọn target trong Selenium IDE để capture lại selector mới trên UI.

### Kiểm Thử UC3 Bằng Selenium WebDriver

Script Selenium WebDriver UC3 nằm tại:

```text
qa/e2e/uc3-tests.mjs
```

Chạy test:

```bash
cd qa
npm install
npm run test:e2e:uc3
```

Script tự động thực hiện các nhóm kiểm thử:

| Nhóm UC | Tên tiếng Việt | Nội dung kiểm thử |
| --- | --- | --- |
| UC3.1 | Kiểm thử tự động chức năng tiếp đón và check-in bệnh nhân | Check-in lịch hợp lệ, kiểm tra check-in lần 2, kiểm tra lịch `CANCELLED` |
| UC3.2 | Kiểm thử tự động chức năng bác sĩ khám bệnh, cập nhật hồ sơ và hoàn tất khám | Mở hồ sơ, nhập chẩn đoán, dịch vụ, đơn thuốc, hoàn tất khám, kiểm tra phân quyền lễ tân |
| UC3.3 | Kiểm thử tự động chức năng thanh toán hóa đơn khám bệnh | Tạo hóa đơn tiền mặt/thẻ, chặn thanh toán khi chưa hoàn tất, chặn thanh toán trùng |
| UC3.4 | Kiểm thử tự động chức năng xem báo cáo doanh thu | Xem dữ liệu doanh thu theo khoảng ngày, kiểm tra danh sách rỗng khi không có dữ liệu |

Bảng kết quả in ra terminal gồm:

| Cột | Ý nghĩa |
| --- | --- |
| `id` | Mã test case trong file Excel |
| `description` | Mô tả test case |
| `input` | Dữ liệu đầu vào theo cột `Test Input Value` trong file Excel |
| `expected` | Kết quả mong đợi |
| `programResult` | Kết quả thực tế chương trình trả về |
| `status` | Trạng thái test case |

Định nghĩa status:

| Status | Ý nghĩa |
| --- | --- |
| `Pass` | Test case chạy đúng expected result |
| `Fail` | Test case đã chạy nhưng kết quả thực tế khác expected hoặc script gặp lỗi |
| `Manual` | Cần kiểm thử thủ công vì phụ thuộc UI, mạng, thời gian hoặc thao tác đặc biệt |
| `Not Supported` | Chức năng trong test case chưa được app hiện tại hỗ trợ đầy đủ |

Biến môi trường thường dùng:

```bash
$env:FRONTEND_URL="http://localhost:5173"
$env:API_URL="http://localhost:5000/api/v1"
$env:ADMIN_EMAIL="admin@mec.vn"
$env:RECEPTIONIST_EMAIL="lan.nguyen@mec.vn"
$env:DOCTOR_EMAIL="minh.nguyen@mec.vn"
$env:SEED_PASSWORD="123456"
$env:HEADLESS="false"
npm run test:e2e:uc3
```

### Kiểm Thử Phi Chức Năng UC3 Bằng Autocannon

Script Autocannon UC3 nằm tại:

```text
qa/performance/uc3-autocannon.mjs
```

Chạy test:

```bash
cd qa
npm install
npm run test:performance:uc3
```

Các kịch bản performance UC3:

| Tên trong script | Tên tiếng Việt | Endpoint |
| --- | --- | --- |
| `UC3.1 monitor appointments` | UC3.1 - Kiểm thử hiệu năng API theo dõi lịch khám/check-in | `GET /appointments/monitor?date={today}` |
| `UC3.3 pending invoices` | UC3.3 - Kiểm thử hiệu năng API danh sách hóa đơn chờ thanh toán | `GET /invoices/pending?date={today}` |
| `UC3.3 paid invoices` | UC3.3 - Kiểm thử hiệu năng API danh sách hóa đơn đã thanh toán | `GET /invoices?dateFrom={today}&dateTo={today}` |
| `UC3.4 doctor performance report` | UC3.4 - Kiểm thử hiệu năng API báo cáo hiệu suất bác sĩ | `GET /reports/doctor-performance` |
| `UC3.4 patient-service report` | UC3.4 - Kiểm thử hiệu năng API báo cáo bệnh nhân và dịch vụ | `GET /reports/patients-services` |

Các thông số trong bảng kết quả:

| Thông số | Ý nghĩa |
| --- | --- |
| `connections` | Số kết nối đồng thời |
| `duration` | Thời gian chạy tải mỗi scenario |
| `requests` | Tổng số request đã gửi |
| `averageReqPerSec` | Số request trung bình mỗi giây |
| `averageLatencyMs` | Độ trễ phản hồi trung bình |
| `p95LatencyMs` | Độ trễ p95, nếu Autocannon trả về |
| `errors` | Số lỗi request |
| `timeouts` | Số request timeout |
| `non2xx` | Số response không thuộc nhóm HTTP 2xx |
| `status` | `Pass` hoặc `Fail` theo ngưỡng |
| `failureReason` | Lý do fail nếu có |

Ngưỡng mặc định:

- `errors = 0`
- `timeouts = 0`
- `non2xx = 0`
- `averageLatencyMs <= 1000ms`
- `p95LatencyMs <= 3000ms`
- `averageReqPerSec >= 10 req/s`

Kết quả lần chạy đã ghi trong báo cáo:

| Scenario | Avg latency | Req/s | Errors | Timeouts | Non-2xx | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| UC3.1 monitor appointments | 524.36ms | 36.4 | 0 | 0 | 0 | Pass |
| UC3.3 pending invoices | 724.12ms | 27.07 | 0 | 0 | 0 | Pass |
| UC3.3 paid invoices | 1374.6ms | 13.87 | 0 | 0 | 0 | Fail |
| UC3.4 doctor performance report | 724.51ms | 27.34 | 0 | 0 | 0 | Pass |
| UC3.4 patient-service report | 960.11ms | 20.4 | 0 | 0 | 0 | Pass |

Kết luận performance lần chạy này: 4/5 scenario đạt, 1/5 scenario không đạt. Scenario fail là `UC3.3 paid invoices` vì latency trung bình `1374.6ms`, vượt ngưỡng `1000ms`.

Có thể chạy ở chế độ chỉ báo cáo, không làm fail command:

```bash
$env:PERF_STRICT="false"
npm run test:performance:uc3
```

## Ghi Chú Triển Khai

- Lễ tân không có lịch trực riêng trong hệ thống hiện tại; `DutySchedule` chỉ dùng cho lịch trực bác sĩ.
- Danh sách gọi lại ngày hôm nay được tính từ các lịch `COMPLETED` của ngày hôm trước.
- Nếu cần thu ngân hoặc chấm công lễ tân, nên tạo module riêng thay vì dùng lại lịch trực bác sĩ.
