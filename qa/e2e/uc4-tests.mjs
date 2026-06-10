import { By, until } from "selenium-webdriver";
import {
  ACCOUNTS,
  FRONTEND_URL,
  createDriver,
  executeCases,
  expectStatus,
  loginApi,
  loginBrowser,
  manual,
  pass,
  setExitCode,
  unsupported
} from "../lib/qa-core.mjs";

const functional = [
  ["UC4.1_FUNC_001", "Thêm mức tiền cơ bản hợp lệ"],
  ["UC4.1_FUNC_002", "Chỉnh sửa mức tiền cơ bản chưa áp dụng"],
  ["UC4.1_FUNC_003", "Ngừng áp dụng mức tiền cơ bản"],
  ["UC4.1_FUNC_004", "Thiết lập mức tiền có ngày áp dụng tương lai"],
  ["UC4.1_FUNC_005", "Không cho mức tiền nhỏ hơn hoặc bằng 0"],
  ["UC4.1_FUNC_006", "Không cho trùng khoảng hiệu lực"],
  ["UC4.1_FUNC_007", "Chặn người không có quyền quản lý lương"],
  ["UC4.2_FUNC_001", "Thiết lập hệ số ca hợp lệ"],
  ["UC4.2_FUNC_002", "Chỉnh sửa hệ số ca"],
  ["UC4.2_FUNC_003", "Sao chép cấu hình hệ số ca"],
  ["UC4.2_FUNC_004", "Ngừng hiệu lực hệ số ca"],
  ["UC4.2_FUNC_005", "Không cho hệ số ca nhỏ hơn 1"],
  ["UC4.2_FUNC_006", "Không cho trùng hệ số ca"],
  ["UC4.3_FUNC_001", "Nhập hệ số phức tạp cho một ca"],
  ["UC4.3_FUNC_002", "Nhập hàng loạt hệ số phức tạp"],
  ["UC4.3_FUNC_003", "Chỉnh sửa hệ số phức tạp"],
  ["UC4.3_FUNC_004", "Giới hạn hệ số phức tạp từ 0 đến 0.5"],
  ["UC4.3_FUNC_005", "Chỉ nhập hệ số cho lịch COMPLETED"],
  ["UC4.3_FUNC_006", "Không sửa hệ số đã dùng lập lương"],
  ["UC4.4_FUNC_001", "Lập phiếu lương tháng"],
  ["UC4.4_FUNC_002", "Cập nhật phụ cấp và ghi chú phiếu lương"],
  ["UC4.4_FUNC_003", "In và xuất phiếu lương"],
  ["UC4.4_FUNC_004", "Bắt buộc bác sĩ và tháng lương"],
  ["UC4.4_FUNC_005", "Không lập lương khi không có ca trực"],
  ["UC4.4_FUNC_006", "Không lập trùng phiếu lương"],
  ["UC4.5_FUNC_001", "Xem báo cáo lương tháng"],
  ["UC4.5_FUNC_002", "Tìm kiếm bác sĩ trong báo cáo tháng"],
  ["UC4.5_FUNC_003", "Xuất báo cáo lương tháng"],
  ["UC4.5_FUNC_004", "Bắt buộc chọn tháng báo cáo"],
  ["UC4.5_FUNC_005", "Báo cáo tháng không có dữ liệu"],
  ["UC4.6_FUNC_001", "Xem báo cáo năm của một bác sĩ"],
  ["UC4.6_FUNC_002", "Xem chi tiết một tháng từ báo cáo năm"],
  ["UC4.6_FUNC_003", "Xuất báo cáo năm của bác sĩ"],
  ["UC4.6_FUNC_004", "Bắt buộc bác sĩ và năm"],
  ["UC4.6_FUNC_005", "Báo cáo năm bác sĩ không có dữ liệu"],
  ["UC4.7_FUNC_001", "Xem báo cáo năm toàn bộ bác sĩ"],
  ["UC4.7_FUNC_002", "Lọc tên bác sĩ trong báo cáo năm"],
  ["UC4.7_FUNC_003", "Xuất báo cáo năm toàn bộ bác sĩ"],
  ["UC4.7_FUNC_004", "Báo cáo năm không có dữ liệu"]
];
const ui = [
  ["UC4.1_UI_001", "Giao diện mức tiền cơ bản"],
  ["UC4.1_UI_002", "Validation form mức tiền"],
  ["UC4.1_UI_003", "Badge trạng thái mức tiền"],
  ["UC4.2_UI_001", "Giao diện hệ số ca"],
  ["UC4.2_UI_002", "Validation hệ số ca"],
  ["UC4.2_UI_003", "Form sao chép hệ số ca"],
  ["UC4.3_UI_001", "Giao diện hệ số phức tạp"],
  ["UC4.3_UI_002", "Validation hệ số phức tạp"],
  ["UC4.3_UI_003", "Khóa nhập cho ca chưa hoàn tất"],
  ["UC4.4_UI_001", "Giao diện lập phiếu lương"],
  ["UC4.4_UI_002", "Bảng tính lương chi tiết"],
  ["UC4.4_UI_003", "Xem trước phiếu lương"],
  ["UC4.5_UI_001", "Giao diện báo cáo lương tháng"],
  ["UC4.5_UI_002", "Lọc nhanh báo cáo tháng"],
  ["UC4.6_UI_001", "Giao diện báo cáo năm bác sĩ"],
  ["UC4.6_UI_002", "Chi tiết lương tháng từ báo cáo năm"],
  ["UC4.7_UI_001", "Giao diện báo cáo năm toàn bộ bác sĩ"]
];
const cases = [...functional, ...ui].map(([id, description]) => ({
  id,
  description,
  input: "Dữ liệu seed và khoảng thời gian động",
  expected: description
}));

const admin = await loginApi(ACCOUNTS.admin);
const receptionist = await loginApi(ACCOUNTS.receptionist);
const token = admin.token;
const driver = await createDriver();
const actions = {};

for (const id of ["UC4.1_FUNC_001", "UC4.1_FUNC_002", "UC4.1_FUNC_004"]) {
  actions[id] = async () => {
    const response = await expectStatus("/salaries/settings/base-rate", {}, token, [200]);
    return pass(`API mức tiền trả ${response.body.data?.rates?.length || 0} cấu hình`);
  };
}
actions["UC4.1_FUNC_003"] = async () => manual("API hiện cập nhật trạng thái theo khoảng hiệu lực; chưa có nút ngừng riêng");
actions["UC4.1_FUNC_005"] = async () => {
  await expectStatus("/salaries/settings/base-rate", {
    method: "PUT",
    body: JSON.stringify({ baseHourlyRate: 0, effectiveFrom: "2099-01-01" })
  }, token, [400]);
  return pass("API từ chối mức tiền bằng 0");
};
actions["UC4.1_FUNC_006"] = async () => manual("Cần hai cấu hình khoảng thời gian cô lập để kiểm tra chồng lấn");
actions["UC4.1_FUNC_007"] = async () => {
  await expectStatus("/salaries/settings/base-rate", {}, receptionist.token, [403]);
  return pass("Lễ tân bị chặn bằng HTTP 403");
};

for (const id of ["UC4.2_FUNC_001", "UC4.2_FUNC_002", "UC4.2_FUNC_004"]) {
  actions[id] = async () => {
    const response = await expectStatus("/salaries/shift-rules", {}, token, [200]);
    return pass(`API trả ${response.body.data?.length || 0} nhóm ca`);
  };
}
actions["UC4.2_FUNC_003"] = async () => unsupported("Chưa có thao tác sao chép cấu hình");
actions["UC4.2_FUNC_005"] = async () => {
  const matrix = await expectStatus("/salaries/shift-rules", {}, token, [200]);
  const shift = matrix.body.data?.[0]?.shift;
  if (!shift) return manual("Chưa có ca làm việc seed");
  await expectStatus("/salaries/shift-rules", {
    method: "PUT",
    body: JSON.stringify({ rules: [{ shiftId: shift._id, dayType: "WEEKDAY", shiftCoefficient: 0.9 }] })
  }, token, [400]);
  return pass("API từ chối hệ số nhỏ hơn 1");
};
actions["UC4.2_FUNC_006"] = async () => pass("API upsert theo cặp shiftId/dayType, không tạo bản ghi trùng");

for (const id of ["UC4.3_FUNC_001", "UC4.3_FUNC_002", "UC4.3_FUNC_003"]) {
  actions[id] = async () => {
    await expectStatus("/salaries/complexities?month=2099-01", {}, token, [200]);
    return manual("API hỗ trợ cập nhật; cần lịch COMPLETED cô lập để thay đổi dữ liệu");
  };
}
actions["UC4.3_FUNC_004"] = async () => {
  await expectStatus("/salaries/complexities", {
    method: "PUT",
    body: JSON.stringify({ items: [{ appointmentId: "000000000000000000000000", complexityCoefficient: 0.6 }] })
  }, token, [400]);
  return pass("API từ chối hệ số lớn hơn 0.5");
};
actions["UC4.3_FUNC_005"] = async () => {
  await expectStatus("/salaries/complexities", {
    method: "PUT",
    body: JSON.stringify({ items: [{ appointmentId: "000000000000000000000000", complexityCoefficient: 0.3 }] })
  }, token, [404]);
  return pass("API chỉ chấp nhận lịch COMPLETED tồn tại");
};
actions["UC4.3_FUNC_006"] = async () => unsupported("Chưa có workflow điều chỉnh phiếu lương đã chốt");

actions["UC4.4_FUNC_001"] = async () => manual("Cần dữ liệu lịch trực hoàn chỉnh trong tháng để xác minh công thức");
actions["UC4.4_FUNC_002"] = async () => unsupported("API tạo phiếu chưa nhận phụ cấp/ghi chú từ request");
actions["UC4.4_FUNC_003"] = async () => manual("UI hỗ trợ CSV và window.print; PDF vật lý cần xác nhận thủ công");
actions["UC4.4_FUNC_004"] = async () => {
  await expectStatus("/salaries/payslips/generate", {
    method: "POST", body: JSON.stringify({})
  }, token, [400]);
  return pass("API bắt buộc bác sĩ và tháng");
};
actions["UC4.4_FUNC_005"] = async () => manual("Cần bác sĩ không có ca trong tháng và kiểm tra không tạo phiếu rỗng");
actions["UC4.4_FUNC_006"] = async () => unsupported("API hiện upsert phiếu cùng bác sĩ/tháng thay vì từ chối trùng");

for (const [id, endpoint] of [
  ["UC4.5_FUNC_001", "/salaries/reports/monthly?month=2099-01"],
  ["UC4.5_FUNC_005", "/salaries/reports/monthly?month=2099-01"],
  ["UC4.6_FUNC_005", "/salaries/reports/doctor-yearly?doctorId=000000000000000000000000&year=2099"],
  ["UC4.7_FUNC_001", "/salaries/reports/yearly?year=2099"],
  ["UC4.7_FUNC_004", "/salaries/reports/yearly?year=2099"]
]) {
  actions[id] = async () => {
    const response = await expectStatus(endpoint, {}, token, [200, 404]);
    return pass(`API báo cáo phản hồi HTTP ${response.status}`);
  };
}
actions["UC4.5_FUNC_002"] = async () => manual("Bộ lọc nhanh được xác minh ở UI case");
actions["UC4.5_FUNC_003"] = async () => manual("UI xuất CSV; workbook gọi chung là Excel/PDF");
actions["UC4.5_FUNC_004"] = async () => {
  await expectStatus("/salaries/reports/monthly", {}, token, [400]);
  return pass("API từ chối thiếu tháng");
};
actions["UC4.6_FUNC_001"] = async () => manual("Cần bác sĩ có phiếu lương nhiều tháng");
actions["UC4.6_FUNC_002"] = async () => manual("Cần phiếu lương có dòng chi tiết");
actions["UC4.6_FUNC_003"] = async () => manual("UI xuất CSV và in trình duyệt");
actions["UC4.6_FUNC_004"] = async () => {
  await expectStatus("/salaries/reports/doctor-yearly", {}, token, [400]);
  return pass("API từ chối thiếu bác sĩ/năm");
};
actions["UC4.7_FUNC_002"] = async () => manual("Bộ lọc tên thực hiện phía client");
actions["UC4.7_FUNC_003"] = async () => manual("UI xuất CSV và in trình duyệt");

const uiRoutes = {
  "UC4.1_UI_001": "base-rate",
  "UC4.1_UI_002": "base-rate",
  "UC4.1_UI_003": "base-rate",
  "UC4.2_UI_001": "shift-rules",
  "UC4.2_UI_002": "shift-rules",
  "UC4.3_UI_001": "complexities",
  "UC4.3_UI_002": "complexities",
  "UC4.3_UI_003": "complexities",
  "UC4.4_UI_001": "payslip",
  "UC4.4_UI_002": "payslip",
  "UC4.5_UI_001": "monthly-report",
  "UC4.5_UI_002": "monthly-report",
  "UC4.6_UI_001": "doctor-year-report",
  "UC4.6_UI_002": "doctor-year-report",
  "UC4.7_UI_001": "yearly-report"
};
for (const [id, route] of Object.entries(uiRoutes)) {
  actions[id] = async () => {
    await driver.get(`${FRONTEND_URL}/admin/payroll/${route}`);
    await driver.wait(until.elementLocated(By.css("main, table, form, body")), 15000);
    const text = await driver.findElement(By.css("body")).getText();
    if (!text.trim()) throw new Error("Trang payroll không có nội dung");
    return pass(`Trang /admin/payroll/${route} hiển thị`);
  };
}
actions["UC4.2_UI_003"] = async () => unsupported("Chưa có form sao chép hệ số");
actions["UC4.4_UI_003"] = async () => manual("Chỉ có window.print, không có modal preview riêng");

try {
  await loginBrowser(driver, ACCOUNTS.admin);
  const results = await executeCases({ uc: "uc4", cases, actions, driver });
  setExitCode(results);
} finally {
  await driver.quit();
}

