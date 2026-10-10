
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Tarea 10 - Retos Playwright', () => {

  // RETO 1: Tags multiples
  test(
    'Reto 1 - Validar interfaz del inventario',
    { tag: ['@regression', '@ui'] },
    async ({ page }) => {
      await loginAs(page, 'standard_user');

      await expect(page).toHaveURL(/inventory/);

      await expect(
        page.locator('.inventory_item')
      ).toHaveCount(6);

      await expect(
        page.locator('.shopping_cart_link')
      ).toBeVisible();
    }
  );

  // RETO 2: Soft assertions
  test(
    'Reto 2 - Verificar atributos de un producto',
    { tag: '@regression' },
    async ({ page }, testInfo) => {
      await loginAs(page, 'standard_user');

      const producto = page.locator(
        '.inventory_item'
      ).first();

      await expect.soft(
        producto.locator('.inventory_item_name')
      ).toBeVisible();

      await expect.soft(
        producto.locator('.inventory_item_desc')
      ).not.toBeEmpty();

      await expect.soft(
        producto.locator('.inventory_item_price')
      ).toContainText('$');

      await expect.soft(
        producto.locator('.inventory_item_img img')
      ).toBeVisible();

      await expect.soft(
        producto.locator('button')
      ).toBeEnabled();

      console.log(
        `Errores soft encontrados: ${testInfo.errors.length}`
      );

      // Playwright tambien reporta los errores soft
      // al finalizar el test.
      expect(testInfo.errors).toHaveLength(0);
    }
  );

  // RETO 3: Fixture browserName
  test(
    'Reto 3 - Validar comportamiento cross-browser',
    { tag: '@crossbrowser' },
    async ({ page, browserName }) => {
      await loginAs(page, 'standard_user');

      const inventario = page.locator('.inventory_item');

      await expect(inventario).toHaveCount(6);

      if (browserName === 'chromium') {
        await expect(
          page.locator('.inventory_container')
        ).toBeVisible();

      } else if (browserName === 'firefox') {
        await expect(
          page.locator('.inventory_list')
        ).toBeVisible();

      } else if (browserName === 'webkit') {
        await expect(
          page.locator('.shopping_cart_link')
        ).toBeVisible();
      }

      console.log(
        `Prueba ejecutada en motor: ${browserName}`
      );
    }
  );

});
