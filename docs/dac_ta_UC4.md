Đặc tả UC4.1 - Thiết lập mức tiền cơ bản cho một giờ
Thuộc tính
Mô tả
Use Case ID
UC4.1
Use Case Name
Thiết lập mức tiền cơ bản cho một giờ
Tác nhân chính
Quản lý
Tác nhân liên quan
Admin
Mô tả  
Chức năng cho phép quản lý phòng khám thiết lập mức tiền cơ bản trả cho một giờ làm thêm của bác sĩ. Mức tiền này là tham số đầu vào quan trọng trong công thức tính lương. Hệ thống lưu lại lịch sử thay đổi để phục vụ kiểm tra và đối soát sau này.
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.
- Có quyền quản lý tiền lương.
- Hệ thống đang hoạt động bình thường.
Hậu điều kiện
- Mức tiền cơ bản được lưu thành công vào hệ thống.
- Các lần tính lương sau sẽ sử dụng mức tiền mới theo thời gian hiệu lực.
- Lịch sử thay đổi được ghi nhận.
Kích hoạt
Quản lý muốn thiết lập mới hoặc thay đổi mức tiền cơ bản cho một giờ làm việc.
Luồng chính

1. Quản lý truy cập chức năng "Thiết lập mức tiền cơ bản".
2. Hệ thống hiển thị danh sách các mức tiền đã được khai báo.
3. Quản lý chọn "Thêm mới".
4. Hệ thống hiển thị form nhập liệu.
5. Quản lý nhập các thông tin:
    - Mức tiền cơ bản (VNĐ/giờ)
    - Ngày áp dụng
    - Ngày kết thúc hiệu lực (nếu có)
    - Ghi chú
6. Quản lý nhấn nút "Lưu".
7. Hệ thống kiểm tra dữ liệu hợp lệ.
8. Hệ thống lưu thông tin vào cơ sở dữ liệu.
9. Hệ thống ghi log thay đổi.
10. Thông báo lưu thành công.
Luồng thay thế
A1. Chỉnh sửa mức tiền hiện có
11. Quản lý chọn một mức tiền trong danh sách.
12. Chọn "Chỉnh sửa".
13. Hệ thống hiển thị thông tin hiện tại.
14. Quản lý cập nhật thông tin.
15. Hệ thống lưu thay đổi và ghi nhận lịch sử cập nhật.
A2. Ngừng áp dụng mức tiền
16. Quản lý chọn mức tiền cần ngừng áp dụng.
17. Chọn "Ngừng hiệu lực".
18. Hệ thống cập nhật trạng thái INACTIVE.
19. Mức tiền không còn được sử dụng trong các lần tính lương tiếp theo.
A3. Thiết lập mức tiền tương lai
20. Quản lý nhập ngày áp dụng trong tương lai.
21. Hệ thống lưu trạng thái PENDING.
22. Khi đến ngày hiệu lực, hệ thống tự động kích hoạt mức tiền mới.
Luồng ngoại lệ
E1. Mức tiền nhỏ hơn hoặc bằng 0

- Hệ thống hiển thị thông báo: "Mức tiền phải lớn hơn 0".
- Không cho phép lưu.
E2. Ngày áp dụng không hợp lệ
- Hiển thị thông báo lỗi.
- Yêu cầu nhập lại.
E3. Trùng khoảng thời gian hiệu lực
- Hệ thống cảnh báo tồn tại mức tiền khác trong cùng khoảng thời gian.
- Không cho phép lưu.
E4. Lỗi cơ sở dữ liệu
- Hiển thị thông báo lỗi hệ thống.
- Ghi log lỗi.
Yêu cầu đặc biệt
- Hệ thống phải lưu lịch sử thay đổi mức tiền.
- Hỗ trợ tra cứu mức tiền theo thời gian.
- Chỉ người có quyền quản lý lương mới được thay đổi dữ liệu.
- Dữ liệu tiền tệ hiển thị theo định dạng VNĐ.
- Có chức năng tìm kiếm và lọc dữ liệu theo ngày hiệu lực.
Quy tắc nghiệp vụ
- Tại một thời điểm chỉ được tồn tại duy nhất một mức tiền cơ bản đang có hiệu lực.
- Mức tiền cơ bản phải lớn hơn 0.
- Không được xóa mức tiền đã từng được sử dụng để tính lương.
- Mọi thay đổi phải được ghi nhận lịch sử (người sửa, thời gian sửa, giá trị cũ, giá trị mới).
- Các phiếu lương đã lập trước đó không bị ảnh hưởng bởi việc thay đổi mức tiền hiện tại.
- Hệ thống sử dụng mức tiền có hiệu lực tại thời điểm ca làm việc diễn ra để tính lương.
Giao diện minh họa

1. Giao diện thiết lập mức tiền (ví dụ):
Bên trái (Menu chức năng)
Tính lương bác sĩ
    ├── UC4.1 Thiết lập mức tiền cơ bản
    ├── UC4.2 Thiết lập hệ số ca làm việc
    ├── UC4.3 Nhập hệ số ca phức tạp
    ├── UC4.4 Lập phiếu lương
    ├── UC4.5 Báo cáo lương tháng
    ├── UC4.6 Báo cáo lương năm theo bác sĩ
    └── UC4.7 Báo cáo lương năm toàn bộ bác sĩ

### Bên phải – Giao diện danh sách mức tiền cơ bản

Đặc tả UC4.2 - Thiết lập hệ số ca làm việc các ngày trong tuần  
Thuộc tính
Mô tả
Use Case ID
UC4.2
Use Case Name
Thiết lập hệ số ca làm việc các ngày trong tuần
Tác nhân chính
Quản lý
Tác nhân liên quan
Admin
Mô tả  
Chức năng cho phép quản lý khai báo hệ số ca làm việc áp dụng cho từng loại ca, từng ngày trong tuần hoặc các ngày đặc biệt (ngày lễ, ngày nghỉ bù, ngoài giờ hành chính). Hệ số này được sử dụng trong công thức tính số giờ quy đổi khi tính lương bác sĩ.
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.
- Có quyền quản lý tiền lương.
- Đã tồn tại danh sách ca làm việc từ nhóm chức năng Quản lý lịch khám (Ca sáng, Ca chiều, Ca tối...).
Hậu điều kiện
- Hệ số ca làm việc được lưu thành công.
- Hệ thống sử dụng hệ số mới khi tính lương các ca phát sinh trong thời gian hiệu lực.
- Lịch sử thay đổi được ghi nhận.
Kích hoạt
Quản lý muốn thiết lập hoặc thay đổi hệ số lương cho các ca làm việc trong tuần.
Luồng chính

1. Quản lý truy cập chức năng "Thiết lập hệ số ca làm việc".
2. Hệ thống hiển thị danh sách hệ số hiện tại.
3. Quản lý chọn "Thêm mới".
4. Hệ thống hiển thị form nhập liệu.
5. Quản lý nhập các thông tin:
    - Loại ngày áp dụng
    - Ca làm việc
    - Hệ số ca làm việc
    - Ngày áp dụng
    - Ngày kết thúc hiệu lực (nếu có)
    - Ghi chú
6. Nhấn "Lưu".
7. Hệ thống kiểm tra tính hợp lệ.
8. Lưu dữ liệu vào cơ sở dữ liệu.
9. Hệ thống ghi log thay đổi.
10. Thông báo thành công.
Luồng thay thế
A1. Chỉnh sửa hệ số ca
11. Chọn một hệ số trong danh sách.
12. Nhấn "Chỉnh sửa".
13. Cập nhật thông tin.
14. Hệ thống lưu thay đổi và ghi nhận lịch sử.
A2. Sao chép hệ số từ cấu hình cũ
15. Chọn một cấu hình đã tồn tại.
16. Chọn "Sao chép".
17. Chỉnh sửa thông tin cần thay đổi.
18. Lưu cấu hình mới.
A3. Ngừng áp dụng hệ số
19. Chọn cấu hình cần ngừng áp dụng.
20. Nhấn "Ngừng hiệu lực".
21. Hệ thống cập nhật trạng thái INACTIVE.
22. Cấu hình không còn được sử dụng trong các lần tính lương tiếp theo.
Luồng ngoại lệ
E1. Hệ số nhỏ hơn 1.0

- Hệ thống hiển thị lỗi.
- Không cho phép lưu.
E2. Trùng cấu hình
- Đã tồn tại hệ số cho cùng loại ngày và cùng ca làm việc.
- Hệ thống từ chối lưu.
E3. Thiếu thông tin bắt buộc
- Hiển thị danh sách lỗi validation.
E4. Ngày hiệu lực không hợp lệ
- Không cho phép lưu.
E5. Lỗi hệ thống
- Ghi log lỗi và thông báo cho người dùng.
Yêu cầu đặc biệt  
- Cho phép quản lý hệ số theo từng loại ngày.
- Hỗ trợ thiết lập hiệu lực theo thời gian.
- Có chức năng xem lịch sử thay đổi.
- Cho phép tìm kiếm và lọc dữ liệu.
- Hỗ trợ xuất danh sách cấu hình ra Excel/PDF.
Quy tắc nghiệp vụ
- Hệ số ca làm việc phải ≥ 1.0.
- Tại cùng một thời điểm chỉ được tồn tại một hệ số hiệu lực cho mỗi cặp (Loại ngày, Ca làm việc).
- Không được xóa cấu hình đã từng được sử dụng để tính lương.
- Mọi thay đổi phải được lưu lịch sử.
- Hệ số ca làm việc được sử dụng trong công thức:
Số giờ quy đổi = Số giờ mỗi ca × (Hệ số ca làm việc + Tổng hệ số bệnh nhân).
- Ngày lễ có thể có hệ số cao hơn ngày thường.
- Ca ngoài giờ hành chính có thể có hệ số cao hơn ca trong giờ hành chính.
Giao diện minh họa

1. Giao diện thiết lập hệ số ca làm việc:

### Bên trái (Menu phân cấp 2 mức)

📂 Tính lương bác sĩ
    ├── UC4.1 Thiết lập mức tiền cơ bản
    ├── UC4.2 Thiết lập hệ số ca làm việc
    ├── UC4.3 Nhập hệ số ca phức tạp
    ├── UC4.4 Lập phiếu lương
    ├── UC4.5 Báo cáo lương tháng
    ├── UC4.6 Báo cáo lương năm theo bác sĩ
    └── UC4.7 Báo cáo lương năm toàn bộ bác sĩ

### Bên phải – Giao diện danh sách hệ số ca làm việc

- Bảng thiết lập hệ số ca làm việc mẫu (hỏi cô cách thiết lập hệ số):  
Loại ngày
Ca làm việc
Hệ số
Ngày thường (trong giờ hành chính)
Ca sáng
1.0
Ngày thường (trong giờ hành chính)
Ca chiều
1.0
Ngày thường (ngoài giờ)
Ca tối
1.2
Thứ 7  
Ca sáng
1.3
Thứ 7
Ca chiều
1.3
Thứ 7
Ca tối
1.5
Chủ nhật
Ca sáng
1.3
Chủ nhật
Ca chiều
1.3
Chủ nhật
Ca tối
1.5
Ngày lễ
Ca sáng
2.0
Ngày lễ
Ca chiều
2.0
Ngày lễ
Ca tối
2.0

Đặc tả UC4.3 - Nhập hệ số các ca cần xử lý phức tạp trong tháng
Thuộc tính
Mô tả
Use Case ID
UC4.3
Use Case Name
Nhập hệ số các ca cần xử lý phức tạp trong tháng
Tác nhân chính
Quản lý  
Tác nhân liên quan
Bác sĩ
Mô tả  
Chức năng cho phép quản lý hoặc người được phân quyền nhập và quản lý hệ số mức độ phức tạp của các ca bệnh mà bác sĩ đã xử lý trong tháng. Hệ số này được cộng dồn vào hệ số bệnh nhân của từng ca làm việc để tính số giờ quy đổi và lương làm thêm cho bác sĩ.
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.
- Có quyền quản lý tính lương.
- Đã tồn tại lịch khám và hồ sơ khám của bệnh nhân.
- Bác sĩ đã hoàn thành khám bệnh cho bệnh nhân.
Hậu điều kiện
- Hệ số độ phức tạp được lưu vào hệ thống.
- Dữ liệu được sử dụng để tính lương bác sĩ.
- Lịch sử cập nhật được ghi nhận.
Kích hoạt
Sau khi kết thúc khám bệnh hoặc cuối tháng khi thực hiện tổng hợp dữ liệu tính lương.
Luồng chính

1. Quản lý truy cập chức năng "Nhập hệ số ca phức tạp".
2. Hệ thống hiển thị danh sách các ca khám trong tháng.
3. Quản lý chọn một ca khám cần cập nhật.
4. Hệ thống hiển thị thông tin:
    - Bác sĩ thực hiện
    - Bệnh nhân
    - Ngày khám
    - Dịch vụ điều trị
    - Mức độ hiện tại
5. Quản lý nhập hệ số độ phức tạp.
6. Nhấn "Lưu".
7. Hệ thống kiểm tra dữ liệu hợp lệ.
8. Hệ thống lưu hệ số vào cơ sở dữ liệu.
9. Hệ thống cập nhật tổng hệ số bệnh nhân của ca làm việc tương ứng.
10. Thông báo lưu thành công.
Luồng thay thế
A1. Nhập hàng loạt theo danh sách bệnh nhân
11. Quản lý chọn "Nhập hàng loạt".
12. Hệ thống hiển thị danh sách các ca khám chưa đánh giá.
13. Quản lý nhập hệ số cho nhiều bệnh nhân.
14. Nhấn "Lưu tất cả".
A2. Hệ thống tự động đề xuất hệ số
15. Hệ thống dựa trên loại dịch vụ điều trị.
16. Đề xuất hệ số mặc định.
17. Quản lý xác nhận hoặc điều chỉnh.
A3. Chỉnh sửa hệ số đã nhập
18. Chọn bản ghi cần sửa.
19. Cập nhật hệ số mới.
20. Hệ thống ghi nhận lịch sử thay đổi.
Luồng ngoại lệ
E1. Hệ số ngoài khoảng cho phép

- Hệ thống hiển thị lỗi.
- Không cho phép lưu.
E2. Không tìm thấy hồ sơ khám
- Hiển thị thông báo lỗi.
E3. Ca khám chưa hoàn tất
- Không cho phép nhập hệ số.
E4. Lỗi cơ sở dữ liệu
- Hiển thị thông báo lỗi hệ thống.
- Ghi log lỗi.
Yêu cầu đặc biệt  
- Hỗ trợ nhập dữ liệu hàng loạt.
- Có khả năng truy xuất lịch sử chỉnh sửa.
- Cho phép lọc dữ liệu theo bác sĩ, tháng, chuyên khoa.
- Hiển thị tổng hệ số đã cộng dồn theo từng ca làm việc.
- Hỗ trợ xuất dữ liệu Excel/PDF.
Quy tắc nghiệp vụ
- Hệ số độ phức tạp của một bệnh nhân có giá trị từ 0 đến 0.5.
- Bệnh nhân thông thường có hệ số bằng 0.
- Chỉ những ca khám COMPLETED mới được nhập hệ số.
- Tổng hệ số bệnh nhân của một ca làm việc bằng tổng hệ số của tất cả bệnh nhân được khám trong ca đó.
- Hệ số đã sử dụng để lập phiếu lương không được sửa trực tiếp, phải thực hiện quy trình điều chỉnh lương.
- Mọi thay đổi phải được lưu lịch sử
- Hệ số bệnh nhân được sử dụng trong công thức:
Số giờ quy đổi = Số giờ mỗi ca × (Hệ số ca làm việc + Tổng hệ số bệnh nhân).
Giao diện minh họa

1. Giao diện nhập hệ số ca phức tạp:

### Bên trái (Menu phân cấp 2 mức)

📂 Tính lương bác sĩ
    ├── UC4.1 Thiết lập mức tiền cơ bản
    ├── UC4.2 Thiết lập hệ số ca làm việc
    ├── UC4.3 Nhập hệ số ca phức tạp
    ├── UC4.4 Lập phiếu lương
    ├── UC4.5 Báo cáo lương tháng
    ├── UC4.6 Báo cáo lương năm theo bác sĩ
    └── UC4.7 Báo cáo lương năm toàn bộ bác sĩ

### Bên phải – Giao diện danh sách ca bệnh phức tạp

- Bảng thiết lập hệ số ca làm việc mẫu (hỏi cô cách thiết lập hệ số):  
Bệnh nhân
Dịch vụ
Hệ số
Khám định kỳ
Kiểm tra tổng quát
0.0
Trám răng sâu
Điều trị thông thường
0.1
Nhổ răng khôn
Tiểu phẫu
0.3
Điều trị tủy
Điều trị phức tạp
0.4
Cấy Implant
Điều trị chuyên sâu
0.5

Đặc tả UC4.4 - Lập phiếu lương cho một bác sĩ trong 1 tháng
Thuộc tính
Mô tả
Use Case ID
UC4.4
Use Case Name
Lập phiếu lương cho một bác sĩ trong 1 tháng
Tác nhân chính
Quản lý
Tác nhân liên quan
Admin, Kế toán
Mô tả  
Chức năng cho phép quản lý lập phiếu lương hàng tháng cho một bác sĩ dựa trên số giờ làm việc, hệ số ca làm việc, hệ số ca phức tạp và mức tiền cơ bản đã được thiết lập trong hệ thống.
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.  
- Có quyền lập phiếu lương.  
- Đã có dữ liệu chấm công, ca làm việc của bác sĩ trong tháng.  
- Đã thiết lập mức tiền cơ bản và các hệ số liên quan.
Hậu điều kiện
- Phiếu lương được tạo thành công.  
- Dữ liệu được lưu vào cơ sở dữ liệu.  
- Có thể sử dụng để thống kê và báo cáo sau này.
Kích hoạt
Quản lý muốn lập phiếu lương cho bác sĩ vào cuối tháng.
Luồng chính
Quản lý truy cập chức năng "Lập phiếu lương".
Hệ thống hiển thị giao diện chọn bác sĩ và tháng tính lương.
Quản lý chọn bác sĩ.
Quản lý chọn tháng và năm cần lập lương.
Quản lý nhấn nút "Tính lương".
Hệ thống truy xuất dữ liệu ca làm việc của bác sĩ.
Hệ thống tính tổng số giờ làm việc.
Hệ thống áp dụng mức tiền cơ bản và các hệ số.
Hệ thống tính tổng lương.
Hệ thống hiển thị phiếu lương.
Quản lý xác nhận lưu phiếu lương.
Hệ thống lưu dữ liệu vào cơ sở dữ liệu.
Hệ thống thông báo lập phiếu thành công.
Luồng thay thế
A1. Chỉnh sửa phiếu lương trước khi lưu
Quản lý thay đổi thông tin ghi chú hoặc phụ cấp.
Hệ thống cập nhật lại kết quả tính toán.
Hiển thị phiếu lương mới.
A2. In phiếu lương
Quản lý chọn "In phiếu lương".
Hệ thống hiển thị bản xem trước.
Quản lý xác nhận in.
A3. Xuất PDF
Quản lý chọn "Xuất PDF".
Hệ thống tạo file PDF.
Cho phép tải file về máy.
Luồng ngoại lệ
E1. Chưa chọn bác sĩ
Hệ thống thông báo: "Vui lòng chọn bác sĩ".
E2. Chưa chọn tháng tính lương
Hệ thống thông báo: "Vui lòng chọn tháng tính lương".
E3. Không có dữ liệu ca làm việc
Hệ thống thông báo: "Không có dữ liệu làm việc trong tháng được chọn".
E4. Phiếu lương đã tồn tại
Hệ thống cảnh báo phiếu lương đã được lập trước đó.
Không cho phép tạo trùng.
E5. Lỗi cơ sở dữ liệu
Hệ thống hiển thị lỗi và ghi log.
Yêu cầu đặc biệt  
Hỗ trợ in và xuất PDF.
Chỉ người có quyền quản lý lương mới được lập phiếu.
Lưu lịch sử tạo và chỉnh sửa phiếu lương.
Hiển thị tiền tệ theo định dạng VNĐ.
Quy tắc nghiệp vụ
Mỗi bác sĩ chỉ có một phiếu lương trong một tháng.
Không được sửa phiếu lương đã khóa hoặc đã thanh toán.
Công thức tính lương phải sử dụng mức tiền cơ bản và hệ số có hiệu lực tại thời điểm làm việc.
Mọi thay đổi phải được ghi log.
Giao diện minh họa
Bên phải hiển thị:
Chọn bác sĩ
Chọn tháng/năm
Nút "Tính lương"
Nút "Lưu"
Nút "In"
Nút "Xuất PDF"
Thông tin phiếu lương:
Mã phiếu lương
Tên bác sĩ
Tổng giờ làm việc
Tổng số ca
Hệ số áp dụng
Tổng lương
Ghi chú

Đặc tả UC4.5 - Báo cáo tiền lương tất cả bác sĩ trong 1 tháng  
Thuộc tính
Mô tả
Use Case ID
UC4.5
Use Case Name
Báo cáo tiền lương tất cả bác sĩ trong 1 tháng
Tác nhân chính
Quản lý
Tác nhân liên quan
Admin, Kế toán
Mô tả  
Chức năng cho phép quản lý xem báo cáo tổng hợp tiền lương của tất cả bác sĩ trong một tháng. Báo cáo giúp theo dõi chi phí tiền lương, hiệu suất làm việc và phục vụ công tác quản lý tài chính.
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.  
- Có quyền xem báo cáo lương.  
- Các phiếu lương tháng đã được lập.
Hậu điều kiện
- Báo cáo được hiển thị thành công.  
- Có thể in hoặc xuất báo cáo.
Kích hoạt
Quản lý muốn xem tổng hợp lương của tất cả bác sĩ trong một tháng.
Luồng chính
Quản lý truy cập chức năng "Báo cáo lương tháng".
Hệ thống hiển thị giao diện chọn tháng và năm.
Quản lý chọn tháng cần xem.
Quản lý nhấn "Xem báo cáo".
Hệ thống truy xuất dữ liệu phiếu lương.
Hệ thống tổng hợp lương của tất cả bác sĩ.
Hệ thống tính tổng chi phí lương toàn phòng khám.
Hệ thống hiển thị báo cáo.
Quản lý xem, in hoặc xuất báo cáo.
Luồng thay thế
Luồng ngoại lệ
E1. Chưa chọn tháng báo cáo
Hệ thống hiển thị thông báo lỗi.
E2. Không có dữ liệu lương
Hệ thống hiển thị thông báo: "Không có dữ liệu lương trong tháng được chọn".
E3. Người dùng không có quyền truy cập
Hệ thống từ chối truy cập.
E4. Lỗi cơ sở dữ liệu
Hiển thị lỗi hệ thống.
Ghi log lỗi.
Yêu cầu đặc biệt  
Hỗ trợ xuất Excel, PDF.
Hỗ trợ in trực tiếp.
Hỗ trợ tìm kiếm bác sĩ.
Dữ liệu hiển thị theo VNĐ.
Chỉ người có quyền được xem báo cáo.
Quy tắc nghiệp vụ
Chỉ tính các phiếu lương hợp lệ.
Không tính các phiếu lương bị hủy.
Tổng chi phí lương bằng tổng lương của tất cả bác sĩ trong tháng.
Dữ liệu báo cáo chỉ mang tính tham khảo, không được chỉnh sửa trực tiếp.
Giao diện minh họa
Bộ lọc:
Tháng
Năm
Tên bác sĩ
Nút "Xem báo cáo"
Nút "Xuất Excel"
Nút "Xuất PDF"
Nút "In"
Bảng báo cáo

Đặc tả UC4.6 - Báo cáo tiền lương của một bác sĩ trong một năm
Thuộc tính
Mô tả
Use Case ID
UC4.6
Use Case Name
Báo cáo tiền lương của một bác sĩ trong một năm
Tác nhân chính
Quản lý
Tác nhân liên quan
Admin, Kế toán
Mô tả  
Chức năng cho phép quản lý xem báo cáo tiền lương của một bác sĩ trong một năm. Báo cáo thể hiện chi tiết tiền lương theo từng tháng, tổng số giờ làm việc, số ca làm việc, các khoản phụ cấp, khấu trừ và tổng lương năm của bác sĩ được chọn.
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.  
- Có quyền xem báo cáo tiền lương.  
- Bác sĩ đã có dữ liệu lương trong hệ thống.  
- Hệ thống đang hoạt động bình thường.
Hậu điều kiện
- Báo cáo lương năm của bác sĩ được hiển thị thành công.  
- Người dùng có thể xem, in hoặc xuất báo cáo.  
- Thao tác xem báo cáo được ghi nhận nếu hệ thống yêu cầu lưu lịch sử.
Kích hoạt
Quản lý muốn xem tổng hợp tiền lương của một bác sĩ trong một năm để phục vụ đánh giá hiệu suất, kiểm tra hoặc đối soát tiền lương.
Luồng chính
Quản lý truy cập chức năng "Báo cáo lương năm theo bác sĩ".
Hệ thống hiển thị giao diện tìm kiếm bác sĩ và chọn năm báo cáo.
Quản lý chọn bác sĩ cần xem.
Quản lý chọn năm báo cáo.
Quản lý nhấn nút "Xem báo cáo".
Hệ thống kiểm tra dữ liệu đầu vào.
Hệ thống truy xuất các phiếu lương của bác sĩ trong năm được chọn.
Hệ thống tổng hợp dữ liệu lương theo từng tháng.
Hệ thống tính tổng số ca làm việc, tổng số giờ làm, tổng phụ cấp, tổng khấu trừ và tổng lương năm.
Hệ thống hiển thị báo cáo chi tiết.
Quản lý xem thông tin và có thể in hoặc xuất báo cáo.
Luồng thay thế
A1. Tìm kiếm bác sĩ
Quản lý nhập mã hoặc tên bác sĩ.
Hệ thống hiển thị danh sách bác sĩ phù hợp.
Quản lý chọn bác sĩ cần xem báo cáo.
A2. Xem chi tiết lương từng tháng
Quản lý chọn một tháng trong báo cáo.
Hệ thống hiển thị chi tiết số ca làm việc, số giờ làm việc và tiền lương của tháng đó.
A3. Xuất báo cáo ra file
Quản lý chọn "Xuất Excel" hoặc "Xuất PDF".
Hệ thống tạo báo cáo theo định dạng tương ứng.
Hệ thống cho phép tải file về máy.
A4. In báo cáo
Quản lý chọn chức năng "In báo cáo".
Hệ thống hiển thị bản xem trước.
Quản lý xác nhận in.
Hệ thống gửi dữ liệu đến máy in.
Luồng ngoại lệ
E1. Chưa chọn bác sĩ
Hệ thống hiển thị thông báo: "Vui lòng chọn bác sĩ".
Không thực hiện truy xuất dữ liệu.
E2. Chưa chọn năm báo cáo
Hệ thống hiển thị thông báo: "Vui lòng chọn năm báo cáo".
Không thực hiện truy xuất dữ liệu.
E3. Không tìm thấy dữ liệu lương
Hệ thống hiển thị thông báo: "Không có dữ liệu lương của bác sĩ trong năm đã chọn".
Bảng báo cáo hiển thị rỗng.
E4. Người dùng không có quyền truy cập
Hệ thống hiển thị thông báo: "Bạn không có quyền xem báo cáo này".
Không cho phép truy cập dữ liệu.
E5. Lỗi cơ sở dữ liệu
Hệ thống hiển thị thông báo lỗi hệ thống.
Ghi log lỗi phục vụ kiểm tra kỹ thuật.
Yêu cầu đặc biệt  
Chỉ người có quyền quản lý lương hoặc quản trị hệ thống được xem báo cáo.
Dữ liệu tiền tệ hiển thị theo định dạng VNĐ.
Hỗ trợ tìm kiếm bác sĩ theo mã hoặc họ tên.
Hỗ trợ xuất báo cáo ra Excel và PDF.
Hỗ trợ in báo cáo trực tiếp.
Dữ liệu phải được cập nhật theo các phiếu lương đã được lưu trong hệ thống.
Quy tắc nghiệp vụ
Báo cáo chỉ tổng hợp các phiếu lương thuộc năm được chọn.
Chỉ tính các phiếu lương có trạng thái APPROVED hoặc PAID.
Không tính các phiếu lương đã bị hủy.
Tổng lương năm bằng tổng lương của 12 tháng trong năm.
Người dùng phải có quyền xem báo cáo lương mới được truy cập chức năng.
Dữ liệu lương đã khóa hoặc đã thanh toán không được chỉnh sửa từ màn hình báo cáo.
Báo cáo chỉ hiển thị thông tin của bác sĩ được chọn.
Giao diện minh họa

Đặc tả UC4.7 - Báo cáo tiền lương tất cả bác sĩ trong 1 năm  
Thuộc tính
Mô tả
Use Case ID
UC 4.7
Use Case Name
Báo cáo tiền lương tất cả bác sĩ trong 1 năm
Tác nhân chính
Quản lý
Tác nhân liên quan
Admin, Kế toán
Mô tả  
Chức năng cho phép quản lý xem báo cáo tổng hợp tiền lương của tất cả bác sĩ trong một năm. Báo cáo giúp theo dõi tổng số ca làm việc, số giờ làm, hệ số ca, hệ số phức tạp, tổng lương từng tháng và tổng lương cả năm của từng bác sĩ.  
Tiền điều kiện

- Người dùng đã đăng nhập hệ thống.  
- Có quyền xem báo cáo tiền lương.  
- Dữ liệu lương của bác sĩ trong năm đã được hệ thống ghi nhận.  
- Hệ thống đang hoạt động bình thường.  
Hậu điều kiện
- Báo cáo lương năm được hiển thị thành công.  
- Người dùng có thể xem, lọc, in hoặc xuất báo cáo.  
- Thao tác xem báo cáo được ghi nhận nếu hệ thống yêu cầu kiểm tra lịch sử.
Kích hoạt
Quản lý muốn xem tổng hợp tiền lương của toàn bộ bác sĩ trong một năm để phục vụ kiểm tra, đối soát hoặc lập báo cáo tài chính.
Luồng chính
Quản lý truy cập chức năng "Báo cáo lương năm toàn bộ bác sĩ".
Hệ thống hiển thị giao diện chọn năm báo cáo.
Quản lý chọn năm cần xem.
Quản lý nhấn nút "Xem báo cáo".
Hệ thống kiểm tra dữ liệu đầu vào.
Hệ thống truy xuất danh sách bác sĩ có phát sinh lương trong năm đã chọn.
Hệ thống tổng hợp dữ liệu lương theo từng bác sĩ.
Hệ thống tính tổng số ca làm việc, tổng số giờ làm, tổng phụ cấp, tổng khấu trừ và tổng lương trong năm.
Hệ thống hiển thị bảng báo cáo tiền lương tất cả bác sĩ.
Quản lý xem chi tiết và có thể in hoặc xuất báo cáo.
Luồng thay thế
A1. Lọc báo cáo theo bác sĩ
Quản lý nhập tên hoặc mã bác sĩ vào ô tìm kiếm.
Hệ thống lọc danh sách bác sĩ phù hợp.
Hệ thống hiển thị báo cáo lương của các bác sĩ được chọn.
A2. Xem chi tiết lương từng bác sĩ
Quản lý chọn một bác sĩ trong bảng báo cáo.
Hệ thống hiển thị chi tiết lương theo từng tháng.
Quản lý xem số ca làm việc, số giờ làm, hệ số áp dụng và tổng lương từng tháng.
A3. Xuất báo cáo ra file
Quản lý chọn chức năng "Xuất Excel" hoặc "Xuất PDF".
Hệ thống tạo file báo cáo theo định dạng được chọn.
Hệ thống cho phép tải file về máy.
A4. In báo cáo
Quản lý chọn chức năng "In báo cáo".
Hệ thống hiển thị bản xem trước.
Quản lý xác nhận in.
Hệ thống gửi báo cáo đến máy in.
Luồng ngoại lệ
E1. Chưa chọn năm báo cáo
Hệ thống hiển thị thông báo: "Vui lòng chọn năm cần xem báo cáo".
Không thực hiện truy xuất dữ liệu.
E2. Năm báo cáo không hợp lệ
Hệ thống hiển thị thông báo lỗi.
Yêu cầu người dùng chọn lại năm hợp lệ.
E3. Không có dữ liệu lương trong năm đã chọn
Hệ thống hiển thị thông báo: "Không có dữ liệu lương trong năm đã chọn".
Bảng báo cáo hiển thị trạng thái rỗng.
E4. Người dùng không có quyền xem báo cáo
Hệ thống hiển thị thông báo: "Bạn không có quyền truy cập chức năng này".
Không cho phép xem dữ liệu lương.
E5. Lỗi cơ sở dữ liệu
Hệ thống hiển thị thông báo lỗi hệ thống.
Ghi log lỗi để phục vụ kiểm tra kỹ thuật.
Yêu cầu đặc biệt  
Chỉ người có quyền quản lý lương hoặc quản lý hệ thống mới được xem báo cáo.
Dữ liệu tiền lương phải hiển thị theo định dạng VNĐ.
Hỗ trợ lọc báo cáo theo năm, bác sĩ và trạng thái phiếu lương.
Hỗ trợ xuất báo cáo ra Excel hoặc PDF.
Báo cáo cần hiển thị rõ tổng lương từng bác sĩ và tổng lương toàn bộ bác sĩ trong năm.
Dữ liệu báo cáo phải được tính từ các phiếu lương đã lập và được lưu trong hệ thống.
Quy tắc nghiệp vụ
Báo cáo chỉ tổng hợp các phiếu lương thuộc năm được chọn.
Chỉ tính các phiếu lương có trạng thái hợp lệ như APPROVED hoặc PAID.
Các phiếu lương đã bị hủy không được đưa vào báo cáo.
Tổng lương năm của một bác sĩ bằng tổng lương của tất cả các tháng trong năm đó.
Tổng lương toàn bộ bác sĩ bằng tổng lương năm của tất cả bác sĩ trong báo cáo.
Người dùng chỉ được xem dữ liệu nếu có quyền báo cáo tiền lương.
Dữ liệu lương đã khóa hoặc đã thanh toán không được chỉnh sửa trực tiếp từ màn hình báo cáo.
