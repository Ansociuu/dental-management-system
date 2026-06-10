import { By, until } from "selenium-webdriver";
import {
  ACCOUNTS,
  FRONTEND_URL,
  RUN_ID,
  createDriver,
  executeCases,
  expectStatus,
  loginApi,
  loginBrowser,
  manual,
  pass,
  request,
  setExitCode,
  unsupported
} from "../lib/qa-core.mjs";

const rows = [
  ["UC1.1_FUNC_001", "Thêm tài khoản người dùng hợp lệ với đầy đủ thông tin"],
  ["UC1.1_FUNC_002", "Thêm tài khoản với email đăng nhập đã tồn tại"],
  ["UC1.1_FUNC_003", "Thêm tài khoản với mật khẩu ít hơn 8 ký tự"],
  ["UC1.1_FUNC_004", "Thêm tài khoản với mật khẩu không có chữ hoa"],
  ["UC1.1_FUNC_005", "Thêm tài khoản khi bỏ trống email đăng nhập"],
  ["UC1.1_FUNC_006", "Thêm tài khoản với email sai định dạng"],
  ["UC1.1_FUNC_007", "Thêm tài khoản với số điện thoại sai định dạng"],
  ["UC1.1_FUNC_008", "Người dùng không có quyền Admin thực hiện thêm tài khoản"],
  ["UC1.1_FUNC_009", "Sửa email và số điện thoại tài khoản"],
  ["UC1.1_FUNC_010", "Thay đổi vai trò Lễ tân sang Kế toán"],
  ["UC1.1_FUNC_011", "Khóa tài khoản và chặn đăng nhập"],
  ["UC1.1_FUNC_012", "Mở khóa tài khoản và đăng nhập lại"],
  ["UC1.1_FUNC_013", "Không xóa tài khoản đã phát sinh dữ liệu"],
  ["UC1.1_FUNC_014", "Phân quyền theo vai trò Quản trị viên"],
  ["UC1.1_FUNC_015", "Audit log ghi nhận tạo và sửa tài khoản"],
  ["UC1.2_FUNC_001", "Thêm hồ sơ bác sĩ hợp lệ"],
  ["UC1.2_FUNC_002", "Không cho trùng số chứng chỉ hành nghề"],
  ["UC1.2_FUNC_003", "Bắt buộc số chứng chỉ hành nghề"],
  ["UC1.2_FUNC_004", "Bắt buộc họ và tên bác sĩ"],
  ["UC1.2_FUNC_005", "Xem chi tiết hồ sơ bác sĩ"],
  ["UC1.2_FUNC_006", "Sửa hồ sơ bác sĩ hợp lệ"],
  ["UC1.2_FUNC_007", "Không xóa bác sĩ đã có lịch hẹn"],
  ["UC1.2_FUNC_008", "Ngưng hoạt động bác sĩ"],
  ["UC1.2_FUNC_009", "Upload file chứng chỉ bác sĩ"],
  ["UC1.2_FUNC_010", "Cập nhật ảnh đại diện bác sĩ"],
  ["UC1.2_FUNC_011", "Tìm kiếm bác sĩ theo tên"],
  ["UC1.2_FUNC_012", "Tìm kiếm bác sĩ theo chuyên khoa"],
  ["UC1.3_FUNC_001", "Thêm dịch vụ hợp lệ"],
  ["UC1.3_FUNC_002", "Tên dịch vụ trùng trong cùng nhóm"],
  ["UC1.3_FUNC_003", "Tên dịch vụ giống nhau ở nhóm khác"],
  ["UC1.3_FUNC_004", "Thêm dịch vụ miễn phí với giá 0"],
  ["UC1.3_FUNC_005", "Không cho phép giá dịch vụ âm"],
  ["UC1.3_FUNC_006", "Không cho phép thời gian thực hiện bằng 0"],
  ["UC1.3_FUNC_007", "Bắt buộc tên dịch vụ"],
  ["UC1.3_FUNC_008", "Bắt buộc nhóm dịch vụ"],
  ["UC1.3_FUNC_009", "Sửa mô tả và thời gian dịch vụ"],
  ["UC1.3_FUNC_010", "Giá mới chỉ áp dụng cho giao dịch mới"],
  ["UC1.3_FUNC_011", "Ngưng sử dụng dịch vụ"],
  ["UC1.3_FUNC_012", "Không xóa dịch vụ đã phát sinh dữ liệu"],
  ["UC1.3_FUNC_013", "Dịch vụ INACTIVE không xuất hiện khi đặt lịch"],
  ["UC1.3_FUNC_014", "Lưu lịch sử thay đổi dịch vụ"],
  ["UC1.3_FUNC_015", "Tìm kiếm dịch vụ theo tên"],
  ["UC1.3_FUNC_016", "Tìm kiếm dịch vụ không tồn tại"],
  ["UC1.3_FUNC_017", "Thiết lập giá cho dịch vụ chưa có giá"],
  ["UC1.3_FUNC_018", "Cập nhật giá dịch vụ hợp lệ"],
  ["UC1.3_FUNC_019", "Không cho cập nhật giá âm"],
  ["UC1.3_FUNC_020", "Giá mới không ảnh hưởng hóa đơn cũ"],
  ["UC1.3_FUNC_021", "Xem lịch sử thay đổi giá"],
  ["UC1.3_FUNC_022", "Thiết lập giá hàng loạt"],
  ["UC1.3_FUNC_023", "Người không đủ quyền không thể thiết lập giá"],
  ["UC1.3_FUNC_024", "Không cho cập nhật khi bỏ trống giá"]
];
const cases = rows.map(([id, description]) => ({
  id,
  description,
  input: "Dữ liệu sinh theo RUN_ID",
  expected: description
}));

const admin = await loginApi(ACCOUNTS.admin);
const receptionist = await loginApi(ACCOUNTS.receptionist);
const token = admin.token;
const suffix = RUN_ID.slice(-8);
const userPayload = {
  fullName: `UC1 Receptionist ${suffix}`,
  email: `uc1.${suffix}@mec.test`,
  phone: `08${suffix}`.slice(0, 10),
  password: "Uc1Strong9",
  role: "RECEPTIONIST",
  status: "ACTIVE"
};
const doctorPayload = {
  fullName: `UC1 Doctor ${suffix}`,
  email: `uc1.doctor.${suffix}@mec.test`,
  phone: `07${suffix}`.slice(0, 10),
  password: "Uc1Doctor9",
  role: "DOCTOR",
  status: "ACTIVE",
  specialization: "Implant",
  licenseNumber: `CCHN-${suffix}`
};
const servicePayload = {
  name: `UC1 Service ${suffix}`,
  description: "Dịch vụ kiểm thử UC1",
  price: 500000,
  duration: 30,
  complexityCoefficient: 0.2,
  status: "ACTIVE"
};
const context = {};
const driver = await createDriver();

const createUser = async (payload) => expectStatus(
  "/users",
  { method: "POST", body: JSON.stringify(payload) },
  token,
  [201]
);
const createService = async (payload) => expectStatus(
  "/services",
  { method: "POST", body: JSON.stringify(payload) },
  token,
  [201]
);

const actions = {
  "UC1.1_FUNC_001": async () => {
    const response = await createUser(userPayload);
    context.user = response.body.data;
    return pass(`Đã tạo ${context.user.email}`);
  },
  "UC1.1_FUNC_002": async () => {
    await expectStatus("/users", { method: "POST", body: JSON.stringify(userPayload) }, token, [400]);
    return pass("API từ chối email đăng nhập trùng");
  },
  "UC1.1_FUNC_003": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...userPayload, email: `weak1.${suffix}@mec.test`, password: "Abc1" })
    }, token, [400]);
    return pass("API từ chối mật khẩu ngắn");
  },
  "UC1.1_FUNC_004": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...userPayload, email: `weak2.${suffix}@mec.test`, password: "lowercase9" })
    }, token, [400]);
    return pass("API từ chối mật khẩu không có chữ hoa");
  },
  "UC1.1_FUNC_005": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...userPayload, email: "" })
    }, token, [400]);
    return pass("API từ chối thiếu email đăng nhập");
  },
  "UC1.1_FUNC_006": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...userPayload, email: "invalid-email" })
    }, token, [400]);
    return pass("API từ chối email sai định dạng");
  },
  "UC1.1_FUNC_007": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...userPayload, email: `phone.${suffix}@mec.test`, phone: "123" })
    }, token, [400]);
    return pass("API từ chối số điện thoại sai định dạng");
  },
  "UC1.1_FUNC_008": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...userPayload, email: `denied.${suffix}@mec.test` })
    }, receptionist.token, [403]);
    return pass("Lễ tân nhận HTTP 403 khi tạo tài khoản");
  },
  "UC1.1_FUNC_009": async () => {
    const response = await expectStatus(`/users/${context.user._id}`, {
      method: "PUT",
      body: JSON.stringify({ email: `uc1.updated.${suffix}@mec.test`, phone: `09${suffix}`.slice(0, 10) })
    }, token, [200]);
    context.user = response.body.data;
    return pass("Email và số điện thoại được cập nhật");
  },
  "UC1.1_FUNC_010": async () => unsupported("Hệ thống không có vai trò Kế toán"),
  "UC1.1_FUNC_011": async () => {
    await expectStatus(`/users/${context.user._id}`, {
      method: "PUT", body: JSON.stringify({ status: "INACTIVE" })
    }, token, [200]);
    await expectStatus("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: context.user.email, password: userPayload.password })
    }, "", [403]);
    return pass("Tài khoản INACTIVE không đăng nhập được");
  },
  "UC1.1_FUNC_012": async () => {
    await expectStatus(`/users/${context.user._id}`, {
      method: "PUT", body: JSON.stringify({ status: "ACTIVE" })
    }, token, [200]);
    await expectStatus("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: context.user.email, password: userPayload.password })
    }, "", [200]);
    return pass("Tài khoản đăng nhập lại sau khi mở khóa");
  },
  "UC1.1_FUNC_013": async () => {
    const doctors = await request("/users?role=DOCTOR", {}, token);
    const seededDoctor = doctors.body.data?.find((item) => item.email === ACCOUNTS.doctor.email);
    await expectStatus(`/users/${seededDoctor._id}`, { method: "DELETE" }, token, [400]);
    return pass("API chặn xóa bác sĩ đã có dữ liệu");
  },
  "UC1.1_FUNC_014": async () => manual("Không sửa quyền ADMIN tự động để tránh ảnh hưởng môi trường dùng chung"),
  "UC1.1_FUNC_015": async () => {
    const logs = await expectStatus("/config-change-logs?resourceType=USER", {}, token, [200]);
    const found = logs.body.data?.some((item) => item.resourceId === context.user._id);
    if (!found) throw new Error("Không tìm thấy audit log USER");
    return pass("Audit log ghi nhận thao tác tài khoản");
  },
  "UC1.2_FUNC_001": async () => {
    const response = await createUser(doctorPayload);
    context.doctor = response.body.data;
    return pass("Đã tạo hồ sơ bác sĩ đầy đủ");
  },
  "UC1.2_FUNC_002": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...doctorPayload, email: `doctor2.${suffix}@mec.test` })
    }, token, [400]);
    return pass("API từ chối số chứng chỉ trùng");
  },
  "UC1.2_FUNC_003": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...doctorPayload, email: `doctor3.${suffix}@mec.test`, licenseNumber: "" })
    }, token, [400]);
    return pass("API bắt buộc số chứng chỉ");
  },
  "UC1.2_FUNC_004": async () => {
    await expectStatus("/users", {
      method: "POST",
      body: JSON.stringify({ ...doctorPayload, email: `doctor4.${suffix}@mec.test`, fullName: "" })
    }, token, [400]);
    return pass("API bắt buộc họ tên");
  },
  "UC1.2_FUNC_005": async () => {
    const response = await expectStatus(`/users/${context.doctor._id}`, {}, token, [200]);
    if (response.body.data.licenseNumber !== doctorPayload.licenseNumber) throw new Error("Thiếu chứng chỉ");
    return pass("API trả đủ thông tin hồ sơ bác sĩ");
  },
  "UC1.2_FUNC_006": async () => {
    await expectStatus(`/users/${context.doctor._id}`, {
      method: "PUT",
      body: JSON.stringify({ specialization: "Implant nâng cao", experience: "5 năm" })
    }, token, [200]);
    return pass("Hồ sơ bác sĩ được cập nhật");
  },
  "UC1.2_FUNC_007": async () => {
    const doctors = await request("/users?role=DOCTOR", {}, token);
    const seededDoctor = doctors.body.data?.find((item) => item.email === ACCOUNTS.doctor.email);
    await expectStatus(`/users/${seededDoctor._id}`, { method: "DELETE" }, token, [400]);
    return pass("Không xóa bác sĩ đã có lịch");
  },
  "UC1.2_FUNC_008": async () => {
    await expectStatus(`/users/${context.doctor._id}`, {
      method: "PUT", body: JSON.stringify({ status: "INACTIVE" })
    }, token, [200]);
    return pass("Bác sĩ chuyển sang INACTIVE");
  },
  "UC1.2_FUNC_009": async () => unsupported("Chưa có lưu trữ/upload file chứng chỉ"),
  "UC1.2_FUNC_010": async () => {
    await expectStatus(`/users/${context.doctor._id}`, {
      method: "PUT", body: JSON.stringify({ avatar: "https://example.com/uc1-avatar.png" })
    }, token, [200]);
    return pass("Avatar URL được cập nhật");
  },
  "UC1.2_FUNC_011": async () => {
    const response = await expectStatus(`/users?search=${encodeURIComponent(context.doctor.fullName)}`, {}, token, [200]);
    if (!response.body.data?.some((item) => item._id === context.doctor._id)) throw new Error("Không tìm thấy bác sĩ");
    return pass("Tìm thấy bác sĩ theo tên");
  },
  "UC1.2_FUNC_012": async () => unsupported("API người dùng chưa có bộ lọc chuyên khoa"),
  "UC1.3_FUNC_001": async () => {
    const response = await createService(servicePayload);
    context.service = response.body.data;
    return pass("Dịch vụ ACTIVE được tạo");
  },
  "UC1.3_FUNC_002": async () => {
    await expectStatus("/services", {
      method: "POST", body: JSON.stringify(servicePayload)
    }, token, [400]);
    return pass("Tên dịch vụ trùng bị từ chối");
  },
  "UC1.3_FUNC_003": async () => unsupported("Mô hình Service chưa có nhóm dịch vụ"),
  "UC1.3_FUNC_004": async () => {
    const response = await createService({ ...servicePayload, name: `${servicePayload.name} Free`, price: 0 });
    context.freeService = response.body.data;
    return pass("Dịch vụ giá 0 được tạo");
  },
  "UC1.3_FUNC_005": async () => {
    await expectStatus("/services", {
      method: "POST",
      body: JSON.stringify({ ...servicePayload, name: `${servicePayload.name} Negative`, price: -1 })
    }, token, [400]);
    return pass("Giá âm bị từ chối");
  },
  "UC1.3_FUNC_006": async () => {
    await expectStatus("/services", {
      method: "POST",
      body: JSON.stringify({ ...servicePayload, name: `${servicePayload.name} Zero Duration`, duration: 0 })
    }, token, [400]);
    return pass("Thời gian bằng 0 bị từ chối");
  },
  "UC1.3_FUNC_007": async () => {
    await expectStatus("/services", {
      method: "POST", body: JSON.stringify({ ...servicePayload, name: "" })
    }, token, [400]);
    return pass("Tên dịch vụ là bắt buộc");
  },
  "UC1.3_FUNC_008": async () => unsupported("Mô hình Service chưa có nhóm dịch vụ"),
  "UC1.3_FUNC_009": async () => {
    const response = await expectStatus(`/services/${context.service._id}`, {
      method: "PUT",
      body: JSON.stringify({ description: "Đã cập nhật", duration: 45 })
    }, token, [200]);
    context.service = response.body.data;
    return pass("Mô tả và thời gian được cập nhật");
  },
  "UC1.3_FUNC_010": async () => manual("Cần hóa đơn trước và sau thời điểm đổi giá để đối chiếu"),
  "UC1.3_FUNC_011": async () => {
    await expectStatus(`/services/${context.service._id}`, {
      method: "PUT", body: JSON.stringify({ status: "INACTIVE" })
    }, token, [200]);
    return pass("Dịch vụ chuyển sang INACTIVE");
  },
  "UC1.3_FUNC_012": async () => {
    const services = await request("/services", {}, token);
    const seeded = services.body.data?.find((item) => item.name === "Khám tổng quát");
    await expectStatus(`/services/${seeded._id}`, { method: "DELETE" }, token, [400]);
    return pass("API chặn xóa dịch vụ đã phát sinh");
  },
  "UC1.3_FUNC_013": async () => {
    const response = await expectStatus("/patient-portal/booking-options", {}, token, [200, 403]);
    if (response.status === 403) return manual("Cần tài khoản bệnh nhân để xác minh danh sách đặt lịch");
    const serialized = JSON.stringify(response.body);
    if (serialized.includes(context.service._id)) throw new Error("Dịch vụ INACTIVE vẫn xuất hiện");
    return pass("Dịch vụ INACTIVE không có trong booking options");
  },
  "UC1.3_FUNC_014": async () => {
    const logs = await expectStatus(`/config-change-logs?resourceType=SERVICE&resourceId=${context.service._id}`, {}, token, [200]);
    if (!logs.body.data?.length) throw new Error("Không có lịch sử dịch vụ");
    return pass("Có lịch sử thay đổi dịch vụ");
  },
  "UC1.3_FUNC_015": async () => {
    const response = await expectStatus(`/services?search=${encodeURIComponent(servicePayload.name)}`, {}, token, [200]);
    if (!response.body.data?.length) throw new Error("Không tìm thấy dịch vụ");
    return pass("Tìm thấy dịch vụ theo tên");
  },
  "UC1.3_FUNC_016": async () => {
    const response = await expectStatus(`/services?search=NOT-FOUND-${suffix}`, {}, token, [200]);
    if (response.body.data?.length) throw new Error("Kết quả tìm kiếm không rỗng");
    return pass("Danh sách rỗng khi không có kết quả");
  },
  "UC1.3_FUNC_017": async () => unsupported("Chưa có bảng giá có ngày hiệu lực riêng cho dịch vụ"),
  "UC1.3_FUNC_018": async () => {
    await expectStatus(`/services/${context.freeService._id}`, {
      method: "PUT", body: JSON.stringify({ price: 100000 })
    }, token, [200]);
    return pass("Giá dịch vụ được cập nhật");
  },
  "UC1.3_FUNC_019": async () => {
    await expectStatus(`/services/${context.freeService._id}`, {
      method: "PUT", body: JSON.stringify({ price: -1 })
    }, token, [400]);
    return pass("Giá âm bị từ chối khi cập nhật");
  },
  "UC1.3_FUNC_020": async () => manual("Cần đối chiếu snapshot giá trên hóa đơn cũ"),
  "UC1.3_FUNC_021": async () => {
    const logs = await expectStatus(`/config-change-logs?resourceType=SERVICE&resourceId=${context.freeService._id}`, {}, token, [200]);
    if (!logs.body.data?.some((item) => item.changedFields?.includes("price"))) throw new Error("Không có lịch sử giá");
    return pass("Lịch sử ghi nhận trường price");
  },
  "UC1.3_FUNC_022": async () => unsupported("Chưa có API/UI cập nhật giá hàng loạt"),
  "UC1.3_FUNC_023": async () => {
    await expectStatus(`/services/${context.freeService._id}`, {
      method: "PUT", body: JSON.stringify({ price: 200000 })
    }, receptionist.token, [403]);
    return pass("Lễ tân không được cập nhật giá");
  },
  "UC1.3_FUNC_024": async () => unsupported("API PATCH hiện giữ nguyên giá khi trường price vắng mặt")
};

try {
  await loginBrowser(driver, ACCOUNTS.admin);
  await driver.get(`${FRONTEND_URL}/admin/users`);
  await driver.wait(until.elementLocated(By.css("table, body")), 15000);
  const results = await executeCases({ uc: "uc1", cases, actions, context, driver });
  setExitCode(results);
} finally {
  await driver.quit();
}

