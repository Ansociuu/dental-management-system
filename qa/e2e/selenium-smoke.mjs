import assert from "node:assert/strict";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mec.vn";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const HEADLESS = process.env.HEADLESS !== "false";

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

async function waitForRoute(driver, pathFragment) {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes(pathFragment);
  }, 10000);
}

async function findButtonByText(driver, text) {
  return driver.wait(
    until.elementLocated(
      By.xpath(`//button[contains(normalize-space(.), "${text}")]`)
    ),
    10000
  );
}

async function run() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(buildChromeOptions())
    .build();

  try {
    await driver.get(FRONTEND_URL);
    await driver.wait(until.elementLocated(By.css("nav")), 10000);
    const publicHeading = await driver.findElement(By.css("body")).getText();
    assert.match(publicHeading, /Mec/i, "Landing page should show the Mec brand");

    await driver.get(`${FRONTEND_URL}/admin/dashboard`);
    await waitForRoute(driver, "/login");

    await driver.get(`${FRONTEND_URL}/login`);
    await driver.findElement(By.css('input[type="email"]')).sendKeys(ADMIN_EMAIL);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(ADMIN_PASSWORD);
    const loginButton = await findButtonByText(driver, "Nháº­p");
    await loginButton.click();

    await waitForRoute(driver, "/admin");
    await driver.wait(until.elementLocated(By.css("aside")), 10000);
    const adminText = await driver.findElement(By.css("body")).getText();
    assert.match(
      adminText,
      /Mec|dashboard|Tá»•ng quan/i,
      "Admin dashboard should render after login"
    );

    const logoutButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'xuáº¥t')]")),
      10000
    );
    await logoutButton.click();
    await waitForRoute(driver, "/login");

    console.log("Selenium smoke tests passed");
  } finally {
    await driver.quit();
  }
}

run().catch((error) => {
  console.error("Selenium smoke tests failed");
  console.error(error);
  process.exitCode = 1;
});
