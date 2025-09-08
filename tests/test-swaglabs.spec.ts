import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { readExcel } from '../utils/helper';
import path from 'path';
import { ReportHelper } from '../utils/ReportHelper';   // ✅ import helper
import { HeadingLevel } from 'docx';
import { faker } from '@faker-js/faker';
import { ac } from '@faker-js/faker/dist/airline-CLphikKp';


const filePath = path.join(__dirname, '../testdata/swaglabs_data.xlsx');
const testData = readExcel(filePath, 'swaglabs');

// Read testcase ID from CLI (default: run all if not provided)
const testId = process.env.TEST_ID;

const filteredData = testId
  ? testData.filter((row: any) => row.testcase_id === testId)
  : testData;

// Register each test separately
filteredData.forEach((data: any) => {
  test(`${data.testcase_id} - ${data.test_scenario}`, async ({ page }) => {
    
    const report = new ReportHelper(`${data.testcase_id} Report`);
    
    
    // ✅ Initialize ReportHelper
    const startTime = new Date();
    let result: "PASS" | "FAIL" = "PASS";
    const endTime = new Date();

      report.addTestInfo(
        data.testcase_id,
        data.test_scenario,
        {
          Username: data.username,
          Password: data.password,
          Product: data.product,
          'Add to Cart': data.add_to_cart,
        },
        result,
        startTime,
        endTime
      );

    const loginPage = new LoginPage(page, report);
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);




    try {
      await report.clearTempScreenshots();

      await loginPage.goto();
      await loginPage.login(data.username, data.password);

      await inventoryPage.addToCart(data.product, data.productDetails);

      const action = data.action
      if (action === 'Checkout' ){
        await checkoutPage.checkout();
      // Generate random user data using faker
        const lastName = faker.person.lastName();
        const zipCode = faker.location.zipCode();      
        await checkoutPage.fillCheckoutInfo(data.first_name, lastName, zipCode);
        await checkoutPage.verifySuccessfulCheckout();
      } else if (action === 'Remove') {
        await checkoutPage.removeItemFromCart(data.product);
        await checkoutPage.verifyRemoveItem(data.product);
      }
      
      

      await page.waitForTimeout(3000);
    } catch (error) {
      result = 'FAIL';
      throw error; // Re-throw the error to be handled by the test
    } finally {

      await report.saveReport();
      // await report.clearTempScreenshots();
    }


    // ✅ Use assertion instead of timeout
    // if (data.expected === 'success') {
    //   await expect(page).toHaveURL(/inventory.html/);
    //   await expect(page.locator('.title')).toHaveText('Products');
    // } else {
    //   await expect(page.locator('[data-test="error"]')).toBeVisible();
    // }
    
  });
});
