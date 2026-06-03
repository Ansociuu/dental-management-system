import assert from "node:assert/strict";
import autocannon from "autocannon";

const API_URL = process.env.API_URL || "http://localhost:5000/api/v1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mec.vn";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SEED_PASSWORD || "123456";
const CONNECTIONS = Number(process.env.CONNECTIONS || 20);
const DURATION = Number(process.env.DURATION || 15);
const MAX_AVG_LATENCY_MS = Number(process.env.MAX_AVG_LATENCY_MS || 1000);
const MAX_P95_LATENCY_MS = Number(process.env.MAX_P95_LATENCY_MS || 3000);
const MIN_AVG_REQ_PER_SEC = Number(process.env.MIN_AVG_REQ_PER_SEC || 10);
const PERF_STRICT = process.env.PERF_STRICT !== "false";

async function api(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return { ok: response.ok, status: response.status, body };
}

async function login() {
  const response = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  assert.equal(response.ok, true, response.body?.message || "Login failed");
  assert.ok(response.body?.token, "Login response must include token");
  return response.body.token;
}

function runAutocannon(options) {
  return new Promise((resolve, reject) => {
    autocannon(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

async function smokeWriteSanity(token) {
  const today = new Date().toISOString().slice(0, 10);
  const endpoints = [
    `/appointments/monitor?date=${today}`,
    `/invoices/pending?date=${today}`,
    `/invoices?dateFrom=${today}&dateTo=${today}`,
    "/reports/doctor-performance",
    "/reports/patients-services"
  ];

  for (const endpoint of endpoints) {
    const response = await api(endpoint, {}, token);
    assert.equal(response.ok, true, response.body?.message || `${endpoint} smoke check failed`);
  }
}

async function loadScenario(token, name, path) {
  const result = await runAutocannon({
    url: `${API_URL}${path}`,
    connections: CONNECTIONS,
    duration: DURATION,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const summary = {
    scenario: name,
    path,
    connections: CONNECTIONS,
    duration: DURATION,
    requests: result.requests.total,
    averageReqPerSec: result.requests.average,
    averageLatencyMs: result.latency.average,
    p95LatencyMs: result.latency.p95,
    errors: result.errors,
    timeouts: result.timeouts,
    non2xx: result.non2xx
  };

  const failures = [];
  if (result.errors !== 0) failures.push(`errors=${result.errors}`);
  if (result.timeouts !== 0) failures.push(`timeouts=${result.timeouts}`);
  if (result.non2xx !== 0) failures.push(`non2xx=${result.non2xx}`);
  if (result.latency.average > MAX_AVG_LATENCY_MS) {
    failures.push(`avg latency ${result.latency.average}ms > ${MAX_AVG_LATENCY_MS}ms`);
  }
  if (result.latency.p95 > MAX_P95_LATENCY_MS) {
    failures.push(`p95 latency ${result.latency.p95}ms > ${MAX_P95_LATENCY_MS}ms`);
  }
  if (result.requests.average < MIN_AVG_REQ_PER_SEC) {
    failures.push(`throughput ${result.requests.average} req/s < ${MIN_AVG_REQ_PER_SEC} req/s`);
  }

  summary.status = failures.length ? "Fail" : "Pass";
  summary.failureReason = failures.join("; ");
  console.table([summary]);

  return summary;
}

const token = await login();
await smokeWriteSanity(token);

const today = new Date().toISOString().slice(0, 10);
const scenarios = [
  ["UC3.1 monitor appointments", `/appointments/monitor?date=${today}`],
  ["UC3.3 pending invoices", `/invoices/pending?date=${today}`],
  ["UC3.3 paid invoices", `/invoices?dateFrom=${today}&dateTo=${today}`],
  ["UC3.4 doctor performance report", "/reports/doctor-performance"],
  ["UC3.4 patient-service report", "/reports/patients-services"]
];

const summaries = [];
for (const [name, path] of scenarios) {
  summaries.push(await loadScenario(token, name, path));
}

console.table(summaries);
const failed = summaries.filter((summary) => summary.status === "Fail");
if (failed.length > 0) {
  console.error(`${failed.length}/${summaries.length} UC3 performance scenario(s) failed threshold checks`);
  console.table(failed.map((summary) => ({
    scenario: summary.scenario,
    averageLatencyMs: summary.averageLatencyMs,
    p95LatencyMs: summary.p95LatencyMs,
    averageReqPerSec: summary.averageReqPerSec,
    failureReason: summary.failureReason
  })));
  if (PERF_STRICT) {
    process.exitCode = 1;
  } else {
    console.log("PERF_STRICT=false, so threshold failures are reported without failing the command");
  }
} else {
  console.log("UC3 Autocannon performance tests passed");
}
