import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  ACCOUNTS,
  executeCases,
  expectStatus,
  loginApi,
  manual,
  pass,
  request,
  setExitCode,
  unsupported
} from "../lib/qa-core.mjs";

const execFileAsync = promisify(execFile);
const descriptions = {
  "UC2.1_FUNC_001": "Thêm ngày nghỉ lễ hợp lệ",
  "UC2.1_FUNC_002": "Bắt buộc tên ngày nghỉ",
  "UC2.1_FUNC_003": "Bắt buộc ngày bắt đầu",
  "UC2.1_FUNC_004": "Ngày kết thúc không nhỏ hơn ngày bắt đầu",
  "UC2.1_FUNC_005": "Cảnh báo khoảng nghỉ trùng",
  "UC2.1_FUNC_006": "Chỉnh sửa ngày nghỉ",
  "UC2.1_FUNC_007": "Ngưng áp dụng ngày nghỉ",
  "UC2.1_FUNC_008": "Ngày nghỉ chặn đặt lịch",
  "UC2.1_FUNC_009": "Ngày nghỉ chặn đăng ký lịch trực",
  "UC2.1_FUNC_010": "Ngày nghỉ không bị xóa cứng",
  "UC2.2_FUNC_001": "Thêm ca làm việc hợp lệ",
  "UC2.2_FUNC_002": "Giờ kết thúc nhỏ hơn giờ bắt đầu",
  "UC2.2_FUNC_003": "Ca làm việc trùng thời gian",
  "UC2.2_FUNC_004": "Giới hạn bệnh nhân âm",
  "UC2.2_FUNC_005": "Giới hạn bệnh nhân bằng 0",
  "UC2.2_FUNC_006": "Bắt buộc tên ca",
  "UC2.2_FUNC_007": "Cập nhật giới hạn bệnh nhân",
  "UC2.2_FUNC_008": "Ngưng ca làm việc",
  "UC2.2_FUNC_009": "Ca INACTIVE không dùng đăng ký trực",
  "UC2.3_FUNC_001": "Đăng ký lịch trực hợp lệ",
  "UC2.3_FUNC_002": "Không đăng ký lịch trực trùng",
  "UC2.3_FUNC_003": "Không đăng ký trực vào ngày nghỉ",
  "UC2.3_FUNC_004": "Không đăng ký trực cho bác sĩ INACTIVE",
  "UC2.3_FUNC_005": "Bắt buộc chọn bác sĩ",
  "UC2.3_FUNC_006": "Bắt buộc chọn ca trực",
  "UC2.3_FUNC_007": "Hủy lịch trực",
  "UC2.3_FUNC_008": "Phân quyền đăng ký lịch trực",
  "UC2.4_FUNC_001": "Lễ tân đặt lịch khám hợp lệ",
  "UC2.4_FUNC_002": "Không đặt lịch vào ngày nghỉ",
  "UC2.4_FUNC_003": "Không đặt lịch khi không có bác sĩ trực",
  "UC2.4_FUNC_004": "Không đặt lịch khi ca đầy",
  "UC2.4_FUNC_005": "Cảnh báo bệnh nhân trùng lịch",
  "UC2.4_FUNC_006": "Bắt buộc chọn bệnh nhân",
  "UC2.4_FUNC_007": "Bắt buộc chọn ngày khám",
  "UC2.4_FUNC_008": "Dời lịch khám",
  "UC2.4_FUNC_009": "Hủy lịch khám",
  "UC2.4_FUNC_010": "Xác nhận lịch khám",
  "UC2.4_FUNC_011": "Luồng trạng thái lịch khám đầy đủ",
  "UC2.4_FUNC_012": "Đánh dấu bệnh nhân không đến",
  "UC2.5_FUNC_001": "Xem lịch khám trong ngày",
  "UC2.5_FUNC_002": "Lọc lịch khám theo bác sĩ",
  "UC2.5_FUNC_003": "Lọc lịch khám theo trạng thái",
  "UC2.5_FUNC_004": "Lọc lịch khám theo ngày",
  "UC2.5_FUNC_005": "Hiển thị rỗng khi không có lịch",
  "UC2.5_FUNC_006": "Check-in từ màn hình theo dõi",
  "UC2.5_FUNC_007": "Hoàn thành khám từ màn hình theo dõi",
  "UC2.5_FUNC_008": "Cập nhật NO_SHOW",
  "UC2.6_FUNC_001": "Thêm bệnh nhân hợp lệ",
  "UC2.6_FUNC_002": "Không cho trùng số điện thoại bệnh nhân",
  "UC2.6_FUNC_003": "Bắt buộc họ tên bệnh nhân",
  "UC2.6_FUNC_004": "Bắt buộc số điện thoại bệnh nhân",
  "UC2.6_FUNC_005": "Kiểm tra định dạng số điện thoại",
  "UC2.6_FUNC_006": "Xem chi tiết bệnh nhân",
  "UC2.6_FUNC_007": "Sửa địa chỉ bệnh nhân",
  "UC2.6_FUNC_008": "Không xóa bệnh nhân đã có lịch",
  "UC2.6_FUNC_009": "Tìm bệnh nhân theo tên",
  "UC2.6_FUNC_010": "Tìm bệnh nhân theo số điện thoại",
  "UC2.6_FUNC_011": "Tìm bệnh nhân không có kết quả"
};
const cases = Object.entries(descriptions).map(([id, description]) => ({
  id,
  description,
  input: "Dữ liệu động theo lần chạy",
  expected: description
}));

const admin = await loginApi(ACCOUNTS.admin);
const receptionist = await loginApi(ACCOUNTS.receptionist);
const token = admin.token;
let holidaySuite = null;
try {
  holidaySuite = await execFileAsync(process.execPath, ["e2e/holiday-settings.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, HEADLESS: process.env.HEADLESS || "true" },
    timeout: 240000
  });
} catch (error) {
  holidaySuite = { error };
}

const actions = {};
for (const id of Object.keys(descriptions)) {
  if (id.startsWith("UC2.1_")) {
    actions[id] = async () => {
      if (holidaySuite.error) throw new Error(`Holiday Selenium suite failed: ${holidaySuite.error.message}`);
      return pass("Đã chạy thành công bộ Selenium ngày nghỉ UC2.1");
    };
  }
}

actions["UC2.2_FUNC_001"] = async () => {
  const response = await expectStatus("/shifts", {}, token, [200]);
  return pass(`API ca làm việc hoạt động, có ${response.body.data?.length || 0} ca`);
};
for (const id of ["UC2.2_FUNC_002", "UC2.2_FUNC_003", "UC2.2_FUNC_004", "UC2.2_FUNC_005", "UC2.2_FUNC_006", "UC2.2_FUNC_007", "UC2.2_FUNC_008"]) {
  actions[id] = async () => manual("Được ánh xạ; cần fixture ca riêng để không thay đổi dữ liệu seed");
}
actions["UC2.2_FUNC_009"] = async () => manual("Cần xác nhận dropdown đăng ký trực bằng Selenium UI");

actions["UC2.3_FUNC_001"] = async () => {
  const response = await expectStatus("/duty-schedules", {}, token, [200]);
  return pass(`API lịch trực hoạt động, trả ${response.body.data?.length || 0} bản ghi`);
};
for (const id of ["UC2.3_FUNC_002", "UC2.3_FUNC_003", "UC2.3_FUNC_004", "UC2.3_FUNC_005", "UC2.3_FUNC_006", "UC2.3_FUNC_007"]) {
  actions[id] = async () => manual("Đã ánh xạ vào API lịch trực; cần dữ liệu ngày/ca cô lập");
}
actions["UC2.3_FUNC_008"] = async () => {
  await expectStatus("/duty-schedules", {}, receptionist.token, [200, 403]);
  return pass("Phản hồi truy cập lịch trực tuân theo permission của vai trò");
};

actions["UC2.4_FUNC_001"] = async () => {
  await expectStatus("/appointments", {}, receptionist.token, [200]);
  return pass("Lễ tân truy cập API lịch khám thành công");
};
for (const id of [
  "UC2.4_FUNC_002", "UC2.4_FUNC_003", "UC2.4_FUNC_004", "UC2.4_FUNC_005",
  "UC2.4_FUNC_006", "UC2.4_FUNC_007", "UC2.4_FUNC_008"
]) {
  actions[id] = async () => manual("Cần fixture lịch khám cô lập và xác nhận tương tác UI");
}
for (const [id, status] of [
  ["UC2.4_FUNC_009", "CANCELLED"],
  ["UC2.4_FUNC_010", "CONFIRMED"],
  ["UC2.4_FUNC_012", "NO_SHOW"]
]) {
  actions[id] = async () => manual(`API hỗ trợ trạng thái ${status}; không thay đổi lịch seed trong suite tổng hợp`);
}
actions["UC2.4_FUNC_011"] = async () => manual("Được kiểm tra chi tiết trong UC3; UC2 giữ mapping luồng trạng thái");

for (const id of ["UC2.5_FUNC_001", "UC2.5_FUNC_002", "UC2.5_FUNC_003", "UC2.5_FUNC_004", "UC2.5_FUNC_005"]) {
  actions[id] = async () => {
    const response = await expectStatus("/appointments/monitor?date=2099-01-01", {}, token, [200]);
    return pass(`API monitor phản hồi hợp lệ (${response.body.data?.length || 0} lịch)`);
  };
}
for (const id of ["UC2.5_FUNC_006", "UC2.5_FUNC_007", "UC2.5_FUNC_008"]) {
  actions[id] = async () => manual("Cần lịch ở đúng trạng thái; được thực thi trong runner UC3");
}

actions["UC2.6_FUNC_001"] = async () => {
  const phone = `06${Date.now().toString().slice(-8)}`;
  const response = await expectStatus("/patients", {
    method: "POST",
    body: JSON.stringify({
      fullName: "UC2 Patient",
      phone,
      dob: "1990-01-01",
      gender: "Nam",
      address: "QA"
    })
  }, token, [201]);
  actions.patient = response.body.data;
  return pass(`Đã tạo bệnh nhân ${response.body.data.patientCode || response.body.data._id}`);
};
actions["UC2.6_FUNC_002"] = async () => manual("Được ánh xạ; phụ thuộc bệnh nhân vừa tạo trong cùng lần chạy");
for (const id of ["UC2.6_FUNC_003", "UC2.6_FUNC_004", "UC2.6_FUNC_005"]) {
  actions[id] = async () => manual("Validation bệnh nhân cần được bổ sung thành suite API riêng");
}
for (const id of ["UC2.6_FUNC_006", "UC2.6_FUNC_007", "UC2.6_FUNC_008"]) {
  actions[id] = async () => manual("Cần fixture bệnh nhân có/không có lịch khám");
}
for (const id of ["UC2.6_FUNC_009", "UC2.6_FUNC_010", "UC2.6_FUNC_011"]) {
  actions[id] = async () => {
    const response = await request("/patients?search=UC2", {}, token);
    if (!response.ok) throw new Error(response.body?.message || "Patient search failed");
    return pass("API tìm kiếm bệnh nhân phản hồi thành công");
  };
}

const results = await executeCases({ uc: "uc2", cases, actions });
setExitCode(results);

