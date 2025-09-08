import { expect, Page } from '@playwright/test';
import log from '../utils/logger';
import { ReportHelper } from '../utils/ReportHelper';   // ✅ import helper
import { HeadingLevel } from 'docx';
import { captureScreenshot } from '../utils/helper';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput;
  readonly passwordInput;
  readonly loginButton;
  readonly errorMessage;
  private report: ReportHelper;

  constructor(page: Page, report: ReportHelper) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorMessage = page.locator('[data-test="error"]');
    this.report = report; // Initialize ReportHelper
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    try {
        await this.usernameInput.fill(username);
        log.info(`Filling username: ${username}`);
        await this.passwordInput.fill(password);
        log.info(`Filling password: *******`);
        // await this.report.addScreenshot(this.page, 'Login Page Screenshot'); // Capture screenshot for report
        await captureScreenshot(this.page, 'Login Details'); // Capture screenshot for Allure
        await this.loginButton.click();
        log.info(`Clicking login button`);

        await expect(this.page).toHaveURL(/inventory.html/);
        log.info(`Login successful, redirected to inventory page`);
        await expect(this.page.locator('.title')).toHaveText('Products');
        log.info(`Product title verified`);
        // await this.report.addScreenshot(this.page, 'Login Success Screenshot'); // Capture screenshot for report
        await captureScreenshot(this.page, 'Login Success'); // Capture screenshot for Allure
    } catch (error) {
        log.error(`Login failed: ${error}`);
        // await this.report.addScreenshot(this.page, 'Login Failure Screenshot'); // Capture screenshot for report
        await captureScreenshot(this.page, 'Login Failure'); // Capture screenshot for Allure
        throw error; // Re-throw the error to be handled by the test
    }
    
  }
}
