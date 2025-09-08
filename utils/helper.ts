import * as XLSX from 'xlsx';
import { Page, test } from '@playwright/test';
import { attachment } from 'allure-js-commons';
import log from '../utils/logger';


export function readExcel(filePath: string, sheetName: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}


export async function captureScreenshot(page: Page, name: string = 'screenshot') {
  // Save screenshot locally
  const path = `screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });

  // Attach to Allure (using new API)
  try {
    const buffer = await page.screenshot({ fullPage: true });
    attachment(name, buffer, 'image/png');
  } catch (err) {
    console.warn('⚠️ Failed to attach screenshot to Allure:', err);
  }

  return path;
}