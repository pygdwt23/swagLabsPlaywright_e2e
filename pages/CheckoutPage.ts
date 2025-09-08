import { expect, Page } from '@playwright/test';
import log from '../utils/logger';
import { captureScreenshot } from '../utils/helper';


export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput;
  readonly lastNameInput;
  readonly postalCodeInput;
  readonly continueButton;
  
  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.getByRole('button', { name: 'CONTINUE' });
  }

  async checkout() {
    try {
        log.info(`Initiating checkout process`);
        const checkoutButton = this.page.locator('#checkout');
        await checkoutButton.waitFor({ state: 'visible' });
        await checkoutButton.click();
        log.info(`Clicked 'Checkout' button`);
        await expect(this.page).toHaveURL(/checkout-step-one.html/);
        log.info(`Navigated to checkout step one page`);
        // await this.page.screenshot({ path: `screenshots/checkout_step_one.png`, fullPage: true });
        await captureScreenshot(this.page, 'Checkout Step One'); // Capture screenshot for Allure
        log.info(`Screenshot taken of checkout step one page`);
    } catch (error) {
      await captureScreenshot(this.page, 'Checkout Failure'); // Capture screenshot for Allure
      log.error(`Failed to initiate checkout: ${error}`);
      throw error; // Re-throw the error to be handled by the test
    }
  }

  async removeItemFromCart(itemName: string) {
    try {
        log.info(`Attempting to remove item: ${itemName} from cart`);
        const itemLocator = this.page.locator('.cart_item').filter({ hasText: itemName });
        const removeButton = itemLocator.locator('button').filter({ hasText: 'Remove' });
        await removeButton.click();
        log.info(`Clicked 'Remove' button for item: ${itemName}`);
        await expect(itemLocator).toHaveCount(0);
        log.info(`Verified item: ${itemName} has been removed from cart`);
        // await this.page.screenshot({ path: `screenshots/item_removed_${itemName.replace(/\s+/g, '_')}.png`, fullPage: true });
        await captureScreenshot(this.page, `Item Removed ${itemName}`); // Capture screenshot for Allure
        log.info(`Screenshot taken after removing item: ${itemName}`);
    } catch (error) {
      log.error(`Failed to remove item: ${itemName} from cart: ${error}`);
      await captureScreenshot(this.page, `Remove Item Failure ${itemName}`); // Capture screenshot for Allure
      throw error; // Re-throw the error to be handled by the test
    }
  }

  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
    try {
        log.info(`Filling checkout information: ${firstName} ${lastName}, Postal Code: ${postalCode}`);
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
        log.info(`Filled in checkout information`);
        // await this.page.screenshot({ path: `screenshots/checkout_info_filled.png`, fullPage: true });
        await captureScreenshot(this.page, 'Checkout Info Filled'); // Capture screenshot for Allure
        log.info(`Screenshot taken after filling checkout information`);
        await this.continueButton.click();
        log.info(`Clicked 'Continue' button`);
        await expect(this.page).toHaveURL(/checkout-step-two.html/);
        log.info(`Navigated to checkout step two page`);
        // await this.page.screenshot({ path: `screenshots/checkout_step_two.png`, fullPage: true });
        await captureScreenshot(this.page, 'Checkout Step Two'); // Capture screenshot for Allure
        log.info(`Screenshot taken of checkout step two page`);
    } catch (error) {
      log.error(`Failed to fill checkout information: ${error}`);
      await captureScreenshot(this.page, 'Checkout Info Failure'); // Capture screenshot for Allure
      throw error; // Re-throw the error to be handled by the test
    }
  }

  async verifySuccessfulCheckout() {
    try {
        log.info(`Verifying successful checkout`);
        const finishButton = this.page.getByRole('button', { name: 'FINISH' });
        await finishButton.click();
        log.info(`Clicked 'Finish' button`);
        await expect(this.page).toHaveURL(/checkout-complete.html/);
        log.info(`Navigated to checkout complete page`);
        const thankYouMessage = this.page.locator('.complete-header');
        await expect(thankYouMessage).toHaveText('Thank you for your order!');
        log.info(`Verified thank you message`);
        // await this.page.screenshot({ path: `screenshots/checkout_complete.png`, fullPage: true });
        await captureScreenshot(this.page, 'Checkout Complete'); // Capture screenshot for Allure
        log.info(`Screenshot taken of checkout complete page`);
    } catch (error) {
      log.error(`Failed to verify successful checkout: ${error}`);
      await captureScreenshot(this.page, 'Checkout Complete Failure'); // Capture screenshot for Allure
      throw error; // Re-throw the error to be handled by the test
    }
  }

  async verifyRemoveItem(itemName: string) {
    try {
        log.info(`Verifying removal of item: ${itemName} from cart`);
        const itemLocator = this.page.locator('.cart_item').filter({ hasText: itemName });
        await expect(itemLocator).toHaveCount(0);
        log.info(`Verified item: ${itemName} is no longer in the cart`);
        // await this.page.screenshot({ path: `screenshots/verify_item_removed_${itemName.replace(/\s+/g, '_')}.png`, fullPage: true });
        await captureScreenshot(this.page, `Verify Item Removed ${itemName}`); // Capture screenshot for Allure
        log.info(`Screenshot taken after verifying removal of item: ${itemName}`);
    } catch (error) {
      log.error(`Failed to verify removal of item: ${itemName} from cart: ${error}`);
      await captureScreenshot(this.page, `Verify Remove Item Failure ${itemName}`); // Capture screenshot for Allure
      throw error; // Re-throw the error to be handled by the test
    }
  }
}