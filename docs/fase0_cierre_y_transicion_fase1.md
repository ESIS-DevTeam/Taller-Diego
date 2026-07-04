# Fase 0 - Cierre y transicion a Fase 1

## Estado validado del MVP actual

- Backend operativo con FastAPI y PostgreSQL/Supabase.
- Login validado con credenciales reales del proyecto.
- Inventario validado:
  - listar productos;
  - crear producto;
  - editar producto;
  - eliminar producto;
  - buscar por codigo de barras;
  - descontar stock desde venta.
- Servicios validado:
  - listar servicios;
  - crear servicio;
  - editar servicio;
  - eliminar servicio.
- Ventas validado:
  - registrar venta con productos;
  - descontar stock;
  - eliminar venta.
- Ordenes validado:
  - crear orden con el modelo actual;
  - asociar servicios;
  - eliminar orden.

## Modelo actual que se mantiene temporalmente

El modulo actual de ordenes no representa todavia la recepcion real del taller.
Actualmente usa estos campos:

- `garantia`
- `estadoPago`
- `precio`
- `fecha`
- `servicios`
- `empleados`

Este modelo queda como compatibilidad temporal mientras se construye el flujo
MVP real de Fase 1 y Fase 2.

## Brecha que se cierra en Fase 1

Fase 1 debe introducir el modelo central real:

- Cliente con telefono obligatorio.
- Vehiculo con patente obligatoria y unica.
- Busqueda/creacion iniciada por patente.
- Base para una futura orden de servicio ligada a cliente y vehiculo.

La recepcion completa con observaciones, fotos, mecanico, repuestos, pagos,
garantia de 180 dias y proforma queda para las fases siguientes del plan.

## Reglas para continuar

- No mezclar el modelo legado de `ordenes` con el nuevo flujo de recepcion.
- Mantener endpoints existentes funcionando mientras se agregan nuevos endpoints.
- Usar migraciones/versionado antes de modificar tablas existentes.
- Probar cada avance con `pytest` y `npm test`.
