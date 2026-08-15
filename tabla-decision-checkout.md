# Tabla de Decisión - Checkout de Sauce Demo

## Objetivo

Definir los casos de prueba del proceso de checkout de Sauce Demo utilizando una tabla de decisión.

La tabla considera diferentes combinaciones relacionadas con la autenticación del usuario, el contenido del carrito, la información del formulario de checkout y la finalización de la compra.

## Condiciones

| Condición | Descripción |
|---|---|
| C1 | Usuario autenticado |
| C2 | Carrito contiene productos |
| C3 | Formulario de checkout completo |
| C4 | Usuario hace clic en Finish |

## Reglas

| Condiciones / Reglas | R1 | R2 | R3 | R4 | R5 | R6 |
|---|---:|---:|---:|---:|---:|---:|
| C1. Usuario autenticado | Sí | Sí | Sí | Sí | No | Sí |
| C2. Carrito contiene productos | Sí | No | Sí | Sí | Sí | No |
| C3. Formulario completo | Sí | Sí | No | Sí | Sí | Sí |
| C4. Clic en Finish | Sí | Sí | Sí | No | Sí | Sí |
| **Resultado esperado** | Compra completada | No hay productos para comprar | Se muestra error del formulario | Permanece en checkout | Compra completada | No puede continuar correctamente |

## Descripción de las reglas

### Regla 1 - Usuario autenticado, carrito con productos y formulario completo

El usuario está autenticado, tiene al menos un producto en el carrito, completa correctamente los datos del checkout y presiona Finish.

**Resultado esperado:** la compra se completa correctamente y se muestra la confirmación del pedido.

### Regla 2 - Usuario autenticado con carrito vacío

El usuario está autenticado, pero no tiene productos en el carrito.

**Resultado esperado:** el carrito permanece vacío y no existen productos que procesar.

### Regla 3 - Formulario de checkout incompleto

El usuario está autenticado y tiene productos en el carrito, pero deja algún campo obligatorio del formulario vacío.

**Resultado esperado:** el sistema muestra un mensaje de validación y no permite continuar correctamente con el checkout.

### Regla 4 - No se presiona Finish

El usuario está autenticado, tiene productos y completa correctamente el formulario, pero no presiona Finish.

**Resultado esperado:** el proceso permanece en la pantalla de checkout y la compra no se finaliza.

### Regla 5 - Compra válida

El usuario está autenticado, tiene productos en el carrito, completa el formulario y presiona Finish.

**Resultado esperado:** la compra se completa y aparece la confirmación correspondiente.

### Regla 6 - Carrito sin productos

El usuario está autenticado pero no existen productos disponibles para procesar en el checkout.

**Resultado esperado:** no se puede completar una compra porque no existen productos en el carrito.

## Casos de prueba derivados

| Caso | Regla | Resultado esperado |
|---|---|---|
| CP-01 | R1 | Compra completada correctamente |
| CP-02 | R2 | Carrito vacío |
| CP-03 | R3 | Se muestra mensaje de error |
| CP-04 | R4 | Checkout permanece sin finalizar |
| CP-05 | R5 | Compra completada correctamente |
| CP-06 | R6 | No se puede completar la compra |

## Conclusión

La tabla de decisión permite representar diferentes combinaciones de condiciones que pueden afectar el comportamiento del checkout. A partir de las seis reglas definidas se pueden derivar casos de prueba que cubren escenarios positivos y negativos del proceso.