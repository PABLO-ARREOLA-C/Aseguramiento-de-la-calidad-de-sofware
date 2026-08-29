import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuPage } from '../pages/MenuPage';

test.describe('Clase 06 - Page Object Model en Sauce Demo', () => {

  
  // TEST 1 
  

  test('Login exitoso con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();

    await loginPage.login(
      'standard_user',
      'secret_sauce'
    );

    const inventoryPage = new InventoryPage(page);

    await inventoryPage.expectToBeOnInventoryPage();

    console.log('Login con POM exitoso');
  });


  
  // TEST 2 
  

  test('Login fallido con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();

    await loginPage.login(
      'wrong_user',
      'wrong_pass'
    );

    await loginPage.expectLoginError(
      'Username and password do not match'
    );

    console.log('Error de login capturado con POM');
  });


  // TEST 3 BASE
  

  test(
    'Flujo completo: login → agregar 2 productos → verificar carrito',
    async ({ page }) => {

      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);

      await loginPage.navigate();

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      await inventoryPage.expectToBeOnInventoryPage();

      await inventoryPage.addProductByName(
        'Sauce Labs Backpack'
      );

      await inventoryPage.addProductByName(
        'Sauce Labs Bike Light'
      );

      await expect(
        inventoryPage.cartBadge
      ).toHaveText('2');

      await inventoryPage.goToCart();

      await cartPage.expectItemCount(2);

      console.log(
        'Flujo completo con POM: 2 productos en carrito'
      );
    }
  );



  // TEST 4 BASE
  

  test(
    'Verificar que el inventario tiene 6 productos',
    async ({ page }) => {

      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      await loginPage.navigate();

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      const count =
        await inventoryPage.getProductCount();

      expect(count).toBe(6);
    }
  );


  
  // TEST 5 BASE
  

  test(
    'Ordenar productos de mayor a menor precio',
    async ({ page }) => {

      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      await loginPage.navigate();

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      await inventoryPage.sortBy('hilo');

      const precios =
        page.locator('.inventory_item_price');

      const todosLosPrecios =
        await precios.allTextContents();

      const numericos = todosLosPrecios.map(
        precio => parseFloat(
          precio.replace('$', '')
        )
      );

      for (
        let i = 0;
        i < numericos.length - 1;
        i++
      ) {
        expect(
          numericos[i]
        ).toBeGreaterThanOrEqual(
          numericos[i + 1]
        );
      }
    }
  );


  
  // RETO 1  CHECKOUT PAGE
  

  test(
    'Reto 1 - Completar compra usando CheckoutPage',
    async ({ page }) => {

      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      // Login
      await loginPage.navigate();

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      // Agregar producto
      await inventoryPage.addProductByName(
        'Sauce Labs Backpack'
      );

      // Ir al carrito
      await inventoryPage.goToCart();

      await cartPage.expectItemCount(1);

      // Iniciar checkout
      await cartPage.proceedToCheckout();

      // Llenar formulario
      await checkoutPage.fillInformation(
        'Pablo',
        'Arreola',
        '01001'
      );

      // Continuar
      await checkoutPage.continueCheckout();

      // Finalizar compra
      await checkoutPage.finishCheckout();

      // Verificar compra exitosa
      await checkoutPage.expectOrderCompleted();

      console.log(
        'Reto 1: compra completada correctamente'
      );
    }
  );


  // RETO 2  MENU PAGE
  

  test(
    'Reto 2 - Logout usando MenuPage',
    async ({ page }) => {

      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      const menuPage = new MenuPage(page);

      // Login
      await loginPage.navigate();

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      await inventoryPage.expectToBeOnInventoryPage();

      // Abrir menú hamburguesa
      await menuPage.openMenu();

      // Logout
      await menuPage.logout();

      // Verificar que regresamos al login
      await expect(
        page.locator('#login-button')
      ).toBeVisible();

      console.log(
        'Reto 2: logout realizado correctamente'
      );
    }
  );


 
  // RETO 3  REMOVE PRODUCT
  

  test(
    'Reto 3 - Quitar producto y verificar que desaparece el badge',
    async ({ page }) => {

      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      // Login
      await loginPage.navigate();

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      // Agregar un producto
      await inventoryPage.addProductByName(
        'Sauce Labs Backpack'
      );

      // Badge debe mostrar 1
      await expect(
        inventoryPage.cartBadge
      ).toHaveText('1');

      // Quitar el mismo producto
      await inventoryPage.removeProductByName(
        'Sauce Labs Backpack'
      );

      // Cuando llega a 0 el badge desaparece
      await expect(
        inventoryPage.cartBadge
      ).toHaveCount(0);

      console.log(
        'Reto 3: producto eliminado y badge desapareció'
      );
    }
  );

});