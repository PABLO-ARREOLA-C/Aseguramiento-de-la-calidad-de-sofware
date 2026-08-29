import { test, expect } from '@playwright/test';

test.describe('Clase 05 - Assertions y técnicas de diseño de pruebas en Sauce Demo', () => {

  // ============================================================
  // SECCIÓN A - CLASES DE EQUIVALENCIA Y VALORES DE FRONTERA
  // ============================================================

  // TEST 1
  test('CE válida: login con credenciales correctas', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Debemos llegar al inventario
    await expect(page).toHaveURL(/inventory/);

    // El contenedor del inventario debe estar visible
    await expect(page.locator('.inventory_container')).toBeVisible();

    console.log('CE válida: login exitoso');
  });


  // TEST 2
  test('CE inválida: usuario no existe', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('usuario_inexistente');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');

    // Debe aparecer el mensaje de error
    await expect(errorMsg).toBeVisible();

    await expect(errorMsg)
      .toContainText('Username and password do not match');

    // No debemos entrar al inventario
    await expect(page).not.toHaveURL(/inventory/);
  });


  // TEST 3
  test('CE inválida: usuario bloqueado', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('locked_out_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');

    await expect(errorMsg).toBeVisible();

    await expect(errorMsg).toContainText('locked out');

    console.log('CE usuario bloqueado: mensaje correcto mostrado');
  });


  // TEST 4
  test('Valor en frontera: campos vacíos (frontera de longitud mínima)', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    // No llenar ningún campo
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');

    await expect(errorMsg).toBeVisible();

    await expect(errorMsg).toContainText('Username is required');

    console.log('Valor frontera: campo vacío maneja error correctamente');
  });


  // ============================================================
  // SECCIÓN B - INVENTARIO
  // ============================================================

  // TEST 5
  test('Verificar que el inventario tiene exactamente 6 productos', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    const productos = page.locator('.inventory_item');

    // Assertion exacta del número de productos
    await expect(productos).toHaveCount(6);

    console.log('El inventario tiene exactamente 6 productos');
  });


  // TEST 6
  test('Verificar precio del primer producto con regex', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    const textoPrecio = await page
      .locator('.inventory_item_price')
      .first()
      .textContent();

    // El regex valida el formato $XX.XX
    expect(textoPrecio?.trim()).toMatch(/^\$\d+\.\d{2}$/);
  });


  // TEST 7
  test('Verificar atributos y estados de los elementos del inventario', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    const primerBoton = page.locator('.btn_inventory').first();

    // El botón debe estar habilitado
    await expect(primerBoton).toBeEnabled();

    // Inicialmente debe decir Add to cart
    await expect(primerBoton).toHaveText('Add to cart');

    // Agregar producto
    await primerBoton.click();

    // Ahora debe cambiar a Remove
    await expect(primerBoton).toHaveText('Remove');

    // El carrito debe mostrar 1 producto
    const badgeCarrito = page.locator('.shopping_cart_badge');

    await expect(badgeCarrito).toBeVisible();
    await expect(badgeCarrito).toHaveText('1');

    console.log('El botón cambia de estado y el carrito se actualiza');
  });


  // ============================================================
  // SECCIÓN C - SOFT ASSERTIONS
  // ============================================================

  // TEST 8
  test('Verificar múltiples propiedades del primer producto con soft assertions', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    const primerProducto = page.locator('.inventory_item').first();

    // Si una falla, las demás continúan ejecutándose
    await expect.soft(
      primerProducto.locator('.inventory_item_name')
    ).toBeVisible();

    await expect.soft(
      primerProducto.locator('.inventory_item_desc')
    ).toBeVisible();

    await expect.soft(
      primerProducto.locator('.inventory_item_price')
    ).toBeVisible();

    await expect.soft(
      primerProducto.locator('.btn_inventory')
    ).toBeEnabled();

    await expect.soft(
      primerProducto.locator('img')
    ).toBeVisible();

    console.log('Soft assertions del primer producto completadas');
  });


  // ============================================================
  // SECCIÓN D - TABLA DE DECISIÓN
  // ============================================================

  // TEST 9
  test('Tabla de decisión - Regla 1: logueado con items -> puede pagar', async ({ page }) => {
    // Login
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Agregar un producto
    await page.locator('.btn_inventory').first().click();

    // Ir al carrito
    await page.locator('.shopping_cart_link').click();

    await expect(page).toHaveURL(/cart/);

    // Debe existir el botón Checkout
    const btnCheckout = page.getByText('Checkout');

    await expect(btnCheckout).toBeVisible();
    await expect(btnCheckout).toBeEnabled();
  });


  // TEST 10
  test('Tabla de decisión - Regla 2: logueado sin items -> carrito vacío', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Ir al carrito sin agregar productos
    await page.locator('.shopping_cart_link').click();

    await expect(page).toHaveURL(/cart/);

    // El carrito debe estar vacío
    const itemsCarrito = page.locator('.cart_item');

    await expect(itemsCarrito).toHaveCount(0);
  });


  // ============================================================
  // TESTS RETO - TAREA 05
  // ============================================================

  // TEST 11 - toHaveValue()
  test('Reto 1: ordenar catálogo y verificar value y primer precio', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    // Select de ordenamiento
    const selectorOrden = page.locator('[data-test="product-sort-container"]');

    // Ordenar de menor a mayor precio
    await selectorOrden.selectOption('lohi');

    // Verificar el value seleccionado
    await expect(selectorOrden).toHaveValue('lohi');

    // El primer producto debe ser el de menor precio
    const primerPrecio = page.locator('.inventory_item_price').first();

    await expect(primerPrecio).toHaveText('$7.99');

    console.log('Reto 1 completado: ordenamiento por precio verificado');
  });


  // TEST 12 - toBeFocused()
  test('Reto 2: verificar que el campo de usuario recibe el foco', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    const campoUsuario = page.locator('#user-name');

    // Hacer clic en el campo
    await campoUsuario.click();

    // Verificar que tiene el foco
    await expect(campoUsuario).toBeFocused();

    console.log('Reto 2 completado: campo de usuario tiene el foco');
  });


  // TEST 13 - toHaveCSS()
  test('Reto 3: verificar CSS del botón Add to cart', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    const botonAgregar = page.locator('.btn_inventory').first();

    // Verificar que el cursor del botón es pointer
    await expect(botonAgregar).toHaveCSS('cursor', 'pointer');

    console.log('Reto 3 completado: propiedad CSS cursor verificada');
  });

});