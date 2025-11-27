# 📊 Sistema de Código de Barras Base-26

## Formato: `T-A001-FIL`

### Estructura:
```
T - A001 - FIL
│   │ │    │
│   │ │    └─ Código de categoría (3 letras)
│   │ └────── Número secuencial (001-999)
│   └──────── Letra(s) base-26 (A, B...Z, AA, AB...ZZ)
└──────────── Prefijo del taller
```

## 🎯 Sistema Base-26 Alfanumérico

### Secuencia Completa:
```
A001 - A999    →  999 productos
B001 - B999    →  999 productos
C001 - C999    →  999 productos
...
Z001 - Z999    →  999 productos (Total letras simples: 25,974)
─────────────────────────────────
AA001 - AA999  →  999 productos
AB001 - AB999  →  999 productos
...
AZ001 - AZ999  →  999 productos
BA001 - BA999  →  999 productos
...
ZZ001 - ZZ999  →  999 productos (Total letras dobles: 649,350)
─────────────────────────────────
CAPACIDAD TOTAL: 675,999 productos
```

## 📈 Ventajas del Formato Base-26

### 1. **Ultra Compacto**
- ❌ Formato anterior: `TALLER-00001-FIL` (18 caracteres)
- ❌ Formato intermedio: `T-A00001-FIL` (13 caracteres)
- ✅ **Formato actual: `T-A001-FIL` (10 caracteres)**
- 🎯 **Reducción: 44% menos caracteres vs original**

### 2. **Alta Capacidad**
- **675,999 combinaciones únicas**
- Suficiente para negocios medianos y grandes
- Escalabilidad garantizada

### 3. **Mejor Escaneo**
- Códigos más cortos = barras más anchas
- Mayor tolerancia a errores de lectura
- Compatible CODE128

### 4. **Fácil de Leer**
- Formato intuitivo: `T-A001-FIL`
- Letras indican rango de productos
- Números secuenciales dentro del rango

## 📝 Ejemplos Reales

| ID Producto | Categoría | Código Generado | Rango |
|-------------|-----------|-----------------|-------|
| 1 | Filtros | `T-A001-FIL` | Letra simple |
| 999 | Aceites | `T-A999-ACE` | Límite A |
| 1,000 | Llantas | `T-B001-LLA` | Inicio B |
| 5,000 | Baterías | `T-F005-BAT` | Letra simple |
| 25,974 | Frenos | `T-Z999-FRE` | Límite Z |
| 25,975 | Filtros | `T-AA001-FIL` | Inicio dobles |
| 100,000 | Aceites | `T-CW100-ACE` | Letras dobles |
| 675,999 | Repuestos | `T-ZA675-REP` | Límite máximo |

## 🔢 Matemática del Sistema

### Fórmula de Conversión:
```javascript
totalNumber = lastId + 1
letterIndex = (totalNumber - 1) / 999 (división entera)
numberPart = ((totalNumber - 1) % 999) + 1

// Ejemplos:
ID 1     → letterIndex=0, number=1   → A001
ID 999   → letterIndex=0, number=999 → A999
ID 1000  → letterIndex=1, number=1   → B001
ID 25974 → letterIndex=25, number=999 → Z999
ID 25975 → letterIndex=26, number=1  → AA001 (26-26=0 → AA)
```

### Letras Dobles:
```javascript
Si letterIndex >= 26:
  doubleIndex = letterIndex - 26
  firstLetter = 'A' + (doubleIndex / 26)
  secondLetter = 'A' + (doubleIndex % 26)

// Ejemplos:
letterIndex 26 → doubleIndex=0  → AA (0/26=0, 0%26=0)
letterIndex 27 → doubleIndex=1  → AB (1/26=0, 1%26=1)
letterIndex 52 → doubleIndex=26 → BA (26/26=1, 26%26=0)
```

## 📋 Códigos de Categorías

| Categoría | Código |
|-----------|--------|
| Filtros | FIL |
| Aceites | ACE |
| Llantas | LLA |
| Baterías | BAT |
| Frenos | FRE |
| Lubricantes | LUB |
| Herramientas | HER |
| Repuestos | REP |
| Accesorios | ACC |
| Iluminación | ILU |
| Eléctricos | ELE |
| Suspensión | SUS |
| Motor | MOT |
| Transmisión | TRA |
| Refrigeración | REF |
| Combustible | COM |

## ✅ Características del Sistema

### Unicidad Garantizada:
1. ✅ Verificación en array de códigos existentes
2. ✅ Hasta 100 intentos con incremento
3. ✅ Fallback con timestamp + letra aleatoria
4. ✅ Logs detallados en consola

### Optimización de Impresión:
- **Canvas dinámico**: Se ajusta al ancho del código
- **Resolución alta**: Óptima para impresión
- **Formato PNG**: Compatibilidad universal
- **Nombre archivo**: `codigo-barras_T-A001-FIL.png`

## 🔧 Ubicación del Código

**Archivo**: `frontend/scripts/componets/modal-product/modal-event.js`

### Función principal:
```javascript
generateBarcode(categoria, lastId, existingBarcodes)
```

### Función de conversión:
```javascript
convertToBase26(num) // Convierte número a formato A001-ZZ999
```

## 📊 Comparativa de Formatos

| Formato | Caracteres | Capacidad | Ventaja |
|---------|-----------|-----------|---------|
| `TALLER-00001-FIL` | 18 | 99,999 | ❌ Muy largo |
| `T-A00001-FIL` | 13 | 2,599,999 | ⚠️ Medio |
| **`T-A001-FIL`** | **10** | **675,999** | ✅ **Óptimo** |

## 🎯 Recomendaciones

- ✅ **Perfecto para talleres medianos** (hasta 675K productos)
- ✅ **Excelente legibilidad** y escaneo
- ✅ **Escalable** sin modificar el formato
- ✅ **Compatible** con CODE128 estándar

Si necesitas **más de 675K productos**, considera:
- Agregar un tercer carácter: `T-AAA001-FIL` (17,575,999 combinaciones)
- O usar 4 dígitos: `T-A0001-FIL` (2,599,999 combinaciones)

---

**Fecha de implementación**: 23 de noviembre de 2025  
**Versión**: 3.0 (Base-26 Alfanumérica)
