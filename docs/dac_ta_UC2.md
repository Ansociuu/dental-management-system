Đặc tả UC2.1 - Thiết lập các ngày nghỉ  

Thuộc tính

Mô tả

Use Case ID

UC2.1

Use Case Name

Thiết lập các ngày nghỉ

Tác nhân chính

Admin, Quản lý

Tác nhân liên quan

N/A

Mô tả  

Chức năng cho phép quản trị viên thiết lập các ngày nghỉ của phòng khám bao gồm ngày nghỉ lễ, ngày nghỉ toàn phòng khám, ngày nghỉ đặc biệt hoặc khoảng thời gian nghỉ. Dữ liệu này được sử dụng để chặn đăng ký lịch khám và đăng ký lịch trực bác sĩ trong khoảng thời gian nghỉ.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.
- Người dùng có quyền quản lý lịch khám.
- Hệ thống đang hoạt động bình thường.

Hậu điều kiện

- Ngày nghỉ được lưu thành công vào hệ thống.

- Hệ thống không cho phép đặt lịch khám hoặc đăng ký lịch trực trong thời gian nghỉ ACTIVE.

- Lịch sử thao tác được ghi nhận vào audit log.

Kích hoạt

Người dùng chọn chức năng “Thiết lập ngày nghỉ” từ menu quản lý lịch khám.

Luồng chính

1. Người dùng truy cập chức năng “Thiết lập ngày nghỉ”.

2. Hệ thống hiển thị danh sách ngày nghỉ hiện có.

3. Người dùng chọn “Thêm mới”.

4. Hệ thống hiển thị form nhập thông tin.

5. Người dùng nhập:

    - Tên ngày nghỉ

    - Ngày bắt đầu

    - Ngày kết thúc

    - Loại nghỉ

    - Ghi chú

6. Người dùng nhấn “Lưu”.

7. Hệ thống kiểm tra dữ liệu hợp lệ.

8. Hệ thống lưu thông tin ngày nghỉ.

9. Hệ thống cập nhật trạng thái ACTIVE cho ngày nghỉ.

10. Hiển thị thông báo lưu thành công.

Luồng thay thế

A1. Thiếu thông tin bắt buộc

1. Hệ thống phát hiện thiếu tên ngày nghỉ hoặc ngày nghỉ.
2. Hiển thị thông báo lỗi.
3. Không cho phép lưu dữ liệu.

A2. Ngày kết thúc nhỏ hơn ngày bắt đầu

1. Hệ thống phát hiện dữ liệu không hợp lệ.
2. Hiển thị cảnh báo lỗi.
3. Yêu cầu nhập lại.

A3. Trùng khoảng thời gian nghỉ

1. Hệ thống phát hiện khoảng thời gian nghỉ bị trùng.
2. Hiển thị cảnh báo cho người dùng.
3. Người dùng xác nhận hoặc chỉnh sửa dữ liệu.

A4. Chỉnh sửa ngày nghỉ

1. Người dùng chọn ngày nghỉ cần chỉnh sửa.
2. Cập nhật thông tin.
3. Nhấn “Lưu”.
4. Hệ thống cập nhật dữ liệu thành công.

A5. Ngưng áp dụng ngày nghỉ

1. Người dùng chọn ngày nghỉ.
2. Nhấn “Ngưng áp dụng”.
3. Hệ thống yêu cầu xác nhận.
4. Trạng thái ngày nghỉ chuyển sang INACTIVE.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền quản lý lịch khám.
2. Hệ thống từ chối truy cập chức năng.

E2. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể lưu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

E3. Kết nối hệ thống bị gián đoạn

1. Quá trình lưu dữ liệu bị gián đoạn.
2. Hệ thống hiển thị cảnh báo.
3. Người dùng thực hiện lại thao tác sau khi kết nối ổn định.

Yêu cầu đặc biệt  

- Hỗ trợ tìm kiếm và lọc ngày nghỉ theo loại hoặc trạng thái.

- Hỗ trợ hiển thị ngày nghỉ theo lịch (calendar view).

- Hỗ trợ audit log cho các thao tác thêm/sửa/ngưng áp dụng.

- Đồng bộ dữ liệu với hệ thống đặt lịch và lịch trực bác sĩ.

- Hệ thống phải hỗ trợ nhiều loại ngày nghỉ khác nhau.

Quy tắc nghiệp vụ

- Không cho phép ngày kết thúc nhỏ hơn ngày bắt đầu.
- Không cho phép tạo ngày nghỉ trùng hoàn toàn về thời gian và loại nghỉ.
- Chỉ ngày nghỉ ở trạng thái ACTIVE mới có hiệu lực chặn đặt lịch.
- Không được xóa cứng dữ liệu ngày nghỉ đã phát sinh sử dụng.
- Không cho phép đặt lịch khám trong thời gian nghỉ ACTIVE.
- Không cho phép đăng ký lịch trực bác sĩ trong ngày nghỉ ACTIVE.
- Mỗi ngày nghỉ phải có mã định danh duy nhất (Holiday ID).

Giao diện minh họa

1. Giao diện danh sách ngày nghỉ:

2. Giao diện thêm mới ngày nghỉ:

Đặc tả UC2.2 - Thiết lập ca làm việc (trong các ngày làm việc)  

Thuộc tính

Mô tả

Use Case ID

UC2.2

Use Case Name

Thiết lập ca làm việc

Tác nhân chính

Admin, Quản lý

Tác nhân liên quan

N/A

Mô tả  

Chức năng cho phép quản lý và thiết lập các ca làm việc của phòng khám như ca sáng, ca chiều, ca tối. Các ca làm việc sẽ được sử dụng để đăng ký lịch trực bác sĩ và đặt lịch khám cho bệnh nhân.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền quản lý lịch khám.

- Hệ thống đang hoạt động bình thường.

Hậu điều kiện

- Ca làm việc được tạo hoặc cập nhật thành công.

- Ca làm việc hiển thị trong hệ thống đăng ký lịch trực và đặt lịch khám.

- Lịch sử thao tác được ghi nhận vào audit log.

Kích hoạt

Người dùng chọn chức năng “Quản lý ca làm việc” từ menu quản lý lịch khám.

Luồng chính

1. Người dùng truy cập chức năng “Quản lý ca làm việc”.
2. Hệ thống hiển thị danh sách ca làm việc hiện có.
3. Người dùng chọn “Thêm ca”.
4. Hệ thống hiển thị form nhập thông tin.
5. Người dùng nhập:
    - Tên ca
    - Giờ bắt đầu
    - Giờ kết thúc
    - Giới hạn bệnh nhân
    - Ghi chú (nếu có)
6. Người dùng nhấn “Lưu”.
7. Hệ thống kiểm tra dữ liệu hợp lệ.
8. Hệ thống lưu thông tin ca làm việc.
9. Hệ thống đặt trạng thái ACTIVE cho ca làm việc.
10. Hiển thị thông báo thành công.

Luồng thay thế

A1. Giờ kết thúc nhỏ hơn giờ bắt đầu

1. Hệ thống phát hiện dữ liệu không hợp lệ.
2. Hiển thị thông báo lỗi.
3. Yêu cầu nhập lại.

A2. Trùng thời gian ca làm việc

1. Hệ thống phát hiện ca làm việc bị trùng thời gian.
2. Hiển thị cảnh báo.
3. Không cho phép lưu dữ liệu.

A3. Giới hạn bệnh nhân không hợp lệ

1. Người dùng nhập số lượng nhỏ hơn hoặc bằng 0.
2. Hệ thống hiển thị lỗi.
3. Không cho phép lưu.

A4. Chỉnh sửa ca làm việc

1. Người dùng chọn ca làm việc cần chỉnh sửa.
2. Cập nhật thông tin.
3. Nhấn “Lưu”.
4. Hệ thống cập nhật dữ liệu thành công.

A5. Ngưng sử dụng ca làm việc

1. Người dùng chọn ca làm việc.
2. Nhấn “Ngưng hoạt động”.
3. Hệ thống yêu cầu xác nhận.
4. Trạng thái ca làm việc chuyển sang INACTIVE.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền quản lý ca làm việc.
2. Hệ thống từ chối truy cập chức năng.

E2. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể lưu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

E3. Ca làm việc đang được sử dụng

1. Người dùng cố gắng ngưng ca làm việc đã có lịch trực hoặc lịch khám trong tương lai.
2. Hệ thống hiển thị cảnh báo.
3. Yêu cầu xử lý các lịch liên quan trước khi ngưng ca.

Yêu cầu đặc biệt  

- Hỗ trợ tìm kiếm và lọc ca làm việc theo trạng thái.

- Hỗ trợ hiển thị dạng timeline hoặc calendar.

- Hỗ trợ audit log cho thao tác thêm/sửa/ngưng ca.

- Đồng bộ dữ liệu với hệ thống lịch trực và lịch khám.

- Hệ thống phải hỗ trợ mở rộng nhiều loại ca làm việc khác nhau.

Quy tắc nghiệp vụ

- Thời gian các ca làm việc không được trùng nhau.
- Giờ kết thúc phải lớn hơn giờ bắt đầu.
- Giới hạn bệnh nhân phải lớn hơn 0.
- Chỉ ca làm việc ở trạng thái ACTIVE mới được sử dụng.
- Không được xóa cứng ca làm việc đã phát sinh dữ liệu liên quan.
- Khi cần loại bỏ ca làm việc chỉ được chuyển trạng thái INACTIVE.
- Không cho phép chỉnh sửa thời gian của ca làm việc đã có lịch khám phát sinh trong ngày hiện tại.
- Mỗi ca làm việc phải có mã định danh duy nhất (Shift ID).

Giao diện minh họa

1. Giao diện danh sách ca làm việc:

2. Giao diện thêm ca làm việc:

Đặc tả UC2.3 - Đăng ký lịch trực của bác sĩ

Thuộc tính

Mô tả

Use Case ID

UC2.3

Use Case Name

Đăng ký lịch trực của bác sĩ

Tác nhân chính

Admin, Quản lý

Tác nhân liên quan

Bác sĩ

Mô tả  

Chức năng cho phép quản lý đăng ký lịch trực cho bác sĩ theo ngày, ca làm việc và chuyên khoa. Lịch trực được sử dụng để xác định khả năng tiếp nhận lịch khám của bác sĩ trong hệ thống.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền quản lý lịch trực bác sĩ.

- Hệ thống đã có dữ liệu bác sĩ và ca làm việc.

- Ngày đăng ký không thuộc ngày nghỉ ACTIVE.

- Bác sĩ đang ở trạng thái ACTIVE.

Hậu điều kiện

- Lịch trực bác sĩ được tạo hoặc cập nhật thành công.
- Lịch trực hiển thị trong hệ thống đặt lịch khám.
- Hệ thống ghi nhận lịch sử thao tác vào audit log.
- Bác sĩ có thể được chọn khi đặt lịch khám trong ca trực tương ứng.

Kích hoạt

Người dùng chọn chức năng “Lịch trực bác sĩ” từ menu quản lý lịch khám.

Luồng chính

1. Người dùng truy cập chức năng “Lịch trực bác sĩ”.

2. Hệ thống hiển thị danh sách lịch trực hiện có.

3. Người dùng chọn “Đăng ký lịch trực”.

4. Hệ thống hiển thị form đăng ký.

5. Người dùng chọn:

    - Bác sĩ

    - Ngày trực

    - Ca trực

    - Chuyên khoa (nếu có)

6. Người dùng nhấn “Lưu”.

7. Hệ thống kiểm tra dữ liệu hợp lệ:

    - Không trùng lịch trực

    - Không thuộc ngày nghỉ

    - Ca làm việc đang ACTIVE

    - Bác sĩ đang ACTIVE

8. Hệ thống lưu lịch trực.

9. Hệ thống đặt trạng thái ACTIVE cho lịch trực.

10. Hiển thị thông báo thành công.

Luồng thay thế

A1. Trùng lịch trực

1. Hệ thống phát hiện bác sĩ đã có lịch trực trong cùng thời gian.
2. Hiển thị cảnh báo lỗi.
3. Không cho phép lưu dữ liệu.

A2. Đăng ký vào ngày nghỉ

1. Hệ thống phát hiện ngày trực thuộc ngày nghỉ ACTIVE.
2. Từ chối đăng ký lịch trực.
3. Hiển thị thông báo lỗi.

A3. Bác sĩ bị khóa hoặc ngưng hoạt động

1. Hệ thống kiểm tra trạng thái bác sĩ là INACTIVE.
2. Không cho phép đăng ký lịch trực.
3. Hiển thị cảnh báo.

A4. Chỉnh sửa lịch trực

1. Người dùng chọn lịch trực cần chỉnh sửa.
2. Cập nhật thông tin.
3. Nhấn “Lưu”.
4. Hệ thống cập nhật dữ liệu thành công.

A5. Hủy lịch trực

1. Người dùng chọn lịch trực.
2. Nhấn “Hủy lịch trực”.
3. Hệ thống yêu cầu xác nhận.
4. Trạng thái lịch trực chuyển sang CANCELLED.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền quản lý lịch trực.
2. Hệ thống từ chối truy cập chức năng.

E2. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể lưu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

E3. Ca làm việc không còn hiệu lực

1. Người dùng chọn ca làm việc đã INACTIVE.
2. Hệ thống từ chối đăng ký.
3. Hiển thị cảnh báo cho người dùng.

E4. Lịch trực đã phát sinh lịch khám

1. Người dùng cố gắng hủy lịch trực đã có bệnh nhân đặt lịch.
2. Hệ thống hiển thị cảnh báo.
3. Yêu cầu xử lý các lịch khám liên quan trước khi hủy lịch trực.

Yêu cầu đặc biệt  

- Hỗ trợ hiển thị lịch trực theo dạng calendar/timeline.
- Hỗ trợ tìm kiếm lịch trực theo bác sĩ, ngày hoặc chuyên khoa.
- Hỗ trợ audit log cho thao tác thêm/sửa/hủy lịch trực.
- Đồng bộ dữ liệu với hệ thống đặt lịch khám.
- Hệ thống phải hỗ trợ kiểm tra trùng lịch theo thời gian thực.

Quy tắc nghiệp vụ

- Một bác sĩ không được có hai lịch trực trùng thời gian.
- Không cho phép đăng ký lịch trực trong ngày nghỉ ACTIVE.
- Chỉ bác sĩ ở trạng thái ACTIVE mới được đăng ký lịch trực.
- Chỉ ca làm việc ACTIVE mới được sử dụng.
- Bác sĩ phải thuộc chuyên khoa phù hợp với lịch trực.
- Không được xóa cứng lịch trực đã phát sinh dữ liệu liên quan.
- Khi cần loại bỏ lịch trực chỉ được chuyển trạng thái CANCELLED.
- Không cho phép đăng ký lịch trực trong quá khứ.
- Mỗi lịch trực phải có mã định danh duy nhất (Schedule ID).

Giao diện minh họa

1. Giao diện danh sách lịch trực bác sĩ:

2. Giao diện đăng ký lịch trực:

Đặc tả UC2.4 - Đăng ký lịch khám của bệnh nhân  

Thuộc tính

Mô tả

Use Case ID

UC2.4

Use Case Name

Đăng ký lịch khám của bệnh nhân

Tác nhân chính

Lễ tân, Bệnh nhân

Tác nhân liên quan

Bác sĩ

Mô tả  

Chức năng cho phép lễ tân hoặc bệnh nhân đăng ký lịch khám tại phòng khám nha khoa theo ngày khám, ca khám, bác sĩ và dịch vụ mong muốn. Hệ thống sẽ kiểm tra tính hợp lệ của lịch khám trước khi xác nhận đặt lịch.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống (đối với lễ tân).
- Hệ thống đã có dữ liệu bệnh nhân, bác sĩ và ca làm việc.
- Bác sĩ có lịch trực trong thời gian được chọn.
- Ca làm việc đang ở trạng thái ACTIVE.
- Ngày khám không thuộc ngày nghỉ ACTIVE.

Hậu điều kiện

- Lịch khám được tạo thành công.
- Slot khám của ca làm việc giảm tương ứng.
- Trạng thái lịch khám được thiết lập là PENDING hoặc CONFIRMED.
- Hệ thống ghi nhận lịch sử thao tác vào audit log.
- Hệ thống gửi thông báo xác nhận đặt lịch.

Kích hoạt

Người dùng chọn chức năng “Đăng ký lịch khám” từ menu hệ thống hoặc cổng đặt lịch trực tuyến.

Luồng chính

1. Người dùng truy cập chức năng “Đăng ký lịch khám”.
2. Hệ thống hiển thị form đặt lịch.
3. Người dùng chọn hoặc nhập thông tin bệnh nhân.
4. Người dùng chọn:
    - Ngày khám
    - Ca khám
    - Bác sĩ
    - Dịch vụ khám
5. Người dùng nhập triệu chứng hoặc ghi chú.
6. Người dùng nhấn “Đặt lịch”.
7. Hệ thống kiểm tra dữ liệu hợp lệ:
    - Slot khám còn trống
    - Bác sĩ có lịch trực
    - Không thuộc ngày nghỉ
    - Ca làm việc đang ACTIVE
8. Hệ thống tạo lịch khám.
9. Hệ thống cập nhật số lượng slot còn lại.
10. Hệ thống gửi thông báo xác nhận đặt lịch.
11. Hiển thị thông báo thành công.

Luồng thay thế

A1. Full slot khám

1. Hệ thống phát hiện ca khám đã đủ số lượng bệnh nhân.
2. Hiển thị thông báo đầy lịch.
3. Gợi ý ca khám hoặc thời gian khác.

A2. Không có bác sĩ trực

1. Hệ thống không tìm thấy bác sĩ trực phù hợp.
2. Từ chối đặt lịch.
3. Hiển thị thông báo lỗi.

A3. Trùng lịch khám bệnh nhân

1. Hệ thống phát hiện bệnh nhân đã có lịch khám trong cùng thời gian.
2. Hiển thị cảnh báo.
3. Người dùng xác nhận hoặc chọn thời gian khác.

A4. Dời lịch khám

1. Người dùng chọn lịch khám cần dời.
2. Chọn ngày hoặc ca khám mới.
3. Hệ thống kiểm tra slot và lịch trực.
4. Hệ thống cập nhật lịch khám.

A5. Hủy lịch khám

1. Người dùng chọn lịch khám.
2. Nhấn “Hủy lịch”.
3. Hệ thống yêu cầu xác nhận.
4. Trạng thái lịch khám chuyển sang CANCELLED.
5. Slot khám được hoàn lại.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền đặt lịch khám.
2. Hệ thống từ chối truy cập chức năng.

E2. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể tạo lịch khám.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

E3. Trùng slot do nhiều người đặt cùng lúc

1. Hai người dùng đồng thời đặt slot cuối cùng.
2. Hệ thống khóa transaction và kiểm tra lại slot.
3. Chỉ một yêu cầu được xác nhận.
4. Yêu cầu còn lại hiển thị thông báo hết chỗ.

E4. Đặt lịch trong thời gian quá khứ

1. Người dùng chọn ngày hoặc giờ đã qua.
2. Hệ thống từ chối đặt lịch.
3. Hiển thị cảnh báo lỗi.

Yêu cầu đặc biệt  

- Hỗ trợ đặt lịch theo dạng calendar hoặc timeline.

- Hỗ trợ gửi thông báo qua SMS, email hoặc ứng dụng.

- Hỗ trợ tìm kiếm bệnh nhân nhanh theo SĐT hoặc mã bệnh nhân.

- Hỗ trợ kiểm tra slot theo thời gian thực.

- Hỗ trợ audit log cho thao tác tạo/dời/hủy lịch khám.

- Hệ thống phải hỗ trợ đồng bộ với lịch trực bác sĩ.

Quy tắc nghiệp vụ

- Không được vượt quá giới hạn bệnh nhân của ca làm việc.

- Chỉ được đặt lịch khi bác sĩ có lịch trực ACTIVE.

- Không được đặt lịch trong ngày nghỉ ACTIVE.

- Không được đặt lịch trong quá khứ.

- Một bệnh nhân không được có hai lịch khám trùng thời gian.

- Khi hủy lịch khám phải hoàn lại slot còn trống.

- Không được xóa cứng lịch khám đã phát sinh dữ liệu liên quan.

- Lịch khám phải có trạng thái hợp lệ: PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW.

- Mỗi lịch khám phải có mã định danh duy nhất (Appointment ID).

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
10. Hệ thống không tìm thấy dữ liệu phù hợp.
11. Hiển thị danh sách rỗng.
12. Hiển thị thông báo “Không có dữ liệu”.
A2. Check-in bệnh nhân
13. Người dùng chọn lịch khám có trạng thái CONFIRMED.
14. Nhấn “Check-in”.
15. Hệ thống cập nhật trạng thái thành CHECKED_IN.
A3. Hoàn thành khám
16. Người dùng chọn lịch khám đang CHECKED_IN.
17. Nhấn “Hoàn thành khám”.
18. Hệ thống cập nhật trạng thái thành COMPLETED.
A4. Đánh dấu bệnh nhân không đến
19. Người dùng chọn lịch khám.
20. Nhấn “Không đến”.
21. Hệ thống cập nhật trạng thái thành NO_SHOW.
A5. Hủy lịch khám
22. Người dùng chọn lịch khám.
23. Nhấn “Hủy lịch”.
24. Xác nhận thao tác.
25. Hệ thống cập nhật trạng thái thành CANCELLED.
Luồng ngoại lệ
E1. Không đủ quyền truy cập
26. Người dùng không có quyền theo dõi lịch khám.
27. Hệ thống từ chối truy cập chức năng.
E2. Lỗi hệ thống hoặc cơ sở dữ liệu
28. Hệ thống không thể tải hoặc cập nhật dữ liệu.
29. Hiển thị thông báo lỗi.
30. Ghi nhận log lỗi hệ thống.
E3. Cập nhật trạng thái không hợp lệ
31. Người dùng thực hiện chuyển trạng thái không đúng quy trình.
32. Hệ thống từ chối cập nhật.
33. Hiển thị cảnh báo lỗi.
E4. Lịch khám đã bị thay đổi bởi người dùng khác
34. Dữ liệu lịch khám đã được cập nhật trước đó.
35. Hệ thống yêu cầu tải lại dữ liệu mới nhất
36. Người dùng thực hiện lại thao tác nếu cần.
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
Đặc tả UC2.6 - Quản lý Bệnh nhân

Thuộc tính

Mô tả

Use Case ID

UC2.6

Use Case Name

Quản lý Bệnh nhân

Tác nhân chính

Lễ tân

Tác nhân liên quan

Quản lý, Bệnh nhân

Mô tả  

Chức năng cho phép quản lý thông tin cơ bản của bệnh nhân như họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ và thông tin liên hệ. Dữ liệu bệnh nhân được sử dụng trong đăng ký lịch khám, tiếp đón bệnh nhân và quản lý hồ sơ khám bệnh.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.
- Người dùng có quyền quản lý bệnh nhân.
- Hệ thống hoạt động bình thường.

Hậu điều kiện

- Thông tin bệnh nhân được lưu thành công vào hệ thống.
- Bệnh nhân có thể được sử dụng trong các chức năng đặt lịch khám và tiếp đón.
- Lịch sử thay đổi được ghi nhận.

Kích hoạt

Người dùng chọn chức năng "Quản lý bệnh nhân" từ menu hệ thống.

Luồng chính

1. Người dùng truy cập chức năng "Quản lý bệnh nhân".
2. Hệ thống hiển thị danh sách bệnh nhân.
3. Người dùng chọn "Thêm mới".
4. Hệ thống hiển thị form nhập thông tin bệnh nhân.
5. Người dùng nhập:
    - Họ và tên
    - Ngày sinh
    - Giới tính
    - Số điện thoại
    - Email (nếu có)
    - Địa chỉ
    - CCCD/CMND (nếu có)
6. Người dùng nhấn "Lưu".
7. Hệ thống kiểm tra dữ liệu hợp lệ.
8. Hệ thống tạo mã bệnh nhân tự động.
9. Lưu dữ liệu vào hệ thống.
10. Hiển thị thông báo thành công.

Luồng thay thế

A1. Cập nhật thông tin bệnh nhân

1. Người dùng chọn bệnh nhân cần chỉnh sửa.
2. Cập nhật thông tin.
3. Nhấn "Lưu".
4. Hệ thống cập nhật dữ liệu thành công.

A2. Tìm kiếm bệnh nhân

1. Người dùng nhập tên, mã bệnh nhân hoặc số điện thoại.
2. Hệ thống hiển thị danh sách phù hợp.

A3. Xem chi tiết bệnh nhân

1. Người dùng chọn bệnh nhân.
2. Hệ thống hiển thị toàn bộ thông tin hành chính của bệnh nhân.

A4. Khóa bệnh nhân

1. Người dùng chọn bệnh nhân.
2. Chọn "Ngưng hoạt động".
3. Hệ thống chuyển trạng thái bệnh nhân sang INACTIVE.
4. Không cho phép đăng ký lịch khám mới.

Luồng ngoại lệ

E1. Trùng số điện thoại với bệnh nhân đã tồn tại

1. Hệ thống phát hiện dữ liệu trùng.
2. Hiển thị cảnh báo.
3. Cho phép người dùng kiểm tra lại thông tin.

E2. Thiếu thông tin bắt buộc

1. Hệ thống hiển thị lỗi.
2. Không cho phép lưu.

E3. Định dạng số điện thoại không hợp lệ

1. Hệ thống hiển thị lỗi.
2. Yêu cầu nhập lại.

E4. Không đủ quyền truy cập

1. Hệ thống từ chối thao tác.

E5. Lỗi cơ sở dữ liệu

1. Hệ thống hiển thị thông báo lỗi.
2. Ghi log hệ thống.

Yêu cầu đặc biệt  

- Hỗ trợ tìm kiếm nhanh theo tên, mã bệnh nhân hoặc số điện thoại.
- Hỗ trợ phân trang dữ liệu.
- Hỗ trợ xuất danh sách bệnh nhân ra Excel/PDF.
- Hỗ trợ lưu lịch sử thay đổi thông tin bệnh nhân.
- Hỗ trợ liên kết với chức năng đăng ký lịch khám.

Quy tắc nghiệp vụ

- Mỗi bệnh nhân có một mã bệnh nhân duy nhất (Patient ID).
- Số điện thoại không được trùng giữa các bệnh nhân đang hoạt động.
- Họ tên và số điện thoại là thông tin bắt buộc.
- Ngày sinh không được lớn hơn ngày hiện tại.
- Không được xóa cứng bệnh nhân đã phát sinh lịch khám hoặc hồ sơ khám bệnh.
- Khi cần loại bỏ bệnh nhân khỏi hệ thống chỉ được chuyển trạng thái sang INACTIVE.
- Chỉ bệnh nhân ở trạng thái ACTIVE mới được đăng ký lịch khám mới.
- Mọi thay đổi thông tin bệnh nhân phải được ghi nhận lịch sử cập nhật.
