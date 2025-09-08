import { expect, Page } from '@playwright/test';
import log from '../utils/logger';
import { captureScreenshot } from '../utils/helper';


export class InventoryPage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async addToCart(product: string, productDetails: string) {
    try {
        if (productDetails === 'Yes') {
            await this.page.locator(`text=${product}`).click();
            log.info(`Clicked on product ${product} to view details`);
            log.info(`Redirecting to product details page for ${product}`);
            await expect(this.page).toHaveURL(/inventory-item.html/);
            await this.page.screenshot({ path: `screenshots/${product}_details.png`, fullPage: true });
            log.info(`Screenshot taken for product details page of ${product}`);
            await this.page.click('button:text("Add to cart")');
            log.info(`Clicked 'Add to Cart' for ${product} from product details page`);
            // await this.page.screenshot({ path: `screenshots/${product}_added_to_cart_from_details.png`, fullPage: true });
            await captureScreenshot(this.page, `Added to Cart ${product}`); // Capture screenshot for Allure
            log.info(`Screenshot taken after adding ${product} to cart from product details page`);
        } else {
            const addToCartButton = this.page.locator(`//div[.='${product}']/ancestor::div[@class='inventory_item']//button[text()='Add to cart']`);
            await addToCartButton.waitFor({ state: 'visible' });
            await addToCartButton.click();
            log.info(`Clicked 'Add to Cart' for ${product}`);
            // await this.page.screenshot({ path: `screenshots/${product}_added_to_cart.png`, fullPage: true });
            await captureScreenshot(this.page, `Added to Cart ${product}`); // Capture screenshot for Allure
            log.info(`Screenshot taken after adding ${product} to cart`);    
        }
        
        const cartBadge = this.page.locator('.shopping_cart_badge');
        await expect(cartBadge).toBeVisible();
        log.info(`Verified that ${product} is added to cart`);

        // Navigate to cart page
        await expect(this.page.locator('.shopping_cart_link')).toBeVisible();
        await this.page.click('.shopping_cart_link');
        log.info(`Navigated to cart page`);
        await expect(this.page).toHaveURL(/cart.html/);
        await expect(this.page.locator('.title')).toHaveText('Your Cart');
        await expect(this.page.locator(`text=${product}`)).toBeVisible();
        log.info(`Verified that ${product} is present in the cart`);
        await expect(this.page.locator('.inventory_item_name')).toHaveText(`${product}`);
        log.info(`Verified cart item label for ${product}`);

        // await this.page.screenshot({ path: `screenshots/cart_page_after_adding_${product}.png`, fullPage: true });
        await captureScreenshot(this.page, `Cart Page with ${product}`); // Capture screenshot for Allure
        log.info(`Screenshot taken of cart page after adding ${product}`);
    } catch (error) {
      log.error(`Failed to add ${product} to cart: ${error}`);
      await captureScreenshot(this.page, `Add to Cart Failure ${product}`); // Capture screenshot for Allure
      throw error; // Re-throw the error to be handled by the test
    }
  }
}