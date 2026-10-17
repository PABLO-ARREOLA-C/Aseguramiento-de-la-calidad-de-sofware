
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://the-internet.herokuapp.com';

const TEXTO_CORRECTO =
  "Sometimes you'll see a typo, other times you won't.";

// Activar solamente para comprobar el afterEach.
// La ejecución final debe realizarse con false.
const PROBAR_REPORTE_DE_ERROR = false;

test.describe('Tarea 11: Documentar defectos', () => {
  test.setTimeout(180_000);

  // ============================================================
  // HOOK: GENERAR BORRADOR DE REPORTE CUANDO EXISTAN ERRORES
  // ============================================================

  test.afterEach(
    async ({ page, browserName, browser }, testInfo) => {
      if (testInfo.errors.length === 0) {
        return;
      }

      const errores = testInfo.errors
        .map((error) => error.message ?? String(error))
        .join('\n\n');

      const borrador = [
        '# Borrador de reporte de defecto',
        '',
        `## Título`,
        testInfo.title,
        '',
        '## Ambiente',
        `- Fecha: ${new Date().toISOString()}`,
        `- Navegador: ${browserName}`,
        `- Versión: ${browser.version()}`,
        `- Sistema operativo: ${process.platform}`,
        `- Proyecto: ${testInfo.project.name}`,
        `- URL: ${page.url()}`,
        '',
        '## Resultado de la ejecución',
        `- Estado obtenido: ${testInfo.status}`,
        `- Estado esperado: ${testInfo.expectedStatus}`,
        '',
        '## Resultado esperado',
        'La aplicación debe cumplir los criterios de aceptación.',
        '',
        '## Resultado obtenido',
        '```text',
        errores || 'La prueba presentó un error.',
        '```',
        '',
        '## Seguimiento',
        '1. Revisar las evidencias adjuntas.',
        '2. Confirmar los pasos para reproducir el defecto.',
        '3. Clasificar la severidad y prioridad.',
        '4. Registrar el defecto en GitHub Issues.',
        '',
        '## Estado del defecto',
        'Pendiente de revisión.',
      ].join('\n');

      await testInfo.attach('borrador-reporte-defecto.md', {
        body: Buffer.from(borrador, 'utf-8'),
        contentType: 'text/markdown',
      });
    },
  );

  // ============================================================
  // RETO 1: MEDIR UN DEFECTO INTERMITENTE
  // ============================================================

  test(
    'Reto 1: Medir el defecto intermitente en 12 recargas',
    async ({ page }, testInfo) => {
      await page.goto(`${BASE_URL}/typos`);

      const TOTAL_RECARGAS = 12;

      const mediciones: {
        recarga: number;
        texto: string;
        presentaError: boolean;
      }[] = [];

      for (
        let recarga = 1;
        recarga <= TOTAL_RECARGAS;
        recarga++
      ) {
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

      const porcentaje = (
        (conError / TOTAL_RECARGAS) *
        100
      ).toFixed(2);

      const resumen =
        `Defecto observado en ${conError} de ` +
        `${TOTAL_RECARGAS} recargas (${porcentaje}%).`;

      // Registrar frecuencia en el reporte HTML.
      testInfo.annotations.push({
        type: 'frecuencia',
        description: resumen,
      });

      // Adjuntar evidencia detallada.
      await testInfo.attach('frecuencia-defecto.json', {
        body: Buffer.from(
          JSON.stringify(
            {
              titulo: testInfo.title,
              url: page.url(),
              navegador: testInfo.project.name,
              totalRecargas: TOTAL_RECARGAS,
              recargasConError: conError,
              porcentaje: Number(porcentaje),
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

  // ============================================================
  // RETO 2: TEST.FIXME CON ANOTACIÓN DE ISSUE
  // ============================================================

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

      // El texto debe aparecer correctamente.
      // La prueba queda pendiente mientras exista el defecto.
      await expect(parrafo).toHaveText(TEXTO_CORRECTO);
    },
  );

  // ============================================================
  // RETO 3: DOCUMENTAR IMÁGENES ROTAS
  // ============================================================

  test(
    'Reto 3: Documentar imágenes rotas',
    async ({ page }, testInfo) => {
      await page.goto(`${BASE_URL}/broken_images`);

      const imagenes = page.locator('.example img');

      await expect(imagenes.first()).toBeVisible();

      // Esperar a que todas las imágenes terminen de cargar,
      // incluso aquellas que presentan errores.
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

      // Obtener información de cada imagen.
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

      // Anotación visible en el reporte HTML.
      testInfo.annotations.push({
        type: 'defecto',
        description: resumen,
      });

      // Adjuntar diagnóstico de las imágenes.
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

      // Adjuntar captura de pantalla.
      await testInfo.attach('evidencia-imagenes-rotas.png', {
        body: await page.screenshot({
          fullPage: true,
        }),
        contentType: 'image/png',
      });

      console.log(resumen);

      expect(resultados.length).toBeGreaterThan(0);
      expect(rotas.length).toBeGreaterThan(0);

      // Validación temporal del afterEach.
      // Cuando se activa, provoca un fallo intencional.
      if (PROBAR_REPORTE_DE_ERROR) {
        expect.soft(
          rotas.length,
          'Validación controlada del reporte Markdown',
        ).toBe(0);
      }
    },
  );
});
