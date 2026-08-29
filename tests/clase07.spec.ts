// tests/clase07.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Clase 07 - Evidencias de pruebas', () => {
    test('Login exitoso - evidencia completa', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        await loginPage.navigate();
        // Screenshot antes del login
        await page.screenshot({
            path: './evidencias/clase07/t01-antes-login.png', fullPage: true
        });
// tests/clase07.spec.ts

        await loginPage.login('standard_user', 'secret_sauce');
        await inventoryPage.expectToBeOnInventoryPage();
        // Screenshot después del login
        await page.screenshot({
            path: './evidencias/clase07/t01-despues-login.png', fullPage: true
        });
        console.log('Login documentado con screenshots');
    });

    // tests/clase07.spec.ts

    test('Documentar el flujo de compra completo', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/inventory/);
        // Screenshot del inventario
        await page.screenshot({ path: './evidencias/clase07/t02-inventario.png' });
        // Agregar producto
        await page.locator('.btn_inventory').first().click();
        const nombreProducto = await page.locator('.inventory_item_name')
            .first().textContent();
            // tests/clase07.spec.ts

        // Screenshot con producto agregado
        await page.screenshot({ path: './evidencias/clase07/t02-producto-agregado.png' });
        // Ir al carrito
        await page.locator('.shopping_cart_link').click();
        await expect(page).toHaveURL(/cart/);
        // Screenshot del carrito
        await page.screenshot({ path: './evidencias/clase07/t02-carrito.png', fullPage: true });
        // Verificar
        await expect(page.locator('.cart_item')).toHaveCount(1);
        await expect(page.locator('.inventory_item_name')).toContainText(nombreProducto!);
        console.log(`Flujo documentado. Producto: ${nombreProducto}`);
    });

    // tests/clase07.spec.ts

    test('Capturar el momento exacto de un defecto esperado', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        // Intentar login con usuario bloqueado
        await loginPage.login('locked_out_user', 'secret_sauce');
        // Capturar el error tal como aparece
        const errorElement = page.locator('[data-test="error"]');
        await expect(errorElement).toBeVisible();
        // Screenshot específico del elemento de error (no de toda la página)
        await errorElement.screenshot({
            path: './evidencias/clase07/t03-error-usuario-bloqueado.png' });
        const textoError = await errorElement.textContent();
        console.log(`Error capturado: ${textoError}`);
    });

    // tests/clase07.spec.ts

    test('Comparar estados antes y después de una acción', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('standard_user', 'secret_sauce');
        // Estado ANTES: sin items en el carrito
        const estadoAntes = await page.locator('.shopping_cart_badge').isVisible();
        await page.screenshot({ path: './evidencias/clase07/t04-estado-antes.png' });
        // Acción
        await page.locator('.btn_inventory').first().click();
        // Estado DESPUÉS: badge con número
        const badgeDespues = page.locator('.shopping_cart_badge');
        await expect(badgeDespues).toBeVisible();
        await expect(badgeDespues).toHaveText('1');
        await page.screenshot({ path: './evidencias/clase07/t04-estado-despues.png' });
        console.log('Estado antes y después documentados correctamente');
    });
});