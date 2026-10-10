
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Clase 10 - Smoke Tests - SauceDemo', () => {

  test('La pagina de login carga',
    { tag: '@smoke' },
    async ({ page }) => {
      await page.goto('https://www.saucedemo.com');

      await expect(page).toHaveTitle(/Swag Labs/);
      await expect(page.locator('#login-button')).toBeVisible();
    }
  );

  test('Login con usuario estandar funciona',
    { tag: '@smoke' },
    async ({ page }) => {
      await loginAs(page, 'standard_user');

      await expect(page).toHaveURL(/inventory/);
    }
  );

  test('El inventario muestra productos',
    { tag: '@smoke' },
    async ({ page }) => {
      await loginAs(page, 'standard_user');

      const items = page.locator('.inventory_item');

      await expect(items).toHaveCount(6);
    }
  );

  test('El carrito es accesible',
    { tag: '@smoke' },
    async ({ page }) => {
      await loginAs(page, 'standard_user');

      await page.locator('.shopping_cart_link').click();

      await expect(page).toHaveURL(/cart/);
    }
  );

  test('El checkout inicia correctamente',
    { tag: '@smoke' },
    async ({ page }) => {
      await loginAs(page, 'standard_user');

      await page.locator('.btn_inventory').first().click();
      await page.locator('.shopping_cart_link').click();
      await page.locator('[data-test="checkout"]').click();

      await expect(page).toHaveURL(/checkout-step-one/);
    }
  );

});
