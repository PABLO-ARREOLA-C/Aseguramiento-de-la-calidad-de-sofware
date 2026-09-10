// tests/tarea07.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Tarea 07 - Tests reto: evidencias avanzadas', () => {

    // ==========================================================
    // RETO 1 - test.step()
    // ==========================================================

    test('Reto 1 - Organizar prueba utilizando test.step()', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        // PASO 1: NAVEGAR
        await test.step('Navegar a SauceDemo', async () => {

            await loginPage.navigate();

            await expect(page).toHaveURL(/saucedemo/);

            console.log('Paso 1 completado: navegación correcta');
        });


        // PASO 2: LOGIN
        await test.step('Realizar login', async () => {

            await loginPage.login(
                'standard_user',
                'secret_sauce'
            );

            console.log('Paso 2 completado: login realizado');
        });


        // PASO 3: VERIFICAR
        await test.step('Verificar inventario', async () => {

            await inventoryPage.expectToBeOnInventoryPage();

            const productos = page.locator('.inventory_item');

            await expect(productos).toHaveCount(6);

            // Evidencia adicional
            await page.screenshot({
                path: './evidencias/tarea07-reto1-inventario.png',
                fullPage: true
            });

            console.log('Paso 3 completado: inventario verificado');
        });

    });


    // ==========================================================
    // RETO 2 - testInfo.attach()
    // ==========================================================

    test(
        'Reto 2 - Adjuntar datos capturados al reporte HTML',
        async ({ page }, testInfo) => {

            const loginPage = new LoginPage(page);

            // Navegar
            await loginPage.navigate();

            // Login
            await loginPage.login(
                'standard_user',
                'secret_sauce'
            );

            // Verificar que estamos en inventario
            await expect(page).toHaveURL(/inventory/);


            // --------------------------------------------------
            // CAPTURAR DATOS
            // --------------------------------------------------

            const productos = page.locator('.inventory_item');

            const cantidadProductos = await productos.count();

            const urlActual = page.url();

            const fechaActual = new Date().toLocaleString();


            // --------------------------------------------------
            // CREAR CONTENIDO DEL ARCHIVO DE TEXTO
            // --------------------------------------------------

            const datosCapturados = `
DATOS CAPTURADOS - RETO 2
=========================

Cantidad de productos: ${cantidadProductos}
URL actual: ${urlActual}
Fecha de ejecución: ${fechaActual}

Prueba realizada con Playwright.
            `.trim();


            // --------------------------------------------------
            // ADJUNTAR AL REPORTE HTML
            // --------------------------------------------------

            await testInfo.attach(
                'datos-capturados.txt',
                {
                    body: datosCapturados as any,
                    contentType: 'text/plain'
                }
            );


            // --------------------------------------------------
            // VERIFICACIÓN
            // --------------------------------------------------

            expect(cantidadProductos).toBe(6);


            // Screenshot como evidencia adicional
            await page.screenshot({
                path: './evidencias/tarea07-reto2-datos.png',
                fullPage: true
            });


            console.log(
                'Reto 2 completado: datos adjuntados al reporte HTML'
            );

            console.log(datosCapturados);
        }
    );


    // ==========================================================
    // RETO 3 - toHaveScreenshot()
    // ==========================================================

    test(
        'Reto 3 - Comparación visual con toHaveScreenshot()',
        async ({ page }) => {

            const loginPage = new LoginPage(page);

            // Navegar
            await loginPage.navigate();

            // Login
            await loginPage.login(
                'standard_user',
                'secret_sauce'
            );


            // Verificar página de inventario
            await expect(page).toHaveURL(/inventory/);


            // Esperar que aparezca el inventario
            const inventario = page.locator('.inventory_list');

            await expect(inventario).toBeVisible();


            // --------------------------------------------------
            // COMPARACIÓN VISUAL
            // --------------------------------------------------

            await expect(page).toHaveScreenshot(
                'tarea07-inventario-baseline.png',
                {
                    fullPage: true
                }
            );


            console.log(
                'Reto 3 completado: comparación visual realizada'
            );
        }
    );

});