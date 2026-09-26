import { test as base, expect } from '@playwright/test';

// ============================================================
// TAREA 09 - FIXTURES AVANZADOS
// ============================================================


// ============================================================
// RETO 1 - FIXTURE CON TEARDOWN REAL
// ============================================================

type TimerFixtures = {
  timer: void;
};

const timerTest = base.extend<TimerFixtures>({
  timer: async ({}, use) => {

    // SETUP
    const inicio = Date.now();

    console.log('\n⏱️ Fixture timer iniciado');

    // Entrega el control al test
    await use();

    // TEARDOWN
    // Este código se ejecuta cuando termina el test
    const fin = Date.now();
    const duracion = fin - inicio;

    console.log(`⏱️ Test finalizado en ${duracion} ms`);
  },
});

timerTest(
  'Reto 1 - Fixture con teardown real',
  async ({ page, timer }) => {

    await page.goto('https://www.saucedemo.com');

    await expect(page).toHaveTitle(/Swag Labs/);

    console.log('✓ Página cargada correctamente');
  }
);


// ============================================================
// RETO 2 - FIXTURE DE ALCANCE WORKER
// ============================================================

type WorkerFixtures = {
  contadorWorker: {
    valor: number;
  };
};

const workerTest = base.extend<{}, WorkerFixtures>({

  contadorWorker: [
    async ({}, use) => {

      // Este objeto se crea una vez por worker
      const contador = {
        valor: 0,
      };

      console.log('\n🔧 Fixture worker creado');

      await use(contador);

      console.log(
        `🔧 Fixture worker finalizado con contador = ${contador.valor}`
      );
    },

    {
      scope: 'worker',
    },
  ],
});


workerTest.describe.configure({
  mode: 'serial',
});


workerTest.describe(
  'Reto 2 - Fixture de alcance worker',
  () => {

    workerTest(
      'Contador worker sube a 1',
      async ({ contadorWorker }) => {

        contadorWorker.valor++;

        console.log(
          `Contador del worker: ${contadorWorker.valor}`
        );

        expect(contadorWorker.valor).toBe(1);
      }
    );


    workerTest(
      'Contador worker sube a 2',
      async ({ contadorWorker }) => {

        contadorWorker.valor++;

        console.log(
          `Contador del worker: ${contadorWorker.valor}`
        );

        expect(contadorWorker.valor).toBe(2);
      }
    );

  }
);


// ============================================================
// RETO 3 - test.use() + PARAMETRIZACIÓN
// ============================================================

const viewports = [

  {
    nombre: 'Móvil',
    viewport: {
      width: 375,
      height: 667,
    },
  },

  {
    nombre: 'Escritorio',
    viewport: {
      width: 1366,
      height: 768,
    },
  },

];


for (const configuracion of viewports) {

  base.describe(
    `Reto 3 - Viewport ${configuracion.nombre}`,
    () => {

      // Configuración específica para este grupo de tests
      base.use({
        viewport: configuracion.viewport,
      });


      base(
        `SauceDemo funciona en ${configuracion.nombre}`,
        async ({ page }) => {

          await page.goto('https://www.saucedemo.com');

          // Verificar que el formulario de login sea visible
          await expect(
            page.locator('#user-name')
          ).toBeVisible();

          await expect(
            page.locator('#password')
          ).toBeVisible();

          await expect(
            page.locator('#login-button')
          ).toBeVisible();


          // Comprobar el tamaño aplicado
          const size = page.viewportSize();

          expect(size).toEqual(
            configuracion.viewport
          );


          console.log(
            `✓ ${configuracion.nombre}: ` +
            `${size?.width}x${size?.height}`
          );
        }
      );

    }
  );

}