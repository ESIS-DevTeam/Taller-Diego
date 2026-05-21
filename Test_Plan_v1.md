# Plan de Pruebas - Módulo de Ventas (Test_Plan_v1)

## 1. Estrategia (Diseño Guiado por el Dominio)

### 1.1 Contexto Delimitado (Bounded Context)
**Gestión de Ventas:** Encargado de manejar la facturación, registro de conceptos a pagar y cálculo de los totales de los servicios y productos brindados en el Taller Mecánico.

### 1.2 Lenguaje Ubicuo (Ubiquitous Language)
*   **Venta (Aggregate Root):** Transacción comercial generada en el taller.
*   **Detalle de Venta (Entity / Value Object):** Línea de la venta que representa los productos o servicios adquiridos y sus cantidades.
*   **Total:** Suma monetaria de todos los detalles de venta, incluyendo impuestos.
*   **Venta Registrada (Domain Event):** Evento que ocurre cuando el cliente acepta pagar la transacción.

### 1.3 Eventos de Dominio (Event Storming)
*   `VentaIniciada`
*   `DetalleAgregadoALaVenta`
*   `VentaRegistrada` (Evento clave de negocio)

---

## 2. Desafío de Diseño: Plan de Pruebas del Aggregate Root (Venta)

### 2.1 Identificación del Caso de Uso (CU)
**CU: Registrar Nueva Venta**
*   **Descripción:** El sistema debe registrar una venta consolidando productos. 
*   **Invariantes a proteger (Reglas de Negocio):** 
    1. Una venta no puede registrarse si no tiene al menos un detalle (producto/servicio).
    2. El monto total nunca puede ser negativo ni 0.
    3. Una vez registrada, la venta pasa a estado finalizado y no se pueden agregar más detalles.

### 2.2 Casos Unitarios (Aislamiento - Fase de Blindaje)
Se realizarán las siguientes pruebas utilizando el patrón **AAA (Arrange, Act, Assert)** sin conexión a base de datos:

1.  **Prueba de Invariante 1 (Value Objects/Entities):** `Debe rechazar el registro de una venta vacía (sin detalles) lanzando una excepción`.
2.  **Prueba de Invariante 2:** `Debe calcular correctamente el total exacto sumando la cantidad y precio de múltiples detalles`.
3.  **Prueba de Invariante 3:** `Debe impedir cobrar cantidades negativas o igual a cero en cualquier detalle de los productos`.

### 2.3 Estrategia de Mocks (Simulacro Hexagonal)
Para probar la lógica del negocio sin depender de la base de datos (SQLite/Supabase):
*   Se creará un `VentaRepositoryMock` en memoria que implementará el puerto de salida (`VentaRepositoryInterface`).
*   Se interceptarán las llamadas al repositorio usando objetos en memoria reseteados en cada iteración mediante el bloque `beforeEach` (o el equivalente *fixture* de Pytest).
*   Esto asegura que el comportamiento puro de la venta y la persistencia estén completamente desacoplados.