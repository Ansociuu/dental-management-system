import fs from "node:fs/promises";
import path from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const API_URL = process.env.API_URL || "http://localhost:5000/api/v1";
export const HEADLESS = process.env.HEADLESS !== "false";
export const PASSWORD = process.env.SEED_PASSWORD || "123456";
export const RUN_ID = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
export const RESULTS_DIR = path.resolve("results");

export const ACCOUNTS = {
  admin: { email: process.env.ADMIN_EMAIL || "admin@mec.vn", password: PASSWORD },
  manager: { email: process.env.MANAGER_EMAIL || "manager@mec.vn", password: PASSWORD },
  receptionist: {
    email: process.env.RECEPTIONIST_EMAIL || "lan.nguyen@mec.vn",
    password: PASSWORD
  },
  doctor: { email: process.env.DOCTOR_EMAIL || "minh.nguyen@mec.vn", password: PASSWORD }
};

export async function request(pathname, options = {}, token = "") {
  const response = await fetch(`${API_URL}${pathname}`, {
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

export async function loginApi(account = ACCOUNTS.admin) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(account)
  });
  if (!response.ok || !response.body?.token) {
    throw new Error(response.body?.message || `Login failed for ${account.email}`);
  }
  return response.body;
}

export async function createDriver() {
  const options = new chrome.Options();
  if (HEADLESS) options.addArguments("--headless=new");
  options.addArguments(
    "--window-size=1440,1000",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-sandbox",
    "--log-level=3"
  );
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

export async function loginBrowser(driver, account = ACCOUNTS.admin) {
  const session = await loginApi(account);
  await driver.get(FRONTEND_URL);
  await driver.executeScript(
    "localStorage.setItem('mec_token', arguments[0]); localStorage.setItem('mec_user', arguments[1]);",
    session.token,
    JSON.stringify(session.data)
  );
  const route = session.data?.role === "DOCTOR"
    ? "/doctor/dashboard"
    : session.data?.role === "RECEPTIONIST"
      ? "/receptionist/dashboard"
      : "/admin/dashboard";
  await driver.get(`${FRONTEND_URL}${route}`);
  await driver.wait(until.elementLocated(By.css("body")), 15000);
  return session;
}

export function pass(programResult) {
  return { status: "Pass", programResult };
}

export function manual(programResult) {
  return { status: "Manual", programResult };
}

export function unsupported(programResult) {
  return { status: "Not Supported", programResult };
}

export function skipped(programResult) {
  return { status: "Skipped", programResult };
}

export async function executeCases({ uc, cases, actions, context = {}, driver = null }) {
  const results = [];
  for (const testCase of cases) {
    try {
      const action = actions[testCase.id];
      const outcome = action
        ? await action(context)
        : unsupported("Chưa có UI/API tương ứng trong hệ thống hiện tại");
      results.push({ ...testCase, ...outcome });
    } catch (error) {
      let screenshot = "";
      if (driver) {
        try {
          await fs.mkdir(path.join(RESULTS_DIR, "screenshots"), { recursive: true });
          screenshot = path.join(RESULTS_DIR, "screenshots", `${testCase.id}.png`);
          await fs.writeFile(screenshot, await driver.takeScreenshot(), "base64");
        } catch {
          screenshot = "";
        }
      }
      results.push({
        ...testCase,
        status: "Fail",
        programResult: error.message,
        ...(screenshot ? { screenshot } : {})
      });
    }
  }
  await writeResults(uc, results);
  return results;
}

export async function writeResults(uc, results) {
  await fs.mkdir(RESULTS_DIR, { recursive: true });
  const generatedAt = new Date().toISOString();
  await fs.writeFile(
    path.join(RESULTS_DIR, `${uc}.json`),
    JSON.stringify({ uc, generatedAt, results }, null, 2),
    "utf8"
  );

  const escape = (value) => String(value ?? "-").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const rows = results.map((item) =>
    `| ${escape(item.id)} | ${escape(item.description)} | ${escape(item.input)} | ${escape(item.expected)} | ${escape(item.programResult)} | ${escape(item.status)} |`
  );
  const markdown = [
    `# Kết quả kiểm thử ${uc.toUpperCase()}`,
    "",
    `Thời gian chạy: ${generatedAt}`,
    "",
    "| Test Case ID | Mô tả | Input | Expected | Program Result | Status |",
    "|---|---|---|---|---|---|",
    ...rows,
    ""
  ].join("\n");
  await fs.writeFile(path.join(RESULTS_DIR, `${uc}.md`), markdown, "utf8");
  console.table(results.map(({ id, description, programResult, status }) => ({
    id,
    description,
    programResult,
    status
  })));
}

export function setExitCode(results) {
  const failures = results.filter((item) => item.status === "Fail");
  if (failures.length) {
    console.error(`${failures.length}/${results.length} automated case(s) failed`);
    process.exitCode = 1;
  } else {
    console.log(`Không có automated case nào Fail (${results.length} case đã ánh xạ)`);
  }
}

export async function expectStatus(pathname, options, token, statuses) {
  const response = await request(pathname, options, token);
  if (!statuses.includes(response.status)) {
    throw new Error(
      `${options?.method || "GET"} ${pathname}: expected ${statuses.join("/")}, got ${response.status}: ${response.body?.message || ""}`
    );
  }
  return response;
}

