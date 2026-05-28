import assert from "node:assert/strict";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:5000/api/v1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mec.vn";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const HEADLESS = process.env.HEADLESS !== "false";
const RUN_ID = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const RUN_OFFSET_DAYS = Number(RUN_ID.slice(-6)) % 3000;

function isoDate(dayOffset) {
  return new Date(Date.UTC(2036, 0, 1 + RUN_OFFSET_DAYS + dayOffset))
    .toISOString()
    .slice(0, 10);
}

const dates = {
  validStart: isoDate(0),
  validEnd: isoDate(2),
  editedEnd: isoDate(5),
  invalidStart: isoDate(10),
  invalidEnd: isoDate(8),
  overlapBaseStart: isoDate(20),
  overlapBaseEnd: isoDate(22),
  overlapStart: isoDate(21),
  overlapEnd: isoDate(23),
  blockedDate: isoDate(30),
  softDeleteDate: isoDate(40)
};

const names = {
  valid: `Selenium Holiday Valid ${RUN_ID}`,
  overlapBase: `Selenium Holiday Overlap Base ${RUN_ID}`,
  overlap: `Selenium Holiday Overlap ${RUN_ID}`,
  blocker: `Selenium Holiday Blocker ${RUN_ID}`,
  softDelete: `Selenium Holiday Soft Delete ${RUN_ID}`
};

function buildChromeOptions() {
  const options = new chrome.Options();
  if (HEADLESS) {
    options.addArguments("--headless=new");
  }
  options.addArguments(
    "--window-size=1440,1000",
    "--disable-dev-shm-usage",
    "--no-sandbox"
  );
  return options;
}

function passResult(actual) {
  return { status: "Pass", actual };
}

function failResult(actual) {
  return { status: "Fail", actual };
}

async function waitForRoute(driver, pathFragment) {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes(pathFragment);
  }, 10000);
}

async function login(driver) {
  await driver.get(`${FRONTEND_URL}/login`);
  await driver.findElement(By.css('input[type="email"]')).sendKeys(ADMIN_EMAIL);
  await driver.findElement(By.css('input[type="password"]')).sendKeys(ADMIN_PASSWORD);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await waitForRoute(driver, "/admin");
  await driver.wait(until.elementLocated(By.css("aside")), 10000);
}

async function api(driver, path, options = {}) {
  return driver.executeAsyncScript(
    async (apiUrl, requestPath, requestOptions, done) => {
      try {
        const token = window.localStorage.getItem("mec_token");
        const response = await fetch(`${apiUrl}${requestPath}`, {
          ...requestOptions,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(requestOptions.headers || {})
          }
        });
        const text = await response.text();
        let body = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch {
          body = { raw: text };
        }
        done({ ok: response.ok, status: response.status, body });
      } catch (error) {
        done({ ok: false, status: 0, body: { message: error.message } });
      }
    },
    API_URL,
    path,
    options
  );
}

async function apiJson(driver, path) {
  const response = await api(driver, path);
  assert.equal(response.ok, true, response.body?.message || `GET ${path} failed`);
  return response.body;
}

async function createHolidayApi(driver, payload) {
  const response = await api(driver, "/holidays", {
    method: "POST",
    body: JSON.stringify({ holidayType: "LE", notes: "Created by Selenium", ...payload })
  });
  assert.equal(response.ok, true, response.body?.message || "Create holiday API failed");
  return response;
}

async function findHolidayByName(driver, name) {
  const body = await apiJson(driver, "/holidays");
  return (body.data || []).find((holiday) => holiday.name === name);
}

async function openHolidaysPage(driver) {
  await driver.get(`${FRONTEND_URL}/admin/holidays`);
  await driver.wait(until.elementLocated(By.css("table, body")), 10000);
}

async function openHolidayModal(driver) {
  await openHolidaysPage(driver);
  const addButton = await driver.wait(
    until.elementLocated(By.xpath("//button[.//span[normalize-space(.)='add']]")),
    10000
  );
  await addButton.click();
  await driver.wait(until.elementLocated(By.css("form")), 10000);
}

async function setDateInput(driver, index, value) {
  const inputs = await driver.findElements(By.css('form input[type="date"]'));
  await driver.executeScript(
    `
      const input = arguments[0];
      const value = arguments[1];
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    `,
    inputs[index],
    value
  );
}

async function fillHolidayForm(driver, { name, startDate, endDate, notes = "" }) {
  if (name !== undefined) {
    const nameInput = await driver.findElement(By.css('form input[type="text"]'));
    await nameInput.clear();
    if (name) await nameInput.sendKeys(name);
  }
  if (startDate !== undefined) await setDateInput(driver, 0, startDate);
  if (endDate !== undefined) await setDateInput(driver, 1, endDate);
  const textareas = await driver.findElements(By.css("form textarea"));
  if (textareas[0]) {
    await textareas[0].clear();
    if (notes) await textareas[0].sendKeys(notes);
  }
}

async function submitHolidayForm(driver) {
  await driver.findElement(By.css('form button[type="submit"]')).click();
}

async function createHolidayViaUi(driver, payload) {
  await openHolidayModal(driver);
  await fillHolidayForm(driver, payload);
  await submitHolidayForm(driver);
}

async function isModalOpen(driver) {
  return (await driver.findElements(By.css("form"))).length > 0;
}

async function getFormValidity(driver) {
  return driver.executeScript(() => {
    const form = document.querySelector("form");
    const invalid = document.querySelector("form :invalid");
    return {
      valid: form?.checkValidity() ?? false,
      invalidType: invalid?.getAttribute("type") || invalid?.tagName || ""
    };
  });
}

async function findHolidayRow(driver, name) {
  return driver.wait(
    until.elementLocated(By.xpath(`//tr[td[contains(normalize-space(.), "${name}")]]`)),
    10000
  );
}

async function clickRowAction(driver, name, actionIndex) {
  await openHolidaysPage(driver);
  const row = await findHolidayRow(driver, name);
  const buttons = await row.findElements(By.css("button"));
  await driver.executeScript("arguments[0].click();", buttons[actionIndex]);
}

async function editHolidayEndDate(driver, name, nextEndDate) {
  await clickRowAction(driver, name, 0);
  await driver.wait(until.elementLocated(By.css("form")), 10000);
  await setDateInput(driver, 1, nextEndDate);
  await submitHolidayForm(driver);
}

async function fetchRequiredBusinessData(driver) {
  const patients = await apiJson(driver, "/patients");
  const doctors = await apiJson(driver, "/users?role=DOCTOR");
  const shifts = await apiJson(driver, "/shifts");
  const services = await apiJson(driver, "/services");

  return {
    patient: patients.data?.[0],
    doctor: doctors.data?.[0],
    shift: shifts.data?.[0],
    service: services.data?.[0]
  };
}

async function runCase(results, testCase, input, expected, action) {
  try {
    const result = await action();
    results.push({
      testCase,
      input,
      expected,
      programResult: result.actual,
      status: result.status
    });
  } catch (error) {
    results.push({
      testCase,
      input,
      expected,
      programResult: error.message,
      status: "Fail"
    });
  }
}

async function run() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(buildChromeOptions())
    .build();

  const results = [];

  try {
    await login(driver);

    await runCase(
      results,
      "Thêm ngày nghỉ lễ hợp lệ với đầy đủ thông tin.",
      `${names.valid}, ${dates.validStart} -> ${dates.validEnd}`,
      "Ngày nghỉ được tạo, trạng thái ACTIVE",
      async () => {
        await createHolidayViaUi(driver, {
          name: names.valid,
          startDate: dates.validStart,
          endDate: dates.validEnd,
          notes: "Selenium full valid data"
        });
        await driver.wait(async () => !(await isModalOpen(driver)), 10000);
        const holiday = await findHolidayByName(driver, names.valid);
        return holiday?.status === "ACTIVE"
          ? passResult(`Created with status ${holiday.status}`)
          : failResult("Holiday was not created as ACTIVE");
      }
    );

    await runCase(
      results,
      "Thêm ngày nghỉ khi bỏ trống trường Tên ngày nghỉ (bắt buộc).",
      `Tên ngày nghỉ: empty, ${dates.validStart} -> ${dates.validEnd}`,
      "Form bị chặn do thiếu tên ngày nghỉ",
      async () => {
        await openHolidayModal(driver);
        await fillHolidayForm(driver, {
          name: "",
          startDate: dates.validStart,
          endDate: dates.validEnd
        });
        await submitHolidayForm(driver);
        const validity = await getFormValidity(driver);
        return !validity.valid && validity.invalidType === "text"
          ? passResult("Browser validation blocked empty required name")
          : failResult(`Unexpected validity: ${JSON.stringify(validity)}`);
      }
    );

    await runCase(
      results,
      "Thêm ngày nghỉ khi bỏ trống Ngày bắt đầu (bắt buộc).",
      `Tên: Selenium Missing Start ${RUN_ID}, Ngày bắt đầu: empty`,
      "Form bị chặn do thiếu ngày bắt đầu",
      async () => {
        await openHolidayModal(driver);
        await fillHolidayForm(driver, {
          name: `Selenium Missing Start ${RUN_ID}`,
          startDate: "",
          endDate: dates.validEnd
        });
        await submitHolidayForm(driver);
        const validity = await getFormValidity(driver);
        return !validity.valid && validity.invalidType === "date"
          ? passResult("Browser validation blocked empty required start date")
          : failResult(`Unexpected validity: ${JSON.stringify(validity)}`);
      }
    );

    await runCase(
      results,
      "Thêm ngày nghỉ khi Ngày kết thúc nhỏ hơn Ngày bắt đầu.",
      `${dates.invalidStart} -> ${dates.invalidEnd}`,
      "Hệ thống báo lỗi và không tạo ngày nghỉ",
      async () => {
        const invalidName = `Selenium Invalid Range ${RUN_ID}`;
        await createHolidayViaUi(driver, {
          name: invalidName,
          startDate: dates.invalidStart,
          endDate: dates.invalidEnd
        });
        await driver.wait(until.elementLocated(By.css(".text-rose-600, .text-rose-700")), 10000);
        const holiday = await findHolidayByName(driver, invalidName);
        return !holiday
          ? passResult("Rejected invalid date range")
          : failResult("Invalid date range was created");
      }
    );

    await runCase(
      results,
      "Thêm ngày nghỉ có khoảng thời gian trùng với ngày nghỉ đã tồn tại.",
      `${dates.overlapStart} -> ${dates.overlapEnd} overlaps ${dates.overlapBaseStart} -> ${dates.overlapBaseEnd}`,
      "Hệ thống báo lỗi và không tạo ngày nghỉ trùng thời gian",
      async () => {
        await createHolidayApi(driver, {
          name: names.overlapBase,
          startDate: dates.overlapBaseStart,
          endDate: dates.overlapBaseEnd
        });
        await createHolidayViaUi(driver, {
          name: names.overlap,
          startDate: dates.overlapStart,
          endDate: dates.overlapEnd
        });
        await driver.sleep(700);
        const holiday = await findHolidayByName(driver, names.overlap);
        return !holiday
          ? passResult("Rejected overlapping holiday")
          : failResult("Program allowed overlapping holiday");
      }
    );

    await runCase(
      results,
      "Chỉnh sửa thông tin ngày nghỉ hợp lệ (cập nhật ngày kết thúc).",
      `${names.valid}: endDate ${dates.validEnd} -> ${dates.editedEnd}`,
      "Ngày kết thúc được cập nhật",
      async () => {
        await editHolidayEndDate(driver, names.valid, dates.editedEnd);
        await driver.wait(async () => !(await isModalOpen(driver)), 10000);
        const holiday = await findHolidayByName(driver, names.valid);
        return holiday?.endDate?.startsWith(dates.editedEnd)
          ? passResult(`Updated endDate to ${holiday.endDate.slice(0, 10)}`)
          : failResult(`endDate is ${holiday?.endDate}`);
      }
    );

    await runCase(
      results,
      "Ngưng áp dụng ngày nghỉ đang ACTIVE.",
      names.valid,
      "Ngày nghỉ chuyển sang INACTIVE",
      async () => {
        await clickRowAction(driver, names.valid, 1);
        await driver.wait(async () => {
          const holiday = await findHolidayByName(driver, names.valid);
          return holiday?.status === "INACTIVE";
        }, 10000);
        const holiday = await findHolidayByName(driver, names.valid);
        return holiday?.status === "INACTIVE"
          ? passResult("Status changed to INACTIVE")
          : failResult(`Status is ${holiday?.status}`);
      }
    );

    await runCase(
      results,
      "Kiểm tra ngày nghỉ ACTIVE chặn đặt lịch khám.",
      `${names.blocker}, appointment date ${dates.blockedDate}`,
      "API đặt lịch trả lỗi 400 do ngày nghỉ ACTIVE",
      async () => {
        await createHolidayApi(driver, {
          name: names.blocker,
          startDate: dates.blockedDate,
          endDate: dates.blockedDate
        });
        const data = await fetchRequiredBusinessData(driver);
        if (!data.patient || !data.doctor || !data.shift || !data.service) {
          return failResult("Missing seed data: patient/doctor/shift/service");
        }
        const response = await api(driver, "/appointments", {
          method: "POST",
          body: JSON.stringify({
            patientId: data.patient._id,
            doctorId: data.doctor._id,
            shiftId: data.shift._id,
            date: dates.blockedDate,
            serviceId: data.service._id,
            symptoms: "Selenium blocked by active holiday"
          })
        });
        return response.status === 400 && /ngày nghỉ|ngh/i.test(response.body?.message || "")
          ? passResult(`Blocked appointment: ${response.body.message}`)
          : failResult(`Unexpected response ${response.status}: ${response.body?.message}`);
      }
    );

    await runCase(
      results,
      "Kiểm tra ngày nghỉ ACTIVE chặn đăng ký lịch trực bác sĩ.",
      `${names.blocker}, duty date ${dates.blockedDate}`,
      "API đăng ký lịch trực trả lỗi 400 do ngày nghỉ ACTIVE",
      async () => {
        const data = await fetchRequiredBusinessData(driver);
        if (!data.doctor || !data.shift) {
          return failResult("Missing seed data: doctor/shift");
        }
        const response = await api(driver, "/duty-schedules", {
          method: "POST",
          body: JSON.stringify({
            doctorId: data.doctor._id,
            shiftId: data.shift._id,
            date: dates.blockedDate
          })
        });
        return response.status === 400 && /ngày nghỉ|ngh/i.test(response.body?.message || "")
          ? passResult(`Blocked duty schedule: ${response.body.message}`)
          : failResult(`Unexpected response ${response.status}: ${response.body?.message}`);
      }
    );

    await runCase(
      results,
      "Xác nhận dữ liệu ngày nghỉ không bị xóa cứng khỏi hệ thống.",
      names.softDelete,
      "Sau khi ngưng áp dụng, bản ghi vẫn còn trong danh sách với status INACTIVE",
      async () => {
        await createHolidayApi(driver, {
          name: names.softDelete,
          startDate: dates.softDeleteDate,
          endDate: dates.softDeleteDate
        });
        await clickRowAction(driver, names.softDelete, 1);
        await driver.wait(async () => {
          const holiday = await findHolidayByName(driver, names.softDelete);
          return holiday?.status === "INACTIVE";
        }, 10000);
        const holiday = await findHolidayByName(driver, names.softDelete);
        return holiday?.status === "INACTIVE"
          ? passResult("Record still exists with status INACTIVE")
          : failResult("Record missing or not INACTIVE");
      }
    );
  } finally {
    console.table(results);
    const failed = results.filter((result) => result.status !== "Pass");
    if (failed.length > 0) {
      console.error(`${failed.length}/${results.length} holiday Selenium cases failed`);
      process.exitCode = 1;
    } else {
      console.log("All holiday Selenium cases passed");
    }
    await driver.quit();
  }
}

run().catch((error) => {
  console.error("Holiday Selenium tests crashed");
  console.error(error);
  process.exitCode = 1;
});
