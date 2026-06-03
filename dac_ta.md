Đặc tả UC2.5 - Theo dõi lịch khám  

Thuộc tính

Mô tả

Use Case ID

UC2.5

Use Case Name

Theo dõi lịch khám

Tác nhân chính

Lễ tân, Quản lý  

Tác nhân liên quan

Bác sĩ, Bệnh nhân

Mô tả  

Chức năng cho phép theo dõi và quản lý danh sách lịch khám của bệnh nhân theo ngày, bác sĩ, ca khám và trạng thái khám. Hệ thống hỗ trợ cập nhật trạng thái khám và điều phối lịch khám trong quá trình vận hành phòng khám.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền theo dõi lịch khám.

- Hệ thống đã có dữ liệu lịch khám.

- Hệ thống đặt lịch đang hoạt động bình thường.

Hậu điều kiện

- Danh sách lịch khám được hiển thị chính xác.
- Trạng thái lịch khám được cập nhật thành công.
- Dữ liệu thay đổi được ghi nhận vào audit log.
- Thông tin được đồng bộ với các chức năng liên quan.

Kích hoạt

Người dùng chọn chức năng “Theo dõi lịch khám” từ menu quản lý lịch khám.

Luồng chính

1. Người dùng truy cập chức năng “Theo dõi lịch khám”.

2. Hệ thống hiển thị danh sách lịch khám trong ngày hiện tại.

3. Người dùng chọn bộ lọc:

    - Ngày khám

    - Bác sĩ

    - Ca khám

    - Trạng thái lịch khám

4. Hệ thống hiển thị danh sách lịch khám phù hợp.

5. Người dùng chọn một lịch khám cụ thể.

6. Người dùng cập nhật trạng thái lịch khám.

7. Hệ thống lưu trạng thái mới.

8. Hệ thống cập nhật dữ liệu liên quan.

9. Hiển thị thông báo cập nhật thành công.

Luồng thay thế

A1. Không có dữ liệu lịch khám

1. Hệ thống không tìm thấy dữ liệu phù hợp.
2. Hiển thị danh sách rỗng.
3. Hiển thị thông báo “Không có dữ liệu”.

A2. Check-in bệnh nhân

1. Người dùng chọn lịch khám có trạng thái CONFIRMED.
2. Nhấn “Check-in”.
3. Hệ thống cập nhật trạng thái thành CHECKED_IN.

A3. Hoàn thành khám

1. Người dùng chọn lịch khám đang CHECKED_IN.
2. Nhấn “Hoàn thành khám”.
3. Hệ thống cập nhật trạng thái thành COMPLETED.

A4. Đánh dấu bệnh nhân không đến

1. Người dùng chọn lịch khám.
2. Nhấn “Không đến”.
3. Hệ thống cập nhật trạng thái thành NO_SHOW.

A5. Hủy lịch khám

1. Người dùng chọn lịch khám.
2. Nhấn “Hủy lịch”.
3. Xác nhận thao tác.
4. Hệ thống cập nhật trạng thái thành CANCELLED.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền theo dõi lịch khám.
2. Hệ thống từ chối truy cập chức năng.

E2. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể tải hoặc cập nhật dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

E3. Cập nhật trạng thái không hợp lệ

1. Người dùng thực hiện chuyển trạng thái không đúng quy trình.
2. Hệ thống từ chối cập nhật.
3. Hiển thị cảnh báo lỗi.

E4. Lịch khám đã bị thay đổi bởi người dùng khác

1. Dữ liệu lịch khám đã được cập nhật trước đó.
2. Hệ thống yêu cầu tải lại dữ liệu mới nhất.
3. Người dùng thực hiện lại thao tác nếu cần.

Yêu cầu đặc biệt  

- Hỗ trợ hiển thị lịch khám dạng danh sách và calendar.

- Hỗ trợ tìm kiếm nhanh theo tên bệnh nhân hoặc mã lịch khám.

- Hỗ trợ lọc theo bác sĩ, ngày, ca và trạng thái.

- Hỗ trợ cập nhật trạng thái theo thời gian thực.

- Hỗ trợ audit log cho các thao tác cập nhật trạng thái.

- Hệ thống phải hỗ trợ đồng bộ với hồ sơ điều trị và thanh toán.

Quy tắc nghiệp vụ

- Chỉ lịch khám hợp lệ mới được phép cập nhật trạng thái.

- Không được chuyển trạng thái sai quy trình nghiệp vụ.

- Trạng thái lịch khám bao gồm:

  - PENDING

  - CONFIRMED

  - CHECKED_IN

  - COMPLETED

  - CANCELLED

  - NO_SHOW

- Chỉ lịch khám CONFIRMED mới được CHECKED_IN.

- Chỉ lịch khám CHECKED_IN mới được COMPLETED.

- Lịch khám CANCELLED hoặc COMPLETED không được chỉnh sửa thông tin thời gian khám.

- Không được xóa cứng lịch khám đã phát sinh dữ liệu liên quan.

- Mọi thay đổi trạng thái phải được lưu lịch sử thao tác.

Đặc tả UC3.1 - Tiếp đón người đến khám (check in)

Thuộc tính

Mô tả

Use Case ID

UC3.1

Use Case Name

Tiếp đón người đến khám (Check-in)

Tác nhân chính

Lễ tân

Tác nhân liên quan

Bệnh nhân, Bác sĩ, Quản lý

Mô tả  

Chức năng cho phép lễ tân tiếp nhận bệnh nhân đến khám, xác nhận check-in và chuyển bệnh nhân vào danh sách chờ khám của bác sĩ.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống
- Có quyền tiếp đón bệnh nhân
- Bệnh nhân có lịch khám hợp lệ hoặc đăng ký khám trực tiếp

Hậu điều kiện

- Bệnh nhân được check-in thành công

- Trạng thái lịch khám chuyển thành CHECKED_IN

- Thời gian check-in được ghi nhận

Kích hoạt

Bệnh nhân đến phòng khám và yêu cầu làm thủ tục khám bệnh

Luồng chính

1. Lễ tân truy cập chức năng “Tiếp đón”.

2. Hệ thống hiển thị danh sách lịch khám trong ngày.

3. Lễ tân tìm bệnh nhân theo mã lịch, SĐT hoặc họ tên.

4. Hệ thống hiển thị thông tin lịch khám.

5. Lễ tân xác nhận thông tin bệnh nhân.

6. Nhấn nút “Check-in”.

7. Hệ thống cập nhật trạng thái lịch khám thành CHECKED_IN.

8. Hệ thống ghi nhận thời gian check-in.

9. Hệ thống thông báo check-in thành công.

Luồng thay thế

A1. Đăng ký khám trực tiếp

1. Không tìm thấy lịch hẹn.

2. Lễ tân chọn “Đăng ký khám mới”.

3. Nhập thông tin bệnh nhân.

4. Chọn bác sĩ và ca khám còn trống.

5. Hệ thống tạo lịch khám mới.

A2. Bệnh nhân đến trễ

1. Hệ thống phát hiện quá giờ khám.

2. Hiển thị cảnh báo.

3. Lễ tân xác nhận tiếp tục hoặc dời lịch khám.

Luồng ngoại lệ

E1. Lịch khám đã bị hủy

- Hệ thống không cho phép check-in.

E2. Check-in nhiều lần

- Hệ thống hiển thị thông báo “Bệnh nhân đã check-in”.

E3. Mất kết nối hệ thống

- Hiển thị lỗi hệ thống và yêu cầu thử lại.

Yêu cầu đặc biệt  

- Tìm kiếm bệnh nhân nhanh dưới 2 giây.
- Giao diện hỗ trợ tìm kiếm realtime.
- Có hỗ trợ responsive trên tablet.

Quy tắc nghiệp vụ

- Chỉ lịch khám CONFIRMED mới được check-in.

- Không check-in lịch đã CANCELLED.

- Thời gian check-in phải được lưu lại.

- Một lịch khám chỉ được check-in một lần.

Đặc tả UC3.2 - Khám bệnh và cập nhật hồ sơ

Thuộc tính

Mô tả

Use Case ID

UC3.2

Use Case Name

Khám bệnh và cập nhật hồ sơ

Tác nhân chính

Bác sĩ

Tác nhân liên quan

Bệnh nhân, Lễ tân

Mô tả  

Chức năng cho phép bác sĩ khám bệnh, cập nhật hồ sơ khám, chẩn đoán và chỉ định dịch vụ điều trị.

Tiền điều kiện

- Bệnh nhân đã check-in

- Bác sĩ đang trong ca trực

Hậu điều kiện

- Hồ sơ khám được lưu

- Tạo thông tin dịch vụ điều trị

- Chuyển sang bước thanh toán

Kích hoạt

Bác sĩ chọn bệnh nhân trong danh sách chờ khám

Luồng chính

1. Bác sĩ mở danh sách bệnh nhân chờ khám.

2. Chọn bệnh nhân cần khám.

3. Hệ thống hiển thị hồ sơ bệnh nhân và lịch sử khám.

4. Bác sĩ nhập triệu chứng.

5. Nhập chẩn đoán.

6. Chọn dịch vụ điều trị.

7. Nhấn “Hoàn tất khám”.

8. Hệ thống lưu hồ sơ khám.

9. Chuyển trạng thái khám thành COMPLETED.

Luồng thay thế

A1. Lưu tạm hồ sơ

1. Bác sĩ chọn “Lưu tạm”.

2. Hệ thống lưu trạng thái IN_PROGRESS.

A2. Chuyển bác sĩ khác

1. Chọn “Chuyển bác sĩ”.

2. Chọn bác sĩ mới.

3. Hệ thống cập nhật người khám.

Luồng ngoại lệ

E1. Thiếu chẩn đoán

- Không cho phép hoàn tất khám.

E2. Không có quyền truy cập hồ sơ

- Hệ thống từ chối truy cập.

Yêu cầu đặc biệt  

- Hồ sơ khám phải tự động lưu định kỳ.

- Hỗ trợ upload hình ảnh X-ray.

Quy tắc nghiệp vụ

- Hồ sơ khám bắt buộc có chẩn đoán.

- Bác sĩ chỉ được khám bệnh nhân thuộc ca trực của mình.

- Lưu lịch sử chỉnh sửa hồ sơ.

Đặc tả UC3.3 - Thanh toán chi phí khám bệnh

Thuộc tính

Mô tả

Use Case ID

UC3.3

Use Case Name

Thanh toán chi phí khám bệnh

Tác nhân chính

Lễ tân

Tác nhân liên quan

Bệnh nhân, Quản lý

Mô tả  

Chức năng cho phép lễ tân lập hóa đơn, thanh toán và in hóa đơn khám bệnh.

Tiền điều kiện

- Hồ sơ khám đã hoàn tất

- Có dịch vụ điều trị

Hậu điều kiện

- Hóa đơn được thanh toán

- Cập nhật doanh thu

Kích hoạt

Bệnh nhân yêu cầu thanh toán

Luồng chính

1. Lễ tân mở chức năng “Thanh toán”.

2. Tìm bệnh nhân.

3. Hệ thống hiển thị hóa đơn.

4. Kiểm tra danh sách dịch vụ.

5. Chọn phương thức thanh toán.

6. Nhấn “Thanh toán”.

7. Hệ thống cập nhật trạng thái PAID.

8. In hóa đơn.

Luồng thay thế

A1. Áp dụng giảm giá

1. Nhập mã giảm giá.

2. Hệ thống tính lại tổng tiền.

A2. Thanh toán nhiều phương thức

1. Chọn nhiều phương thức.

2. Nhập số tiền từng phương thức.

Luồng ngoại lệ

E1. Chưa hoàn tất khám  

- Không cho thanh toán.

E2. Thanh toán thất bại  

- Báo lỗi giao dịch.

E3. Thanh toán trùng  

- Không cho xử lý tiếp.

Yêu cầu đặc biệt  

- Hỗ trợ in hóa đơn PDF.

- Hỗ trợ QR banking.

- Tốc độ xử lý nhanh.

Quy tắc nghiệp vụ

- Chỉ hóa đơn COMPLETED mới được thanh toán.

- Hóa đơn PAID không được chỉnh sửa.

- Tổng tiền = tổng dịch vụ điều trị.

Đặc tả UC3.4 - Thống kê doanh thu

Thuộc tính

Mô tả

Use Case ID

UC3.4

Use Case Name

Thống kê doanh thu

Tác nhân chính

Quản lý

Tác nhân liên quan

Admin

Mô tả  

Chức năng cho phép xem thống kê doanh thu theo thời gian, bác sĩ và dịch vụ.

Tiền điều kiện

- Có dữ liệu hóa đơn
- Người dùng có quyền thống kê

Hậu điều kiện

- Hiển thị báo cáo doanh thu

Kích hoạt

Người quản lý truy cập chức năng thống kê

Luồng chính

1. Truy cập “Thống kê doanh thu”.
2. Chọn khoảng thời gian.
3. Chọn bộ lọc bác sĩ/dịch vụ.
4. Nhấn “Thống kê”.
5. Hệ thống hiển thị bảng doanh thu.
6. Hiển thị biểu đồ thống kê.

Luồng thay thế

A1. Xuất Excel/PDF

1. Chọn “Xuất báo cáo”.

2. Hệ thống tạo file tải xuống.

A2. Xem theo tháng/năm

1. Chọn kiểu thống kê.

2. Hệ thống cập nhật biểu đồ.

Luồng ngoại lệ

E1. Không có dữ liệu

- Hiển thị danh sách rỗng.

E2. Khoảng thời gian không hợp lệ

- Báo lỗi.

Yêu cầu đặc biệt  

- Hỗ trợ biểu đồ trực quan.

- Export file nhanh.

- Dữ liệu cập nhật realtime.

Quy tắc nghiệp vụ

- Chỉ tính hóa đơn PAID.

- Không sửa dữ liệu thống kê.

- Doanh thu tính theo thời gian thanh toán.
