# 🧪 GUÍA DE PRUEBAS - Sistema de Trazabilidad/Auditoría

## Configuración Previa

### 1. Activar entorno virtual (si tienes uno)
```bash
cd /home/willo/universidad/software2/Taller-Diego/backend
source venv/bin/activate  # o el nombre de tu entorno virtual
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Iniciar el servidor
```bash
cd /home/willo/universidad/software2/Taller-Diego/backend
uvicorn main:app --reload
```

El servidor debería iniciar en: `http://127.0.0.1:8000`

---

## 🧪 Prueba 1: Crear un Producto

### Usando curl:
```bash
curl -X POST "http://localhost:8000/api/v1/productos/" \
  -H "Content-Type: application/json" \
  -H "X-Usuario: Juan Pérez" \
  -d '{
    "nombre": "Filtro de Aceite XYZ",
    "descripcion": "Filtro compatible con varios modelos",
    "precio": 25000,
    "stock": 50,
    "codBarras": "TEST001"
  }'
```

### Usando Python:
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/productos/",
    headers={"X-Usuario": "Juan Pérez"},
    json={
        "nombre": "Filtro de Aceite XYZ",
        "descripcion": "Filtro compatible con varios modelos",
        "precio": 25000,
        "stock": 50,
        "codBarras": "TEST001"
    }
)

print(response.json())
# Guarda el ID del producto para las siguientes pruebas
producto_id = response.json()["id"]
```

**✅ Resultado esperado**: Producto creado y auditoría registrada

---

## 🧪 Prueba 2: Actualizar el Producto

### Usando curl:
```bash
curl -X PUT "http://localhost:8000/api/v1/productos/1" \
  -H "Content-Type: application/json" \
  -H "X-Usuario: María García" \
  -d '{
    "nombre": "Filtro de Aceite XYZ Premium",
    "descripcion": "Filtro mejorado",
    "precio": 35000,
    "stock": 45,
    "codBarras": "TEST001"
  }'
```

### Usando Python:
```python
response = requests.put(
    f"http://localhost:8000/api/v1/productos/{producto_id}",
    headers={"X-Usuario": "María García"},
    json={
        "nombre": "Filtro de Aceite XYZ Premium",
        "descripcion": "Filtro mejorado",
        "precio": 35000,
        "stock": 45,
        "codBarras": "TEST001"
    }
)

print(response.json())
```

**✅ Resultado esperado**: Producto actualizado con datos_anteriores y datos_nuevos registrados

---

## 🧪 Prueba 3: Ver Historial del Producto

### Usando curl:
```bash
curl -X GET "http://localhost:8000/api/v1/productos/1/historial"
```

### Usando Python:
```python
response = requests.get(f"http://localhost:8000/api/v1/productos/{producto_id}/historial")
historial = response.json()

print(f"\n📋 Historial del Producto ID {producto_id}")
print(f"Total de cambios: {len(historial['historial'])}\n")

for i, cambio in enumerate(historial['historial'], 1):
    print(f"Cambio #{i}:")
    print(f"  Fecha: {cambio['fecha']}")
    print(f"  Usuario: {cambio['usuario']}")
    print(f"  Acción: {cambio['accion']}")
    print(f"  Descripción: {cambio['descripcion']}")
    if cambio.get('datos_anteriores'):
        print(f"  Antes: {cambio['datos_anteriores']}")
    if cambio.get('datos_nuevos'):
        print(f"  Después: {cambio['datos_nuevos']}")
    print()
```

**✅ Resultado esperado**: Lista completa de cambios del producto (CREATE y UPDATE)

---

## 🧪 Prueba 4: Consultar Toda la Auditoría

### Ver todos los cambios en inventario:
```bash
curl -X GET "http://localhost:8000/api/v1/auditoria/?modulo=inventario&limit=50"
```

### Ver solo creaciones:
```bash
curl -X GET "http://localhost:8000/api/v1/auditoria/?modulo=inventario&accion=CREATE"
```

### Ver solo actualizaciones:
```bash
curl -X GET "http://localhost:8000/api/v1/auditoria/?modulo=inventario&accion=UPDATE"
```

### Ver cambios de un usuario específico:
```bash
curl -X GET "http://localhost:8000/api/v1/auditoria/usuario/Juan%20Pérez"
```

### Usando Python:
```python
# Todos los cambios de inventario
response = requests.get("http://localhost:8000/api/v1/auditoria/", params={
    "modulo": "inventario",
    "limit": 50
})

data = response.json()
print(f"Total de registros: {data.get('total', 0)}")

for registro in data.get('registros', []):
    print(f"{registro['fecha']} - {registro['usuario']}")
    print(f"  {registro['accion']}: {registro['descripcion']}")
    print()
```

**✅ Resultado esperado**: Lista paginada de todos los cambios con filtros

---

## 🧪 Prueba 5: Eliminar el Producto

### Usando curl:
```bash
curl -X DELETE "http://localhost:8000/api/v1/productos/1" \
  -H "X-Usuario: Pedro López"
```

### Usando Python:
```python
response = requests.delete(
    f"http://localhost:8000/api/v1/productos/{producto_id}",
    headers={"X-Usuario": "Pedro López"}
)

print(response.json())

# Ver historial después de eliminar
response = requests.get(f"http://localhost:8000/api/v1/productos/{producto_id}/historial")
print("\nHistorial completo:")
print(response.json())
```

**✅ Resultado esperado**: Producto eliminado y auditoría con datos_anteriores registrada

---

## 🧪 Prueba 6: Script Automático (Más Fácil)

### Ejecutar el script de pruebas:
```bash
cd /home/willo/universidad/software2/Taller-Diego/backend
python test_auditoria.py
```

Este script ejecuta automáticamente todas las pruebas anteriores y muestra los resultados.

---

## 📊 Verificar en la Base de Datos

### Conectar a PostgreSQL/Supabase y ejecutar:
```sql
-- Ver todos los registros de auditoría
SELECT * FROM auditoria ORDER BY fecha DESC LIMIT 20;

-- Ver cambios por módulo
SELECT modulo, accion, COUNT(*) as total
FROM auditoria
GROUP BY modulo, accion;

-- Ver cambios de un producto específico
SELECT * FROM auditoria 
WHERE tabla = 'productos' AND registro_id = 1
ORDER BY fecha ASC;

-- Ver cambios por usuario
SELECT usuario, COUNT(*) as total_cambios
FROM auditoria
GROUP BY usuario
ORDER BY total_cambios DESC;
```

---

## 🌐 Probar desde el Frontend

### 1. Agregar header en fetch:
```javascript
// En frontend/scripts/inventory.js o similar

async function createProduct(productData) {
    const response = await fetch('http://localhost:8000/api/v1/productos/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Usuario': 'Admin Frontend'  // ← Agregar esto
        },
        body: JSON.stringify(productData)
    });
    
    return response.json();
}

async function updateProduct(id, productData) {
    const response = await fetch(`http://localhost:8000/api/v1/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Usuario': 'Admin Frontend'  // ← Agregar esto
        },
        body: JSON.stringify(productData)
    });
    
    return response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`http://localhost:8000/api/v1/productos/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Usuario': 'Admin Frontend'  // ← Agregar esto
        }
    });
    
    return response.json();
}
```

### 2. Ver historial de un producto:
```javascript
async function verHistorialProducto(productoId) {
    const response = await fetch(
        `http://localhost:8000/api/v1/productos/${productoId}/historial`
    );
    
    const data = await response.json();
    
    console.log(`Historial del producto ${productoId}:`);
    data.historial.forEach(cambio => {
        console.log(`${cambio.fecha} - ${cambio.usuario}: ${cambio.descripcion}`);
    });
}

// Llamar:
verHistorialProducto(1);
```

---

## 📱 Documentación de la API (Swagger)

Una vez el servidor esté corriendo, visita:

**http://localhost:8000/docs**

Allí encontrarás:
- 📚 Documentación interactiva de todos los endpoints
- 🧪 Interfaz para probar cada endpoint
- 📖 Esquemas de datos
- ✅ Respuestas de ejemplo

### Endpoints de Auditoría disponibles:

1. `GET /api/v1/auditoria/` - Consultar con filtros
2. `GET /api/v1/auditoria/historial/{tabla}/{registro_id}` - Historial de un registro
3. `GET /api/v1/auditoria/usuario/{usuario}` - Cambios de un usuario
4. `GET /api/v1/auditoria/modulo/{modulo}` - Cambios de un módulo
5. `GET /api/v1/productos/{id}/historial` - Historial de un producto específico

---

## ✅ Checklist de Pruebas

- [ ] El servidor inicia correctamente
- [ ] Se puede crear un producto
- [ ] La auditoría registra el CREATE
- [ ] Se puede actualizar un producto
- [ ] La auditoría registra datos_anteriores y datos_nuevos
- [ ] Se puede ver el historial de un producto
- [ ] Se puede eliminar un producto
- [ ] La auditoría registra el DELETE con datos_anteriores
- [ ] Los filtros de auditoría funcionan (módulo, acción, usuario)
- [ ] Se puede consultar por fecha
- [ ] La paginación funciona correctamente

---

## 🐛 Problemas Comunes

### Error: "ModuleNotFoundError"
**Solución**: Activar el entorno virtual correcto
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "Connection refused"
**Solución**: Verificar que el servidor esté corriendo
```bash
ps aux | grep uvicorn
```

### No se registra el usuario
**Solución**: Asegúrate de enviar el header `X-Usuario` en todas las peticiones

### Error 500 en auditoría
**Solución**: Verificar que la tabla `auditoria` exista
```bash
python crear_tabla_auditoria.py
```

---

## 📝 Notas Importantes

1. **Usuario actual**: El sistema espera recibir el usuario en el header `X-Usuario`. En producción deberías obtenerlo de un sistema de autenticación (JWT, sesión, etc.)

2. **IP Address**: Se captura automáticamente de los headers `X-Forwarded-For` o `X-Real-IP` (útil con proxies/nginx)

3. **Datos sensibles**: NO incluyas contraseñas u otros datos sensibles en `datos_anteriores` o `datos_nuevos`

4. **Rendimiento**: Los índices ya están creados para consultas rápidas en:
   - modulo + fecha
   - tabla + registro_id
   - usuario
   - accion
   - fecha

5. **Mantenimiento**: Considera implementar limpieza automática de registros muy antiguos (> 1 año)

---

## 🎯 Próximos Pasos

1. ✅ Integrar auditoría en `servicio_routes.py`
2. ✅ Integrar auditoría en `venta_routes.py`
3. ✅ Integrar auditoría en `orden_routes.py`
4. 🔲 Crear interfaz frontend para ver auditoría
5. 🔲 Implementar autenticación de usuarios
6. 🔲 Agregar filtros por fecha en el frontend
7. 🔲 Crear reportes de auditoría (Excel/PDF)
8. 🔲 Implementar alertas por acciones sospechosas

---

¡Listo para probar! 🚀
