
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://the-internet.herokuapp.com';

const TEXTO_CORRECTO =
  "Sometimes you'll see a typo, other times you won't.";

test.describe('Tarea 11: Documentar defectos', () => {
  test.setTimeout(180_000);

  // ==========================================================
  // AFTER EACH: BORRADOR AUTOMÁTICO DE REPORTE DE DEFECTOS
  // ==========================================================

  test.afterEach(
    async ({ page, browserName, browser }, testInfo) => {
      if (testInfo.errors.length === 0) return;

      const errores = testInfo.errors
        .map((error) => error.message ?? String(error))
        .join('\n\n');

      const reporte = [
        '# Borrador de reporte de defecto',
        '',
        `## ${testInfo.title}`,
        '',
        '### Ambiente',
        `- Fecha: ${new Date().toISOString()}`,
        `- Navegador: ${browserName}`,
        `- Versión: ${browser.version()}`,
        `- Sistema operativo: ${process.platform}`,
        `- Proyecto: ${testInfo.project.name}`,
        `- URL: ${page.url()}`,
        '',
        '### Resultado de la ejecución',
        `- Estado obtenido: ${testInfo.status}`,
        `- Estado esperado: ${testInfo.expectedStatus}`,
        '',
        '### Resultado esperado',
        'El sistema debe cumplir los criterios de aceptación.',
        '',
        '### Resultado obtenido',
        '```text',
        errores,
        '```',
        '',
        '### Seguimiento',
        '1. Revisar la evidencia adjunta.',
        '2. Confirmar los pasos para reproducir el defecto.',
        '3. Clasificar severidad y prioridad.',
        '4. Registrar el defecto en GitHub Issues.',
        '',
        '**Estado:** Pendiente de revisión.',
      ].join('\n');

      await testInfo.attach('borrador-reporte-defecto.md', {
        body: Buffer.from(reporte, 'utf-8'),
        contentType: 'text/markdown',
      });
    },
  );

  // ==========================================================
  // RETO 1: MEDIR DEFECTO INTERMITENTE EN 12 RECARGAS
  // ==========================================================

  test(
    'Reto 1: Medir el defecto intermitente en 12 recargas',
    async ({ page }, testInfo) => {
      const TOTAL_RECARGAS = 12;

      await page.goto(`${BASE_URL}/typos`);

      const mediciones: {
        recarga: number;
        texto: string;
        presentaError: boolean;
      }[] = [];

      for (let recarga = 1; recarga <= TOTAL_RECARGAS; recarga++) {
        await page.reload();

        const parrafo = page.locator('.example p').nth(1);
        await expect(parrafo).toBeVisible();

        const texto = (await parrafo.innerText())
          .replace(/\s+/g, ' ')
          .trim();

        const presentaError = texto !== TEXTO_CORRECTO;

        mediciones.push({
          recarga,
          texto,
          presentaError,
        });

        console.log(
          `Recarga ${recarga}: ${
            presentaError ? 'ERROR' : 'CORRECTO'
          }`,
        );
      }

      const conError = mediciones.filter(
        (medicion) => medicion.presentaError,
      ).length;

      const porcentaje = Number(
        ((conError / TOTAL_RECARGAS) * 100).toFixed(2),
      );

      const resumen =
        `Defecto observado en ${conError} de ` +
        `${TOTAL_RECARGAS} recargas (${porcentaje.toFixed(2)}%).`;

      testInfo.annotations.push({
        type: 'frecuencia',
        description: resumen,
      });

      await testInfo.attach('frecuencia-defecto.json', {
        body: Buffer.from(
          JSON.stringify(
            {
              titulo: testInfo.title,
              url: page.url(),
              navegador: testInfo.project.name,
              totalRecargas: TOTAL_RECARGAS,
              recargasConError: conError,
              porcentaje,
              mediciones,
            },
            null,
            2,
          ),
          'utf-8',
        ),
        contentType: 'application/json',
      });

      console.log(resumen);

      expect(mediciones).toHaveLength(TOTAL_RECARGAS);
    },
  );

  // ==========================================================
  // RETO 2: TEST.FIXME CON ANOTACIÓN ISSUE
  // ==========================================================

  test.fixme(
    'Reto 2: El texto debe aparecer sin errores',
    {
      annotation: {
        type: 'issue',
        description:
          'DEF-01: Error intermitente en /typos. ' +
          'Pendiente de corrección.',
      },
    },
    async ({ page }) => {
      await page.goto(`${BASE_URL}/typos`);

      const parrafo = page.locator('.example p').nth(1);

      await expect(parrafo).toBeVisible();
      await expect(parrafo).toHaveText(TEXTO_CORRECTO);
    },
  );

  // ==========================================================
  // RETO 3: DOCUMENTAR IMÁGENES ROTAS
  // ==========================================================

  test(
    'Reto 3: Documentar imágenes rotas',
    async ({ page }, testInfo) => {
      await page.goto(`${BASE_URL}/broken_images`);

      const imagenes = page.locator('.example img');

      await expect(imagenes.first()).toBeVisible();

      await expect
        .poll(async () =>
          imagenes.evaluateAll((elementos) =>
            elementos.every(
              (elemento) =>
                (elemento as HTMLImageElement).complete,
            ),
          ),
        )
        .toBe(true);

      const resultados = await imagenes.evaluateAll(
        (elementos) =>
          elementos.map((elemento, indice) => {
            const imagen = elemento as HTMLImageElement;

            return {
              numero: indice + 1,
              url: imagen.src,
              cargada: imagen.complete,
              anchoNatural: imagen.naturalWidth,
              rota:
                imagen.complete &&
                imagen.naturalWidth === 0,
            };
          }),
      );

      const rotas = resultados.filter(
        (imagen) => imagen.rota,
      );

      const resumen =
        `Se detectaron ${rotas.length} imágenes rotas ` +
        `de ${resultados.length}.`;

      testInfo.annotations.push({
        type: 'defecto',
        description: resumen,
      });

      await testInfo.attach('diagnostico-imagenes.json', {
        body: Buffer.from(
          JSON.stringify(
            {
              titulo: testInfo.title,
              url: page.url(),
              totalImagenes: resultados.length,
              imagenesRotas: rotas.length,
              resultados,
            },
            null,
            2,
          ),
          'utf-8',
        ),
        contentType: 'application/json',
      });

      await testInfo.attach('evidencia-imagenes-rotas.png', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      console.log(resumen);

      expect(resultados.length).toBeGreaterThan(0);
      expect(rotas.length).toBeGreaterThan(0);
      expect.soft(
  rotas.length,
  'Prueba controlada del reporte automático de defectos',
).toBe(0);
    },
  );
});
