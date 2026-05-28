# ADR: Refactorización hacia Arquitectura Hexagonal — Venta

## Fecha

20 de mayo de 2026

## Contexto

Se aplicó una refactorización para acercar el módulo `Venta` a principios de Domain-Driven Design y a un estilo compatible con arquitectura hexagonal: el dominio (modelo `Venta` y sus Value Objects) contiene la lógica de negocio y las capas externas (servicios/repositorios) actúan como adaptadores/puertos.

## Decisión

1. Mantener `Venta` como Aggregate Root y encapsular validaciones y comportamiento relevantes del dominio en métodos del modelo.
2. Implementar y usar Value Objects para validar primitivos de dominio (por ejemplo, cantidades y precios).
3. Dejar a los repositorios la responsabilidad de persistencia y transacciones, usando los métodos del Aggregate Root para mutar el estado del dominio.

## Archivos afectados

- `backend/core/value_objects.py`: se implementaron `Cantidad` y `CantidadProductos` (entre otros VOs) para validar cantidades y encapsular reglas.
- `backend/db/models/venta.py`: `Venta` actúa como Aggregate Root con métodos: `agregar_producto`, `remover_producto`, `calcular_total`, `obtener_cantidad_productos`, `obtener_cantidad_total_items`, `tiene_productos`, `obtener_fecha`.
- `backend/repositories/venta_repo.py`: el repositorio delega validaciones de persistencia y usa `venta.agregar_producto` para garantizar invariantes del dominio durante la creación con productos.
- `backend/services/venta_service.py`: la capa de servicio delega en el repositorio y en el dominio para obtener totales y resúmenes.

## Justificación

Mover las validaciones y cálculo de totales al dominio evita inconsistencias (por ejemplo, agregar cantidades inválidas) y facilita pruebas unitarias del comportamiento del negocio sin necesidad de infraestructura.

## Cambios concretos y efectos

- Validaciones de cantidad: `Cantidad` verifica que la cantidad sea un entero entre 1 y 10.000. Esto impide que el repositorio o servicios inserten datos inválidos.
- Invariantes protegidos: `Venta.agregar_producto` crea y valida `Cantidad` antes de mutar la colección `productos`.
- Persistencia: `VentaRepository.create_with_products` controla transacciones, bloqueo de filas y delega la lógica de dominio al Aggregate Root.

## Consecuencias

- Positivas: integridad de invariantes, mayor cohesión del dominio, mejor testabilidad y preparación para eventos de dominio.
- Negativas: mayor cantidad de objetos y abstracciones; equipo debe familiarizarse con VOs y AR.

## Siguientes pasos recomendados

1. Añadir pruebas unitarias para `Cantidad` y los métodos de `Venta`.
2. Implementar pruebas de integración para `VentaRepository.create_with_products` que validen transacciones y control de stock.
3. Diseñar puertos (interfaces) explícitos si se desea separar aún más la infraestructura (p. ej. `VentaRepositoryInterface`).
4. Implementar inyección de dependencias en `VentaService` y hacer que `VentaRepository` implemente el puerto `VentaRepositoryInterface`.

## Referencias

- ADR existente: `docs/adr_aggregate_root_venta.md`
- Código: `backend/core/value_objects.py`, `backend/db/models/venta.py`, `backend/repositories/venta_repo.py`, `backend/services/venta_service.py`
