
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Clase 10 - Regression Tests - SauceDemo', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'standard_user');
    await expect(page).toHaveURL(/inventory/);
  });

  test('Ordenamiento A-Z funciona',
    { tag: '@regression' },
    async ({ page }) => {
      await page.locator(
        '[data-test="product-sort-container"]'
      ).selectOption('az');

      const textos = await page.locator(
        '.inventory_item_name'
      ).allTextContents();

      const esperado = [...textos].sort(
        (a, b) => a.localeCompare(b)
      );

      expect(textos).toEqual(esperado);
    }
  );

  test('Ordenamiento Z-A funciona',
    { tag: '@regression' },
    async ({ page }) => {
      await page.locator(
        '[data-test="product-sort-container"]'
      ).selectOption('za');

      const textos = await page.locator(
        '.inventory_item_name'
      ).allTextContents();

      const esperado = [...textos]
        .sort((a, b) => a.localeCompare(b))
        .reverse();

      expect(textos).toEqual(esperado);
    }
  );

  test('Precio de menor a mayor funciona',
    { tag: '@regression' },
    async ({ page }) => {
      await page.locator(
        '[data-test="product-sort-container"]'
      ).selectOption('lohi');

      const precios = await page.locator(
        '.inventory_item_price'
      ).allTextContents();

      const numericos = precios.map(
        p => parseFloat(p.replace('$', ''))
      );

      for (let i = 0; i < numericos.length - 1; i++) {
        expect(numericos[i]).toBeLessThanOrEqual(
          numericos[i + 1]
        );
      }
    }
  );

  test('El boton Remove aparece despues de agregar al carrito',
    { tag: '@regression' },
    async ({ page }) => {
      const primerBoton = page.locator('.btn_inventory').first();

      await expect(primerBoton).toHaveText('Add to cart');

      await primerBoton.click();
      await expect(primerBoton).toHaveText('Remove');

      await primerBoton.click();
      await expect(primerBoton).toHaveText('Add to cart');
    }
  );

  test('Navegar al detalle del producto y regresar',
    { tag: '@regression' },
    async ({ page }) => {
      const primerNombre = await page.locator(
        '.inventory_item_name'
      ).first().textContent();

      await page.locator(
        '.inventory_item_name'
      ).first().click();

      await expect(page).toHaveURL(/inventory-item/);

      await expect(
        page.locator('.inventory_details_name')
      ).toContainText(primerNombre!);

      await page.locator(
        '[data-test="back-to-products"]'
      ).click();

      await expect(page).toHaveURL(/inventory/);
    }
  );

});
