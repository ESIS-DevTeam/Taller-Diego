# 📋 Sistema de Auditoría/Trazabilidad

## Descripción

Sistema completo de auditoría que registra todas las acciones (CREATE, UPDATE, DELETE) realizadas en los módulos de **Inventario**, **Servicios** y **Orden/Ventas**.

## Características

✅ Registro automático de:
- **Quién**: Usuario que realizó la acción
- **Qué**: Tipo de acción (crear, modificar, eliminar)
- **Cuándo**: Fecha y hora exacta
- **Dónde**: Módulo y tabla afectada
- **Cómo**: Datos antes y después del cambio
- **Desde dónde**: Dirección IP del usuario

## Instalación

### 1. Crear la tabla de auditoría

```bash
cd backend
python crear_tabla_auditoria.py
```

### 2. Registrar el modelo en __init__.py

Edita `backend/db/models/__init__.py` y agrega:

```python
from .auditoria import Auditoria
```

### 3. Registrar las rutas en main.py

Edita `backend/main.py` y agrega:

```python
from api.v1.routes import auditoria_routes

app.include_router(auditoria_routes.router, prefix="/api/v1")
```

## Uso en el Backend

### Registrar una acción

```python
from services.auditoria_service import AuditoriaService

# Al crear un producto
AuditoriaService.registrar_accion(
    db=db,
    modulo="inventario",
    accion="CREATE",
    tabla="productos",
    registro_id=producto.id,
    usuario="Juan Pérez",
    datos_nuevos={"nombre": "Filtro de aceite", "precio": 15000},
    descripcion="Producto creado",
    ip_address="192.168.1.100"
)

# Al actualizar
AuditoriaService.registrar_accion(
    db=db,
    modulo="inventario",
    accion="UPDATE",
    tabla="productos",
    registro_id=5,
    usuario="María García",
    datos_anteriores={"stock": 10},
    datos_nuevos={"stock": 15},
    descripcion="Stock actualizado de 10 a 15",
    ip_address="192.168.1.101"
)

# Al eliminar
AuditoriaService.registrar_accion(
    db=db,
    modulo="servicios",
    accion="DELETE",
    tabla="servicios",
    registro_id=3,
    usuario="Pedro López",
    datos_anteriores={"nombre": "Cambio de aceite", "descripcion": "..."},
    descripcion="Servicio eliminado",
    ip_address="192.168.1.102"
)
```

### Integración en rutas

```python
from fastapi import Request
from core.auditoria_utils import obtener_ip_cliente, obtener_usuario_actual

@router.post("/productos/")
def crear_producto(producto: ProductoCreate, request: Request, db: Session = Depends(get_db)):
    # Crear producto
    nuevo_producto = service.create_producto(producto)
    
    # Auditoría automática
    AuditoriaService.registrar_accion(
        db=db,
        modulo="inventario",
        accion="CREATE",
        tabla="productos",
        registro_id=nuevo_producto.id,
        usuario=obtener_usuario_actual(request),
        datos_nuevos={"nombre": nuevo_producto.nombre},
        ip_address=obtener_ip_cliente(request)
    )
    
    return nuevo_producto
```

## Endpoints de API

### Obtener registros de auditoría con filtros

```http
GET /api/v1/auditoria/
```

**Parámetros query:**
- `modulo`: inventario, servicios, venta
- `accion`: CREATE, UPDATE, DELETE
- `tabla`: productos, servicios, ventas
- `usuario`: nombre del usuario
- `registro_id`: ID del registro
- `fecha_inicio`: YYYY-MM-DD
- `fecha_fin`: YYYY-MM-DD
- `skip`: paginación (default: 0)
- `limit`: registros por página (default: 100)

**Ejemplo:**
```http
GET /api/v1/auditoria/?modulo=inventario&accion=CREATE&skip=0&limit=50
```

### Obtener historial de un registro específico

```http
GET /api/v1/auditoria/historial/{tabla}/{registro_id}
```

**Ejemplo:**
```http
GET /api/v1/auditoria/historial/productos/123
```

### Obtener acciones de un usuario

```http
GET /api/v1/auditoria/usuario/{usuario}
```

**Ejemplo:**
```http
GET /api/v1/auditoria/usuario/Juan%20Pérez
```

### Obtener auditoría por módulo

```http
GET /api/v1/auditoria/modulo/{modulo}
```

**Ejemplo:**
```http
GET /api/v1/auditoria/modulo/inventario?accion=DELETE
```

## Respuesta de ejemplo

```json
{
  "total": 150,
  "registros": [
    {
      "id": 1,
      "modulo": "inventario",
      "accion": "CREATE",
      "tabla": "productos",
      "registro_id": 45,
      "usuario": "Juan Pérez",
      "fecha": "2025-12-03T10:30:00",
      "datos_anteriores": null,
      "datos_nuevos": {
        "nombre": "Filtro de aceite",
        "precio": 15000,
        "stock": 20
      },
      "descripcion": "Se creó el producto 'Filtro de aceite'",
      "ip_address": "192.168.1.100"
    }
  ],
  "pagina": 1,
  "total_paginas": 3
}
```

## Integración en Frontend

### Obtener historial de un producto

```javascript
async function obtenerHistorialProducto(productoId) {
  const response = await fetch(
    `http://localhost:8000/api/v1/auditoria/historial/productos/${productoId}`
  );
  const historial = await response.json();
  
  historial.forEach(registro => {
    console.log(`${registro.fecha} - ${registro.usuario}: ${registro.descripcion}`);
  });
}
```

### Filtrar auditoría

```javascript
async function obtenerAuditoriaInventario() {
  const params = new URLSearchParams({
    modulo: 'inventario',
    accion: 'UPDATE',
    limit: 50
  });
  
  const response = await fetch(
    `http://localhost:8000/api/v1/auditoria/?${params}`
  );
  const data = await response.json();
  
  console.log(`Total de registros: ${data.total}`);
  console.log(`Registros:`, data.registros);
}
```

## Enviar usuario desde el frontend

### Opción 1: Header personalizado

```javascript
async function crearProducto(producto, usuario) {
  const response = await fetch('http://localhost:8000/api/v1/productos/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Usuario': usuario  // Enviar nombre de usuario
    },
    body: JSON.stringify(producto)
  });
  return response.json();
}
```

### Opción 2: Incluir en el body

```javascript
async function crearProducto(producto, usuario) {
  const data = {
    ...producto,
    _usuario: usuario  // Campo especial para auditoría
  };
  
  const response = await fetch('http://localhost:8000/api/v1/productos/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  return response.json();
}
```

## Mejores Prácticas

### ✅ DO (Hacer)

- Registrar auditoría en todas las operaciones de escritura (CREATE, UPDATE, DELETE)
- Incluir siempre el usuario que realiza la acción
- Guardar datos_anteriores en UPDATE y DELETE para poder revertir cambios
- Usar descripciones claras y legibles
- Implementar paginación al consultar la auditoría

### ❌ DON'T (No hacer)

- No registrar auditoría en operaciones de solo lectura (GET)
- No incluir información sensible (contraseñas) en datos_anteriores/nuevos
- No hacer la tabla de auditoría editable o eliminable por usuarios comunes
- No olvidar crear índices (afecta el rendimiento)

## Reportes y Análisis

### Cambios por usuario

```sql
SELECT usuario, COUNT(*) as total_cambios, 
       COUNT(CASE WHEN accion = 'CREATE' THEN 1 END) as creaciones,
       COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as actualizaciones,
       COUNT(CASE WHEN accion = 'DELETE' THEN 1 END) as eliminaciones
FROM auditoria
WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY usuario
ORDER BY total_cambios DESC;
```

### Actividad por módulo

```sql
SELECT modulo, accion, COUNT(*) as total
FROM auditoria
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY modulo, accion
ORDER BY modulo, total DESC;
```

### Cambios recientes

```sql
SELECT * FROM auditoria
WHERE tabla = 'productos'
ORDER BY fecha DESC
LIMIT 50;
```

## Mantenimiento

### Limpieza de registros antiguos

Se recomienda implementar una tarea programada para eliminar registros muy antiguos:

```python
from datetime import datetime, timedelta

def limpiar_auditoria_antigua(db: Session, dias: int = 365):
    """Eliminar registros de auditoría más antiguos que X días"""
    fecha_limite = datetime.now() - timedelta(days=dias)
    
    registros_eliminados = db.query(Auditoria).filter(
        Auditoria.fecha < fecha_limite
    ).delete()
    
    db.commit()
    return registros_eliminados
```

## Seguridad

- ⚠️ La tabla de auditoría NO debe ser editable por usuarios comunes
- ⚠️ Solo administradores deben tener acceso de lectura
- ⚠️ Implementar autenticación y autorización antes de exponer los endpoints
- ⚠️ No exponer datos sensibles en datos_anteriores/nuevos

## Soporte

Para más información, consulta los archivos de ejemplo:
- `services/producto_service_con_auditoria_ejemplo.py`
- `api/v1/routes/producto_routes_con_auditoria_ejemplo.py`
