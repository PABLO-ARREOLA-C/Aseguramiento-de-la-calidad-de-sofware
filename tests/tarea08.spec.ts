// tests/tarea08.spec.ts

import {
  test,
  expect,
  Page,
  BrowserContext,
} from '@playwright/test';

import { loginAs } from '../helpers/auth';

// ============================================================================
// RETO 1 - SUITE SERIAL CON PÁGINA COMPARTIDA
// ============================================================================

test.describe('Reto 1 - Suite serial con página compartida', () => {
  test.describe.configure({ mode: 'serial' });

  let context: BrowserContext;
  let sharedPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Creamos manualmente un contexto y una página.
    // Esta misma página será reutilizada por todos los tests de la suite.
    context = await browser.newContext();
    sharedPage = await context.newPage();

    await loginAs(sharedPage, 'standard_user');

    await expect(sharedPage).toHaveURL(/inventory/);

    console.log('Página compartida creada correctamente');
  });

  test.afterAll(async () => {
    await context.close();

    console.log('Contexto compartido cerrado');
  });

  test('La página compartida muestra los 6 productos', async () => {
    const productos = sharedPage.locator('.inventory_item');

    await expect(productos).toHaveCount(6);

    console.log('Test serial 1 completado');
  });

  test('Agregar un producto al carrito usando la misma página', async () => {
    await sharedPage.locator('.btn_inventory').first().click();

    await expect(
      sharedPage.locator('.shopping_cart_badge')
    ).toHaveText('1');

    console.log('Producto agregado al carrito');
  });

  test('El estado del carrito se conserva entre tests', async () => {
    // Como reutilizamos sharedPage, el producto agregado
    // en el test anterior continúa en el carrito.

    await expect(
      sharedPage.locator('.shopping_cart_badge')
    ).toHaveText('1');

    console.log('Estado compartido confirmado');
  });
});

// ============================================================================
// RETO 2 - test.slow()
// ============================================================================

test.describe('Reto 2 - test.slow()', () => {
  test(
    'Usuario de rendimiento degradado usa test.slow()',
    async ({ page }) => {
      // Triplica el timeout disponible para este test.
      test.slow();

      const inicio = Date.now();

      await loginAs(page, 'performance_glitch_user');

      const tiempoLogin = Date.now() - inicio;

      console.log(
        `Tiempo de login del performance_glitch_user: ${tiempoLogin}ms`
      );

      await expect(page).toHaveURL(/inventory/);

      expect(tiempoLogin).toBeGreaterThan(0);
    }
  );
});

// ============================================================================
// RETO 3 - test.skip() DINÁMICO
// ============================================================================

test.describe('Reto 3 - test.skip() dinámico', () => {
  test(
    'Omitir dinámicamente el test según el navegador',
    async ({ page, browserName }) => {
      // La condición se evalúa durante la ejecución del test.
      const omitirPrueba = browserName === 'webkit';

      test.skip(
        omitirPrueba,
        'Prueba omitida dinámicamente en WebKit para demostrar test.skip()'
      );

      await loginAs(page, 'standard_user');

      await expect(page).toHaveURL(/inventory/);

      const productos = page.locator('.inventory_item');

      await expect(productos).toHaveCount(6);

      console.log(
        `Reto 3 ejecutado correctamente en ${browserName}`
      );
    }
  );
});
