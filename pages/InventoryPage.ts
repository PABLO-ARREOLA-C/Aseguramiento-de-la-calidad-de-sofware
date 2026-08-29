import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inventoryContainer = page.locator('.inventory_container');
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator(
      '[data-test="product-sort-container"]'
    );
  }

  async expectToBeOnInventoryPage() {
    await expect(this.page).toHaveURL(/inventory/);
    await expect(this.inventoryContainer).toBeVisible();
  }

  async getProductCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  async addFirstProductToCart() {
    const addButton = this.inventoryItems
      .first()
      .locator('.btn_inventory');

    await addButton.click();
  }

  async addProductByName(productName: string) {
    const product = this.page.locator('.inventory_item', {
      hasText: productName,
    });

    await product.locator('.btn_inventory').click();
  }

  // RETO 3
  async removeProductByName(productName: string) {
    const product = this.page.locator('.inventory_item', {
      hasText: productName,
    });

    await product.locator('.btn_inventory').click();
  }

  async goToCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart/);
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }
}