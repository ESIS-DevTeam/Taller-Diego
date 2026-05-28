# Documentación: Implementación de la refactorización de `Venta`

Fecha: 20 de mayo de 2026

Resumen
-------
Documento que resume los cambios realizados para refactorizar `Venta` hacia un enfoque DDD/hexagonal, los archivos añadidos/actualizados, cómo ejecutar los tests y recomendaciones siguientes.

Cambios principales
-------------------
- Dominio puro:
  - `backend/domain/venta.py` — Aggregate Root `Venta` independiente de SQLAlchemy.
- Value Objects (ya presentes y utilizados):
  - `backend/core/value_objects.py` — `Cantidad`, `CantidadProductos`, `Precio`, `Email`, etc.
- Adaptadores / Puertos:
  - `backend/repositories/ports/venta_repository_interface.py` — protocolo (puerto) para repositorios de `Venta`.
  - `backend/repositories/inmemory/venta_inmemory_repo.py` — implementación en memoria para pruebas y DI.
- Persistencia adaptada:
  - `backend/db/models/venta.py` — modelo SQLAlchemy que delega validaciones/comportamiento al dominio compartiendo la lista `productos`.
- Servicio preparado para DI:
  - `backend/services/venta_service.py` — puede recibir un `repo` que implemente el puerto `VentaRepositoryInterface`.
- Tests añadidos/actualizados:
  - `tests/test_value_objects.py` — pruebas unitarias para VOs.
  - `tests/test_venta.py` — pruebas que usan el `Venta` del dominio (evitan dependencia directa a BD).
- Documentación ADR:
  - `docs/adr_refactorizacion_hexagonal_venta.md` — ADR que justifica la refactorización.

Qué verás en el código
-----------------------
- La lógica de negocio (validaciones de cantidad, cálculo de totales, invariantes) se encuentra en `backend/domain/venta.py` y en los Value Objects.
- El modelo persistente (`backend/db/models/venta.py`) actúa como un adaptador: comparte su lista `productos` con el Aggregate Root del dominio y delega operaciones.
- Se creó un puerto (`VentaRepositoryInterface`) para facilitar la inyección de dependencias y desacoplar la infraestructura.

Cómo ejecutar los tests (entorno del proyecto)
---------------------------------------------
1. Activar el virtualenv del proyecto si no está activo:

```bash
source venv/bin/activate
```

2. Instalar dependencias (si aún no están instaladas):

```bash
pip install -r requirements.txt
pip install pytest
```

3. Ejecutar los tests no dependientes de la base de datos:

```bash
python -m pytest tests/test_value_objects.py tests/test_venta.py -q
```

Resultado observado en mi ejecución local:

- `6 passed` (tests de Value Objects y Venta dominio)

Notas sobre tests que tocan BD
-----------------------------
- La suite completa falla si se intenta ejecutar módulos que inicializan la conexión a la BD (por ejemplo `backend/test_db_connection.py`) porque las credenciales configuradas apuntan a una instancia externa (Supabase) no accesible en este entorno.
- Opciones para ejecutar toda la suite en CI/local:
  - Usar un `engine` SQLite in-memory en los tests de integración.
  - Mockear la capa de persistencia o usar `InMemoryVentaRepository` para las pruebas unitarias.
  - Proveer variables de entorno con credenciales válidas en entornos controlados.

Recomendaciones siguientes (priorizadas)
----------------------------------------
1. Refactorizar `backend/repositories/venta_repo.py` para que, internamente, use el Aggregate Root del dominio (mismo enfoque aplicado a `db/models/venta.py`).
2. Añadir tests de integración con SQLite in-memory que validen `create_with_products` (transacciones y control de stock).
3. Integrar `VentaRepositoryInterface` en los endpoints de FastAPI para permitir DI en ejecución.
4. Añadir ejemplos en `README.md` mostrando cómo inyectar `InMemoryVentaRepository` en `VentaService` para pruebas locales.

Contacto
--------
Si quieres que deje el repositorio exactamente en el estado mínimo pedido por el PDF, o que continúe extendiendo la separación dominio/adaptadores, dime y lo ajusto.
