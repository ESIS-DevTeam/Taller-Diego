# 📊 Sistema de Generación Automática de Códigos de Barras

## 🎯 Descripción General

El sistema genera automáticamente códigos de barras únicos para cada producto nuevo que se registra en el inventario del Taller Diego. Los códigos no se regeneran al editar productos existentes.

---

## 📝 Formato del Código

```
TALLER-XXXXX-CAT
```

### Estructura:
- **TALLER**: Prefijo fijo que identifica al taller
- **XXXXX**: Número correlativo de 5 dígitos (con padding de ceros)
- **CAT**: Sufijo de 3 letras que representa la categoría del producto

### Ejemplos:
```
TALLER-00001-FIL  → Primer producto, categoría "Filtros"
TALLER-00045-ACE  → Producto #45, categoría "Aceites"  
TALLER-00123-BAT  → Producto #123, categoría "Baterías"
TALLER-01500-HER  → Producto #1500, categoría "Herramientas"
```

---

## 🏷️ Mapeo de Categorías

El sistema utiliza códigos de 3 letras predefinidos para categorías comunes:

| Categoría      | Código | Ejemplo Completo      |
|----------------|--------|-----------------------|
| Filtros        | FIL    | TALLER-00001-FIL     |
| Aceites        | ACE    | TALLER-00002-ACE     |
| Llantas        | LLA    | TALLER-00003-LLA     |
| Baterías       | BAT    | TALLER-00004-BAT     |
| Frenos         | FRE    | TALLER-00005-FRE     |
| Lubricantes    | LUB    | TALLER-00006-LUB     |
| Herramientas   | HER    | TALLER-00007-HER     |
| Repuestos      | REP    | TALLER-00008-REP     |
| Accesorios     | ACC    | TALLER-00009-ACC     |
| Iluminación    | ILU    | TALLER-00010-ILU     |
| Eléctricos     | ELE    | TALLER-00011-ELE     |
| Suspensión     | SUS    | TALLER-00012-SUS     |
| Motor          | MOT    | TALLER-00013-MOT     |
| Transmisión    | TRA    | TALLER-00014-TRA     |
| Refrigeración  | REF    | TALLER-00015-REF     |
| Combustible    | COM    | TALLER-00016-COM     |
| Escape         | ESC    | TALLER-00017-ESC     |
| Carrocería     | CAR    | TALLER-00018-CAR     |
| Limpieza       | LIM    | TALLER-00019-LIM     |
| Seguridad      | SEG    | TALLER-00020-SEG     |

### Categorías no mapeadas:
Si se ingresa una categoría nueva que no está en el mapeo, el sistema:
1. Toma las primeras 3 letras del nombre
2. Elimina espacios y acentos
3. Convierte a mayúsculas

**Ejemplo:**
- "Parabrisas" → PAR → `TALLER-00021-PAR`
- "Limpia Vidrios" → LIM → `TALLER-00022-LIM`

---

## ⚙️ Funcionamiento Técnico

### 1. **Cuándo se genera**
- ✅ Al crear un **producto nuevo** (modo `add`)
- ❌ NO se regenera al **editar** un producto existente

### 2. **Proceso de generación con verificación de unicidad**
```javascript
// Paso 1: Obtener el último ID de la base de datos
const lastId = await getLastProductId(); // Ejemplo: 45

// Paso 2: Obtener todos los códigos existentes
const existingBarcodes = await getExistingBarcodes(); 
// ["TALLER-00001-FIL", "TALLER-00002-ACE", ...]

// Paso 3: Generar código único (verifica que no exista)
const barcode = generateBarcode("Filtros", lastId, existingBarcodes);
// Resultado: "TALLER-00046-FIL" (solo si no existe)

// Paso 4: Asignar al producto antes de guardar
formData.codBarras = barcode;
```

### 3. **Garantía de unicidad**

El sistema verifica la unicidad mediante un proceso de 3 capas:

#### **Capa 1: Verificación en memoria**
- Obtiene todos los códigos existentes de la BD
- Compara el código generado con el array de códigos
- Si existe, incrementa el número y vuelve a verificar

#### **Capa 2: Reintentos automáticos**
- Hasta 100 intentos para encontrar un código único
- Incrementa el número correlativo en cada intento
- Log de advertencia si detecta duplicados

#### **Capa 3: Fallback con timestamp**
- Si después de 100 intentos no hay código único
- Usa timestamp de 4 dígitos como número
- Formato: `TALLER-7891-CAT` (timestamp)

#### **Capa 4: Restricción de base de datos**
- Campo `codBarras` con constraint `UNIQUE`
- Si por algún error se intenta duplicar, la BD lo rechaza

### 4. **Algoritmo de generación única**

#### Función principal: `generateBarcode(categoria, lastId, existingBarcodes)`
```javascript
function generateBarcode(categoria, lastId, existingBarcodes = []) {
  const prefix = "TALLER";
  const categorySuffix = getCategorySuffix(categoria);
  
  let attempts = 0;
  const maxAttempts = 100;
  
  // Bucle de verificación de unicidad
  while (attempts < maxAttempts) {
    const nextNumber = (lastId + 1 + attempts).toString().padStart(5, '0');
    const barcode = `${prefix}-${nextNumber}-${categorySuffix}`;
    
    // Verificar si el código ya existe
    if (!existingBarcodes.includes(barcode)) {
      return barcode; // Código único encontrado ✅
    }
    
    attempts++; // Incrementar e intentar con siguiente número
  }
  
  // Fallback: usar timestamp si no se encuentra código único
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}-${categorySuffix}`;
}
```

#### Obtención de códigos existentes: `getExistingBarcodes()`
```javascript
async function getExistingBarcodes() {
  const productos = await fetchFromApi('productos');
  
  // Filtrar solo códigos no nulos
  const barcodes = productos
    .map(p => p.codBarras)
    .filter(code => code != null && code !== '');
  
  console.log(`🔖 Códigos de barras existentes: ${barcodes.length}`);
  return barcodes;
}
```

#### Obtención del sufijo: `getCategorySuffix(categoria)`
```javascript
function getCategorySuffix(categoria) {
  // 1. Buscar en mapeo predefinido
  if (categoryMap[categoria]) {
    return categoryMap[categoria];
  }
  
  // 2. Generar a partir del nombre
  return categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/\s+/g, "")             // Eliminar espacios
    .toUpperCase()
    .substring(0, 3);
}
```

#### Obtención del último ID: `getLastProductId()`
```javascript
async function getLastProductId() {
  const productos = await fetchFromApi('productos');
  
  if (!productos || productos.length === 0) {
    return 0; // Primera vez, inicia desde 0
  }
  
  return Math.max(...productos.map(p => p.id));
}
```

---

## 🗄️ Almacenamiento en Base de Datos

### Campo en la tabla `productos`:
```sql
codBarras VARCHAR UNIQUE NULL
```

- **Tipo**: String/VARCHAR
- **Restricción**: UNIQUE (no se permiten duplicados)
- **Nullable**: Sí (para productos antiguos sin código)

### Ejemplo de datos guardados:
```json
{
  "id": 46,
  "nombre": "Filtro de Aceite Premium",
  "categoria": "Filtros",
  "marca": "Bosch",
  "codBarras": "TALLER-00046-FIL",
  "stock": 25,
  "precioVenta": 35000,
  "precioCompra": 25000
}
```

---

## 🔍 Verificación en Supabase

### Pasos para verificar:
1. Abrir el panel de Supabase: https://supabase.com
2. Ir a **Table Editor** → Tabla `productos`
3. Buscar la columna `codBarras`
4. Verificar que los nuevos productos tienen códigos con formato `TALLER-XXXXX-CAT`

### Query SQL para verificar:
```sql
-- Ver todos los códigos generados
SELECT id, nombre, categoria, codBarras 
FROM productos 
WHERE codBarras IS NOT NULL
ORDER BY id DESC;

-- Verificar formato correcto
SELECT codBarras 
FROM productos 
WHERE codBarras LIKE 'TALLER-%'
ORDER BY codBarras DESC;

-- Contar productos con código
SELECT COUNT(*) as productos_con_codigo
FROM productos 
WHERE codBarras IS NOT NULL;
```

---

## 📋 Logs del Sistema

El sistema genera logs detallados en la consola del navegador para verificar unicidad:

### Proceso normal (código único en primer intento):
```javascript
🔄 Generando código de barras único...
📦 Último ID en BD: 45
🔖 Códigos de barras existentes: 23
📋 Ejemplos: TALLER-00001-FIL, TALLER-00002-ACE, TALLER-00003-BAT...
📊 Código de barras único generado: TALLER-00046-FIL (intentos: 1)
✅ Código único asignado: TALLER-00046-FIL
🔍 Verificado contra 23 códigos existentes
📤 Enviando producto con código: TALLER-00046-FIL
✅ Producto creado: {id: 46, nombre: "...", codBarras: "TALLER-00046-FIL"}
🔖 Código guardado en BD: TALLER-00046-FIL
```

### Proceso con código duplicado (reintentos):
```javascript
🔄 Generando código de barras único...
📦 Último ID en BD: 45
🔖 Códigos de barras existentes: 50
⚠️ Código TALLER-00046-FIL ya existe, generando nuevo...
⚠️ Código TALLER-00047-FIL ya existe, generando nuevo...
📊 Código de barras único generado: TALLER-00048-FIL (intentos: 3)
✅ Código único asignado: TALLER-00048-FIL
🔍 Verificado contra 50 códigos existentes
```

### Proceso con fallback (caso extremo):
```javascript
🔄 Generando código de barras único...
⚠️ Código TALLER-00046-FIL ya existe, generando nuevo...
⚠️ Código TALLER-00047-FIL ya existe, generando nuevo...
... (100 intentos)
❌ No se pudo generar código único, usando timestamp: TALLER-7891-FIL
✅ Código único asignado: TALLER-7891-FIL
```

### Cómo ver los logs:
1. Abrir DevTools (F12) en el navegador
2. Ir a la pestaña **Console**
3. Crear un producto nuevo
4. Observar los logs con emojis 🔄 📊 ✅

---

## 🚨 Manejo de Errores

### Caso 1: Error al obtener último ID
```javascript
❌ Error al obtener último ID: [error]
// Se usa ID = 0 por defecto
```

### Caso 2: Error al obtener códigos existentes
```javascript
❌ Error al obtener códigos existentes: [error]
// Se usa array vacío [], generación continúa sin verificación
```

### Caso 3: Código duplicado detectado
```javascript
⚠️ Código TALLER-00046-FIL ya existe, generando nuevo...
// Sistema reintenta automáticamente con siguiente número
// TALLER-00047-FIL, TALLER-00048-FIL, etc.
```

### Caso 4: Todos los números ocupados (100 intentos)
```javascript
❌ No se pudo generar código único, usando timestamp: TALLER-7891-FIL
// Fallback automático con timestamp de 4 dígitos
```

### Caso 5: Código duplicado en base de datos (último recurso)
Si por algún fallo el mismo código llega a la BD dos veces:
```sql
ERROR: duplicate key value violates unique constraint "productos_codbarras_key"
```
La restricción `UNIQUE` de PostgreSQL/Supabase rechaza la inserción.

### Caso 6: Error al generar código
```javascript
❌ Error generando código de barras: [error]
// Notificación al usuario: "Error al generar código de barras único"
// Se detiene el proceso de guardado (return)
```

---

## 🔮 Futuras Mejoras

### Posibles implementaciones:
1. **Generador visual de código de barras** usando JsBarcode
2. **Impresión de etiquetas** con código de barras
3. **Escáner de códigos** para búsqueda rápida
4. **Prefijo personalizable** por tipo de producto
5. **Regeneración manual** de códigos si es necesario

---

## 👨‍💻 Ubicación del Código

### Archivo principal:
```
frontend/scripts/componets/modal-product/modal-event.js
```

### Funciones implementadas:

#### 1. `generateBarcode(categoria, lastId, existingBarcodes)`
- **Parámetros**:
  - `categoria` (string): Categoría del producto
  - `lastId` (number): Último ID en BD
  - `existingBarcodes` (array): Códigos existentes para verificar
- **Retorna**: String con código único
- **Descripción**: Genera código único con verificación de duplicados
- **Reintentos**: Hasta 100 intentos con incremento automático
- **Fallback**: Timestamp de 4 dígitos si no encuentra código único

#### 2. `getCategorySuffix(categoria)`
- **Parámetros**:
  - `categoria` (string): Nombre de la categoría
- **Retorna**: String de 3 letras en mayúsculas
- **Descripción**: Convierte categoría a sufijo de 3 letras
- **Mapeo**: 20 categorías predefinidas + generación automática

#### 3. `getLastProductId()`
- **Parámetros**: Ninguno
- **Retorna**: Promise<number> - ID más alto en BD
- **Descripción**: Consulta el último ID para determinar siguiente número
- **Error handling**: Retorna 0 si no hay productos o hay error

#### 4. `getExistingBarcodes()`
- **Parámetros**: Ninguno
- **Retorna**: Promise<Array<string>> - Array de códigos existentes
- **Descripción**: Obtiene todos los códigos de la BD para verificar unicidad
- **Filtrado**: Elimina códigos null o vacíos
- **Logs**: Muestra cantidad total y ejemplos

#### 5. `setupFormSubmit()`
- **Parámetros**:
  - `form` (HTMLElement): Formulario del modal
  - `autopartCheckbox` (HTMLElement): Checkbox de autoparte
  - `type` (string): Tipo de operación ('add' o 'edit')
  - `productId` (number|null): ID del producto si es edición
- **Descripción**: Integra la generación automática en el flujo de creación
- **Proceso**: 
  1. Obtiene último ID
  2. Obtiene códigos existentes
  3. Genera código único
  4. Asigna a formData
  5. Envía a backend

---

## ✅ Checklist de Verificación

Para confirmar que el sistema funciona correctamente:

- [ ] Abrir el modal de "Agregar producto"
- [ ] Llenar todos los campos del formulario
- [ ] Seleccionar una categoría (ej: "Filtros")
- [ ] Hacer clic en "Agregar"
- [ ] Verificar notificación con el código generado
- [ ] Abrir consola del navegador (F12)
- [ ] Verificar logs con formato correcto
- [ ] Ir a Supabase → Tabla productos
- [ ] Buscar el producto recién creado
- [ ] Verificar que el campo `codBarras` tiene el formato `TALLER-XXXXX-CAT`
- [ ] Crear otro producto para verificar incremento del número

---

## 📞 Soporte

Si hay problemas con la generación de códigos:
1. Revisar la consola del navegador para errores
2. Verificar que el backend esté corriendo (`http://127.0.0.1:8000`)
3. Comprobar conexión a Supabase
4. Verificar logs en la consola con emojis 🔄 📊 ✅

---

**Fecha de implementación**: 22 de noviembre de 2025  
**Versión**: 1.0  
**Autor**: Sistema Taller Diego
