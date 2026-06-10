Đặc tả UC1.1 - Quản lý người dùng và phân quyền

Thuộc tính

Mô tả

Use Case ID

UC1.1

Use Case Name

Quản lý người dùng và phân quyền

Tác nhân chính

Quản trị viên (Admin)

Tác nhân liên quan

Lễ tân, Bác sĩ

Mô tả  

Chức năng cho phép quản trị viên tạo mới, chỉnh sửa, khóa/mở khóa tài khoản người dùng và phân quyền truy cập theo mô hình Role-Based Access Control (RBAC).

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền quản trị tài khoản.

- Hệ thống đã cấu hình các vai trò (Role).

Hậu điều kiện

- Tài khoản được tạo/cập nhật thành công.

- Quyền truy cập được gán đúng theo vai trò.

- Thông tin thao tác được ghi nhận vào audit log.

- Nếu tài khoản bị khóa thì người dùng không thể đăng nhập hệ thống.

Kích hoạt

Quản trị viên chọn chức năng “Quản lý người dùng” từ menu hệ thống.

Luồng chính

1. Admin truy cập chức năng “Quản lý người dùng”.

2. Hệ thống hiển thị danh sách tài khoản.

3. Admin chọn “Thêm tài khoản”.

4. Nhập thông tin tài khoản gồm:

    - Tên đăng nhập

    - Mật khẩu

    - Vai trò

    - Họ tên

    - Số điện thoại

    - Email

5. Admin nhấn “Lưu”.

6. Hệ thống kiểm tra dữ liệu hợp lệ.

7. Hệ thống tạo tài khoản mới.

8. Hệ thống thông báo tạo thành công.

Luồng thay thế

A1. Trùng username

1. Hệ thống phát hiện username đã tồn tại.
2. Hiển thị thông báo lỗi.
3. Yêu cầu nhập username khác.

A2. Thiếu thông tin bắt buộc

1. Hệ thống phát hiện thiếu dữ liệu.
2. Hiển thị cảnh báo.
3. Không cho phép lưu.

A3. Chỉnh sửa tài khoản

1. Admin chọn tài khoản cần chỉnh sửa.
2. Cập nhật thông tin hoặc vai trò.
3. Nhấn “Lưu”.
4. Hệ thống cập nhật dữ liệu thành công.

A4. Khóa tài khoản

1. Admin chọn tài khoản.
2. Nhấn “Khóa tài khoản”.
3. Hệ thống yêu cầu xác nhận.
4. Tài khoản chuyển sang trạng thái INACTIVE.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền quản trị.
2. Hệ thống từ chối truy cập chức năng.

E2. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể lưu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi log lỗi hệ thống.

Yêu cầu đặc biệt  

- Hệ thống phải mã hóa mật khẩu trước khi lưu.

- Hỗ trợ audit log cho toàn bộ thao tác tạo/sửa/khóa tài khoản.

- Hỗ trợ mở rộng đa vai trò trong tương lai.

- Giao diện phải hỗ trợ tìm kiếm và lọc tài khoản theo vai trò/trạng thái.

Quy tắc nghiệp vụ

- Username phải là duy nhất.

- Mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số.

- Không được xóa cứng tài khoản đã phát sinh dữ liệu.

- Một tài khoản chỉ có một vai trò chính tại thời điểm hiện tại.

- Phân quyền được thực hiện theo mô hình RBAC.

- Chỉ tài khoản ACTIVE mới được phép đăng nhập.

Giao diện minh họa

1. Giao diện quản lý người dùng:

2. Giao diện thêm người dùng:

3. Giao diện phân quyền người dùng.

Đặc tả UC1.2 - Quản lý bác sĩ  

Thuộc tính

Mô tả

Use Case ID

UC1.2

Use Case Name

Quản lý bác sĩ

Tác nhân chính

Admin, Quản lý  

Tác nhân liên quan

Bác sĩ, Lễ tân

Mô tả  

Chức năng cho phép quản lý thông tin bác sĩ trong hệ thống phòng khám nha khoa, bao gồm tạo mới, cập nhật, tra cứu và ngưng hoạt động bác sĩ. Thông tin bác sĩ được sử dụng cho đặt lịch khám, hồ sơ điều trị và báo cáo hệ thống.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền quản lý bác sĩ.

- Bác sĩ đã có tài khoản hệ thống để liên kết hồ sơ.

Hậu điều kiện

- Hồ sơ bác sĩ được tạo hoặc cập nhật thành công.

- Dữ liệu bác sĩ hiển thị trong hệ thống đặt lịch.

- Thông tin được lưu phục vụ tra cứu và báo cáo.

- Lịch sử thao tác được ghi nhận vào hệ thống.

Kích hoạt

Người dùng chọn chức năng “Quản lý bác sĩ” từ menu hệ thống.

Luồng chính

1. Người dùng truy cập chức năng “Quản lý bác sĩ”.

2. Hệ thống hiển thị danh sách bác sĩ.

3. Người dùng chọn “Thêm bác sĩ”.

4. Nhập thông tin bác sĩ gồm:

    - Họ và tên

    - Ngày sinh

    - Giới tính

    - Số điện thoại

    - Email

    - Địa chỉ

    - Chuyên khoa

    - Số chứng chỉ hành nghề

    - Bằng cấp/Kinh nghiệm

5. Upload ảnh đại diện hoặc chứng chỉ (nếu có).

6. Nhấn “Lưu”.

7. Hệ thống kiểm tra dữ liệu hợp lệ.

8. Hệ thống lưu thông tin bác sĩ.

9. Hiển thị thông báo thành công.

Luồng thay thế

A1. Thiếu thông tin bắt buộc

1. Hệ thống phát hiện thiếu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Yêu cầu nhập lại.

A2. Trùng số chứng chỉ hành nghề

1. Hệ thống phát hiện số chứng chỉ đã tồn tại.
2. Từ chối lưu dữ liệu.
3. Hiển thị cảnh báo cho người dùng.

A3. Xem chi tiết bác sĩ

1. Người dùng chọn bác sĩ từ danh sách.
2. Hệ thống hiển thị đầy đủ hồ sơ bác sĩ.

A4. Chỉnh sửa thông tin bác sĩ

1. Người dùng chọn bác sĩ cần chỉnh sửa.
2. Cập nhật thông tin.
3. Nhấn “Lưu”.
4. Hệ thống cập nhật dữ liệu thành công.

A5. Ngưng hoạt động bác sĩ

1. Người dùng chọn bác sĩ.
2. Nhấn “Ngưng hoạt động”.
3. Hệ thống yêu cầu xác nhận.
4. Trạng thái bác sĩ chuyển sang INACTIVE.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền quản lý bác sĩ.
2. Hệ thống từ chối truy cập chức năng.

E2. Upload file không hợp lệ

1. Người dùng upload file sai định dạng hoặc vượt dung lượng cho phép.
2. Hệ thống hiển thị lỗi.
3. Không cho phép lưu file.

E3. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể lưu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

Yêu cầu đặc biệt  

- Hỗ trợ upload ảnh đại diện và file chứng chỉ.

- Hỗ trợ tìm kiếm bác sĩ theo tên hoặc chuyên khoa.

- Hỗ trợ lọc bác sĩ theo trạng thái hoạt động.

- Ghi nhận lịch sử chỉnh sửa hồ sơ bác sĩ.

- Thông tin bác sĩ phải đồng bộ với hệ thống đặt lịch khám.

Quy tắc nghiệp vụ

- Mỗi bác sĩ phải có số chứng chỉ hành nghề duy nhất và hợp lệ.

- Hồ sơ bác sĩ phải liên kết với tài khoản hệ thống.

- Không được xóa bác sĩ đã phát sinh lịch hẹn hoặc hồ sơ điều trị.

- Khi cần loại bỏ bác sĩ chỉ được chuyển trạng thái INACTIVE.

- Chỉ bác sĩ ở trạng thái ACTIVE mới được hiển thị trong hệ thống đặt lịch.

- Email và số điện thoại phải đúng định dạng hợp lệ.

- Mỗi bác sĩ phải thuộc ít nhất một chuyên khoa.

Giao diện minh họa

1. Giao diện quản lý bác sĩ:  

2. Giao diện thêm bác sĩ:

Đặc tả UC1.3 - Quản lý danh mục dịch vụ

Thuộc tính

Mô tả

Use Case ID

UC1.3

Use Case Name

Quản lý danh mục dịch vụ

Tác nhân chính

Quản lý

Tác nhân liên quan

Admin

Mô tả  

Chức năng cho phép quản lý các dịch vụ nha khoa của phòng khám, bao gồm tạo mới, cập nhật, ngưng sử dụng và phân loại dịch vụ. Danh mục dịch vụ được sử dụng trong đặt lịch khám, lập hóa đơn, hồ sơ điều trị và báo cáo doanh thu.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền quản lý dịch vụ.

- Hệ thống đã có hoặc cho phép tạo nhóm dịch vụ.

Hậu điều kiện

- Dịch vụ được tạo mới hoặc cập nhật thành công.

- Dịch vụ hiển thị trong hệ thống đặt lịch và hóa đơn.

- Dữ liệu cũ không bị ảnh hưởng khi cập nhật giá.

- Lịch sử thay đổi được ghi nhận.

Kích hoạt

Người dùng chọn chức năng “Quản lý danh mục dịch vụ” từ menu hệ thống.

Luồng chính

1. Người dùng truy cập chức năng “Quản lý danh mục dịch vụ”.
2. Hệ thống hiển thị danh sách dịch vụ.
3. Người dùng chọn “Thêm dịch vụ”.
4. Nhập thông tin dịch vụ gồm:
    - Tên dịch vụ
    - Nhóm dịch vụ
    - Giá dịch vụ
    - Thời gian thực hiện
    - Mô tả
    - Trạng thái
5. Nhấn “Lưu”.
6. Hệ thống kiểm tra dữ liệu hợp lệ.
7. Hệ thống lưu thông tin dịch vụ.
8. Hiển thị thông báo thành công.

Luồng thay thế

A1. Trùng tên dịch vụ trong cùng nhóm

1. Hệ thống phát hiện tên dịch vụ đã tồn tại.
2. Hiển thị thông báo lỗi.
3. Yêu cầu nhập lại.

A2. Giá dịch vụ không hợp lệ

1. Người dùng nhập giá nhỏ hơn 0.
2. Hệ thống từ chối lưu.
3. Hiển thị cảnh báo.

A3. Chỉnh sửa dịch vụ

1. Người dùng chọn dịch vụ cần chỉnh sửa.
2. Cập nhật thông tin dịch vụ.
3. Nhấn “Lưu”.
4. Hệ thống cập nhật dữ liệu thành công.

A4. Ngưng sử dụng dịch vụ

1. Người dùng chọn dịch vụ.
2. Nhấn “Ngưng sử dụng”.
3. Hệ thống yêu cầu xác nhận.
4. Dịch vụ chuyển sang trạng thái INACTIVE.
5. Dịch vụ bị ẩn khỏi hệ thống đặt lịch.

Luồng ngoại lệ

E1. Không đủ quyền truy cập

1. Người dùng không có quyền quản lý dịch vụ.
2. Hệ thống từ chối thao tác.

E2. Thiếu thông tin bắt buộc

1. Hệ thống phát hiện thiếu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Không cho phép lưu.

E3. Lỗi hệ thống hoặc cơ sở dữ liệu

1. Hệ thống không thể lưu dữ liệu.
2. Hiển thị thông báo lỗi.
3. Ghi nhận log lỗi hệ thống.

Yêu cầu đặc biệt  

- Hỗ trợ tìm kiếm và lọc dịch vụ theo nhóm hoặc trạng thái.
- Hỗ trợ lưu lịch sử thay đổi giá dịch vụ.
- Dịch vụ phải đồng bộ với hệ thống đặt lịch và hóa đơn.
- Giao diện phải hỗ trợ phân trang và tìm kiếm nhanh.
- Hệ thống phải hỗ trợ mở rộng thêm nhóm dịch vụ mới.

Quy tắc nghiệp vụ

- Tên dịch vụ không được trùng trong cùng một nhóm dịch vụ.
- Giá dịch vụ phải lớn hơn hoặc bằng 0.
- Thời gian thực hiện phải lớn hơn 0 phút.
- Chỉ dịch vụ ở trạng thái ACTIVE mới được sử dụng trong đặt lịch và hóa đơn.
- Không được xóa cứng dịch vụ đã phát sinh dữ liệu liên quan.
- Khi cần loại bỏ dịch vụ chỉ được chuyển trạng thái INACTIVE.
- Việc thay đổi giá dịch vụ không được ảnh hưởng dữ liệu hóa đơn cũ.
- Mỗi dịch vụ phải thuộc một nhóm dịch vụ.
- Mỗi dịch vụ phải có mã định danh duy nhất (Service ID).
- Hệ thống phải lưu lịch sử thay đổi thông tin dịch vụ.

Giao diện minh họa

1. Giao diện quản lý danh mục dịch vụ:  

2. Giao diện thêm dịch vụ:

Đặc tả UC1.4 - Thiết lập giá dịch vụ

Thuộc tính

Mô tả

Use Case ID

UC1.4

Use Case Name

Thiết lập giá dịch vụ

Tác nhân chính

Quản lý

Tác nhân liên quan

Admin

Mô tả  

Chức năng cho phép quản lý khai báo, cập nhật và quản lý giá của các dịch vụ khám chữa bệnh tại phòng khám. Giá dịch vụ được sử dụng trong quá trình đăng ký khám, lập hóa đơn, thanh toán và thống kê doanh thu.

Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.

- Người dùng có quyền quản lý danh mục dịch vụ.

- Hệ thống đã tồn tại ít nhất một dịch vụ khám chữa bệnh.

Hậu điều kiện

- Giá dịch vụ được lưu vào hệ thống.

- Lịch sử thay đổi giá được ghi nhận.

- Giá mới được sử dụng cho các lần đăng ký khám sau thời điểm cập nhật.

Kích hoạt

Quản lý lựa chọn chức năng "Thiết lập giá dịch vụ".

Luồng chính

1. Quản lý truy cập chức năng "Thiết lập giá dịch vụ".
2. Hệ thống hiển thị danh sách dịch vụ hiện có.
3. Quản lý chọn một dịch vụ cần thiết lập giá.
4. Hệ thống hiển thị thông tin chi tiết dịch vụ.
5. Quản lý nhập hoặc cập nhật giá dịch vụ.
6. Quản lý nhập ngày hiệu lực của mức giá.
7. Nhấn nút "Lưu".
8. Hệ thống kiểm tra tính hợp lệ của dữ liệu.
9. Hệ thống lưu thông tin giá dịch vụ.
10. Hệ thống ghi nhận lịch sử thay đổi giá.
11. Thông báo cập nhật thành công.

Luồng thay thế

A1. Thêm mới giá dịch vụ

1. Quản lý chọn "Thêm mới".
2. Chọn dịch vụ cần áp dụng.
3. Nhập mức giá và ngày hiệu lực.
4. Lưu thông tin.

A2. Cập nhật giá hàng loạt

1. Quản lý chọn nhiều dịch vụ.
2. Nhập tỷ lệ tăng/giảm giá.
3. Hệ thống tự động cập nhật giá mới.

A3. Xem lịch sử thay đổi giá

1. Quản lý chọn một dịch vụ.
2. Chọn "Xem lịch sử giá".
3. Hệ thống hiển thị các lần thay đổi giá trước đây.

Luồng ngoại lệ

E1. Giá dịch vụ nhỏ hơn hoặc bằng 0

- Hệ thống hiển thị thông báo lỗi.
- Không cho phép lưu.

E2. Ngày hiệu lực không hợp lệ

- Hệ thống yêu cầu nhập lại.

E3. Dịch vụ không tồn tại

- Hệ thống hiển thị thông báo lỗi.

E4. Trùng khoảng thời gian hiệu lực

- Hệ thống cảnh báo và không cho phép lưu.

E5. Lỗi cơ sở dữ liệu

- Hiển thị thông báo lỗi hệ thống.
- Ghi log lỗi.

Yêu cầu đặc biệt  

- Hỗ trợ quản lý lịch sử giá dịch vụ.
- Hỗ trợ tìm kiếm theo tên dịch vụ.
- Hỗ trợ lọc theo nhóm dịch vụ.
- Hỗ trợ xuất danh sách giá dịch vụ ra Excel/PDF.
- Đảm bảo dữ liệu giá được lưu chính xác đến đơn vị đồng.

Quy tắc nghiệp vụ

- Mỗi dịch vụ phải có ít nhất một mức giá hiệu lực.
- Giá dịch vụ phải lớn hơn 0.
- Tại một thời điểm chỉ có một mức giá đang hiệu lực cho mỗi dịch vụ.
- Khi thay đổi giá, hệ thống phải lưu lịch sử giá cũ.
- Giá đã sử dụng trong hóa đơn hoặc phiếu khám trước đó không được thay đổi hồi tố.
- Giá mới chỉ áp dụng cho các lần đăng ký khám từ ngày hiệu lực trở đi.
- Chỉ người có quyền quản lý mới được phép thay đổi giá dịch vụ.
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
