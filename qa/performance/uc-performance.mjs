import fs from "node:fs/promises";
import path from "node:path";
import autocannon from "autocannon";
import { ACCOUNTS, API_URL, RESULTS_DIR, loginApi, request } from "../lib/qa-core.mjs";

const uc = String(process.argv[2] || "").toLowerCase();
const CONNECTIONS = Number(process.env.CONNECTIONS || 20);
const DURATION = Number(process.env.DURATION || 15);
const MAX_AVG_LATENCY_MS = Number(process.env.MAX_AVG_LATENCY_MS || 1000);
const MAX_P97_5_LATENCY_MS = Number(process.env.MAX_P97_5_LATENCY_MS || 2000);
const MIN_AVG_REQ_PER_SEC = Number(process.env.MIN_AVG_REQ_PER_SEC || 10);
const PERF_STRICT = process.env.PERF_STRICT !== "false";
const today = new Date().toISOString().slice(0, 10);
const month = today.slice(0, 7);
const year = today.slice(0, 4);

const scenarioMap = {
  uc1: [
    ["UC1 - Danh sách tài khoản", "/users"],
    ["UC1 - Danh sách bác sĩ", "/users?role=DOCTOR"],
    ["UC1 - Danh sách dịch vụ", "/services"],
    ["UC1 - Tìm kiếm dịch vụ", "/services?search=Kham"]
  ],
  uc2: [
    ["UC2 - Danh sách ngày nghỉ", "/holidays"],
    ["UC2 - Danh sách ca làm việc", "/shifts"],
    ["UC2 - Danh sách lịch trực", "/duty-schedules"],
    ["UC2 - Theo dõi lịch khám", `/appointments/monitor?date=${today}`],
    ["UC2 - Danh sách bệnh nhân", "/patients"]
  ],
  uc3: [
    ["UC3 - Theo dõi tiếp đón", `/appointments/monitor?date=${today}`],
    ["UC3 - Hóa đơn chờ thanh toán", `/invoices/pending?date=${today}`],
    ["UC3 - Hóa đơn đã thanh toán", `/invoices?dateFrom=${today}&dateTo=${today}`],
    ["UC3 - Hiệu suất bác sĩ", "/reports/doctor-performance"],
    ["UC3 - Bệnh nhân và dịch vụ", "/reports/patients-services"]
  ],
  uc4: [
    ["UC4 - Mức tiền cơ bản", "/salaries/settings/base-rate"],
    ["UC4 - Hệ số ca", "/salaries/shift-rules"],
    ["UC4 - Phiếu lương", `/salaries/payslips?month=${month}`],
    ["UC4 - Báo cáo lương tháng", `/salaries/reports/monthly?month=${month}`],
    ["UC4 - Báo cáo lương năm", `/salaries/reports/yearly?year=${year}`]
  ]
};

if (!scenarioMap[uc]) {
  throw new Error("Usage: node performance/uc-performance.mjs <uc1|uc2|uc3|uc4>");
}

const session = await loginApi(ACCOUNTS.admin);
for (const [, endpoint] of scenarioMap[uc]) {
  const smoke = await request(endpoint, {}, session.token);
  if (!smoke.ok) throw new Error(`${endpoint} smoke failed: ${smoke.status} ${smoke.body?.message || ""}`);
}

const run = (options) => new Promise((resolve, reject) => {
  autocannon(options, (error, result) => error ? reject(error) : resolve(result));
});

const summaries = [];
for (const [scenario, endpoint] of scenarioMap[uc]) {
  const result = await run({
    url: `${API_URL}${endpoint}`,
    connections: CONNECTIONS,
    duration: DURATION,
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json"
    }
  });
  const p97_5LatencyMs = result.latency.p97_5;
  const failures = [];
  if (result.errors) failures.push(`errors=${result.errors}`);
  if (result.timeouts) failures.push(`timeouts=${result.timeouts}`);
  if (result.non2xx) failures.push(`non2xx=${result.non2xx}`);
  if (result.latency.average > MAX_AVG_LATENCY_MS) {
    failures.push(`avg ${result.latency.average}ms > ${MAX_AVG_LATENCY_MS}ms`);
  }
  if (p97_5LatencyMs > MAX_P97_5_LATENCY_MS) {
    failures.push(`p97.5 ${p97_5LatencyMs}ms > ${MAX_P97_5_LATENCY_MS}ms`);
  }
  if (result.requests.average < MIN_AVG_REQ_PER_SEC) {
    failures.push(`throughput ${result.requests.average} < ${MIN_AVG_REQ_PER_SEC} req/s`);
  }
  summaries.push({
    scenario,
    path: endpoint,
    connections: CONNECTIONS,
    duration: DURATION,
    requests: result.requests.total,
    averageReqPerSec: result.requests.average,
    averageLatencyMs: result.latency.average,
    p97_5LatencyMs,
    errors: result.errors,
    timeouts: result.timeouts,
    non2xx: result.non2xx,
    status: failures.length ? "Fail" : "Pass",
    failureReason: failures.join("; ")
  });
}

await fs.mkdir(RESULTS_DIR, { recursive: true });
await fs.writeFile(
  path.join(RESULTS_DIR, `${uc}-performance.json`),
  JSON.stringify({
    uc,
    generatedAt: new Date().toISOString(),
    thresholds: {
      maxAverageLatencyMs: MAX_AVG_LATENCY_MS,
      maxP97_5LatencyMs: MAX_P97_5_LATENCY_MS,
      minAverageReqPerSec: MIN_AVG_REQ_PER_SEC
    },
    summaries
  }, null, 2),
  "utf8"
);
console.table(summaries);
const failed = summaries.filter((item) => item.status === "Fail");
if (failed.length && PERF_STRICT) process.exitCode = 1;

