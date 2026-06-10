import fs from "node:fs/promises";
import path from "node:path";
import {
  ACCOUNTS,
  RESULTS_DIR,
  loginApi,
  request
} from "../lib/qa-core.mjs";

const admin = await loginApi(ACCOUNTS.admin);
const receptionist = await loginApi(ACCOUNTS.receptionist);
const tests = [
  ["SEC_AUTH_001", "API bảo vệ từ chối request không có JWT", "/users", {}, "", [401]],
  ["SEC_AUTH_002", "API bảo vệ từ chối JWT giả", "/services", {}, "invalid.jwt.token", [401]],
  ["SEC_UC1_001", "Lễ tân không được tạo tài khoản", "/users", {
    method: "POST",
    body: JSON.stringify({
      fullName: "Security Test",
      email: "security@mec.test",
      phone: "0900000000",
      password: "Security9",
      role: "RECEPTIONIST"
    })
  }, receptionist.token, [403]],
  ["SEC_UC1_002", "Lễ tân không được sửa giá dịch vụ", "/services/000000000000000000000000", {
    method: "PUT",
    body: JSON.stringify({ price: 1 })
  }, receptionist.token, [403]],
  ["SEC_UC2_001", "Object ID lịch khám sai không làm lộ stack trace", "/appointments/not-an-object-id/status", {
    method: "PATCH",
    body: JSON.stringify({ status: "CONFIRMED" })
  }, admin.token, [400, 404]],
  ["SEC_UC3_001", "Không cho gọi API hóa đơn khi thiếu token", "/invoices", {}, "", [401]],
  ["SEC_UC4_001", "Lễ tân không được xem dữ liệu lương", "/salaries/payslips", {}, receptionist.token, [403]],
  ["SEC_INPUT_001", "Payload tìm kiếm dạng injection không gây lỗi máy chủ", "/users?search=%24where%3Afunction()", {}, admin.token, [200]]
];

const results = [];
for (const [id, description, endpoint, options, token, expectedStatuses] of tests) {
  try {
    const response = await request(endpoint, options, token);
    const bodyText = JSON.stringify(response.body || {});
    const statusOk = expectedStatuses.includes(response.status);
    const leaksStack = /node_modules|at\s+\w+\s+\(|MongoServerError|CastError.*at/i.test(bodyText);
    results.push({
      id,
      description,
      expected: `HTTP ${expectedStatuses.join("/")}, không lộ stack trace`,
      programResult: `HTTP ${response.status}${leaksStack ? ", phát hiện dấu hiệu stack trace" : ""}`,
      status: statusOk && !leaksStack ? "Pass" : "Fail"
    });
  } catch (error) {
    results.push({
      id,
      description,
      expected: `HTTP ${expectedStatuses.join("/")}`,
      programResult: error.message,
      status: "Fail"
    });
  }
}

await fs.mkdir(RESULTS_DIR, { recursive: true });
await fs.writeFile(
  path.join(RESULTS_DIR, "security.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  "utf8"
);
console.table(results);
if (results.some((item) => item.status === "Fail")) process.exitCode = 1;

