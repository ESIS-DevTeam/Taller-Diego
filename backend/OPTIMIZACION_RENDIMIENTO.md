# 🚀 Optimizaciones de Rendimiento - Sistema Taller Diego

## Objetivo: Respuesta < 1 segundo en todas las operaciones

### ✅ Optimizaciones Implementadas

#### 1. **Base de Datos**

**Índices Creados:**
```sql
-- Índices en tabla auditoria (ya implementados)
CREATE INDEX idx_auditoria_modulo_fecha ON auditoria(modulo, fecha DESC);
CREATE INDEX idx_auditoria_tabla_registro ON auditoria(tabla, registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario);
CREATE INDEX idx_auditoria_accion ON auditoria(accion);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha DESC);

-- Índices adicionales recomendados para productos
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_codbarras ON productos("codBarras");
```

**Connection Pooling:**
```python
# En db/base.py (ya implementado)
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,          # Conexiones permanentes
    max_overflow=20,       # Conexiones adicionales bajo carga
    pool_pre_ping=True     # Verificar conexión antes de usar
)
```

#### 2. **Caché en Memoria**

**Sistema de caché implementado:**
- TTL configurable (default: 120 segundos para listas)
- Invalidación por patrones
- Estadísticas de hit rate
- Generación automática de claves

**Uso:**
```python
# Lista de productos cacheada por 2 minutos
cached = cache.get('productos_list_all')
if cached:
    return cached

productos = repo.get_all()
cache.set('productos_list_all', productos, ttl_seconds=120)
```

#### 3. **Compresión de Respuestas**

**GZip Middleware (ya implementado en main.py):**
```python
app.add_middleware(GZipMiddleware, minimum_size=1000)
```
- Reduce tamaño de respuestas JSON en ~70%
- Solo para respuestas > 1KB
- Ahorro de ancho de banda

#### 4. **Optimización de Queries**

**Límites por defecto:**
```python
# Evitar consultas sin límite
def get_all(self):
    return self.db.query(Producto).order_by(Producto.id.desc()).limit(1000).all()

# Auditoría con límite razonable
def get_by_registro(db, tabla, registro_id, limit=100):
    return query.limit(limit).all()
```

**Paginación:**
```python
# En endpoints de auditoría
limit: int = Query(100, ge=1, le=1000)
skip: int = Query(0, ge=0)
```

#### 5. **Headers de Caché HTTP**

**Cache-Control headers (ya implementado):**
```python
# En main.py middleware
if request.url.path.startswith("/api/v1/"):
    response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutos
```

### 📊 Métricas de Rendimiento

#### Tiempos Esperados (< 1 segundo):

| Operación | Sin Caché | Con Caché | Target |
|-----------|-----------|-----------|--------|
| GET /productos/ (lista completa) | ~400ms | ~50ms | < 1s ✅ |
| GET /productos/{id} | ~100ms | ~20ms | < 1s ✅ |
| POST /productos/ | ~200ms | N/A | < 1s ✅ |
| PUT /productos/{id} | ~250ms | N/A | < 1s ✅ |
| GET /auditoria/ (100 registros) | ~300ms | ~80ms | < 1s ✅ |
| GET /productos/{id}/historial | ~150ms | ~40ms | < 1s ✅ |

#### Factores que Afectan el Rendimiento:

**✅ Optimizado:**
- Índices en columnas frecuentemente consultadas
- Connection pooling (10-30 conexiones)
- Caché en memoria para lecturas
- Compresión GZip
- Límites en queries
- Eager loading donde es necesario

**⚠️ Posibles Cuellos de Botella:**
- Latencia de red a Supabase (depende de ubicación)
- Queries sin índices en tablas grandes
- Respuestas muy grandes sin paginación
- Auditoría sin límite en historiales largos

### 🧪 Pruebas de Rendimiento

#### 1. Prueba de Latencia Simple

```bash
# Medir tiempo de respuesta
time curl -s http://localhost:8000/api/v1/productos/ > /dev/null

# Con output
curl -w "\nTiempo total: %{time_total}s\n" -s http://localhost:8000/api/v1/productos/ -o /dev/null
```

#### 2. Prueba de Carga con Apache Bench

```bash
# Instalar ab
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install apache2                  # macOS

# 100 requests, 10 concurrentes
ab -n 100 -c 10 http://localhost:8000/api/v1/productos/

# Con headers personalizados
ab -n 100 -c 10 -H "X-Usuario: Test" http://localhost:8000/api/v1/productos/
```

#### 3. Prueba con Python (Script Incluido)

```bash
cd backend
python test_performance.py
```

#### 4. Verificar Estadísticas de Caché

```python
# Endpoint para ver estadísticas
GET /api/v1/cache/stats

# Respuesta esperada:
{
    "size": 5,
    "hits": 847,
    "misses": 123,
    "hit_rate": "87.32%"
}
```

### 📈 Recomendaciones Adicionales

#### Para Producción:

1. **Redis en lugar de caché en memoria:**
```bash
pip install redis
```
```python
import redis
cache_client = redis.Redis(host='localhost', port=6379, db=0)
```

2. **CDN para archivos estáticos:**
- Servir CSS, JS, imágenes desde CDN
- Reducir carga en servidor backend

3. **Load Balancer:**
- Múltiples instancias del backend
- NGINX como reverse proxy

4. **Monitoring:**
```bash
pip install prometheus-fastapi-instrumentator
```

5. **Database Read Replicas:**
- Lecturas en replicas
- Escrituras en master

#### Optimizaciones Frontend:

1. **Lazy Loading de imágenes**
2. **Debounce en búsquedas** (ya implementado)
3. **Virtual scrolling para listas grandes**
4. **Service Worker para caché offline** (ya implementado)
5. **Compression en nginx:**
```nginx
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1000;
```

### 🔍 Monitoreo Continuo

#### Logs de Performance

```python
import time

@app.middleware("http")
async def log_performance(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Alertar si > 1 segundo
    if process_time > 1.0:
        logger.warning(f"SLOW REQUEST: {request.url.path} took {process_time:.2f}s")
    
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

#### Query Profiling

```python
# En PostgreSQL
EXPLAIN ANALYZE SELECT * FROM productos WHERE categoria = 'Filtros';

# Ver queries lentas
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### ✅ Checklist de Optimización

- [x] Índices en tabla auditoria
- [x] Connection pooling configurado
- [x] Caché en memoria implementado
- [x] GZip compression habilitado
- [x] Límites en queries
- [x] Paginación en endpoints
- [x] Headers de caché HTTP
- [x] Middleware de performance tracking
- [ ] Índices adicionales en productos/servicios
- [ ] Tests de carga automatizados
- [ ] Monitoring con Prometheus
- [ ] CDN para estáticos
- [ ] Redis para producción

### 📝 Notas

- El caché actual es **en memoria**: Se pierde al reiniciar el servidor
- Para **alta disponibilidad**: Migrar a Redis
- **Supabase**: Ya tiene optimizaciones de PostgreSQL
- **Network latency**: Principal factor fuera de nuestro control
- **Índices**: Revisar periódicamente con tablas grandes (>10k registros)

### 🎯 Casos de Prueba Específicos

#### Test 1: Lista de productos completa
```bash
# Debe responder en < 500ms (primera vez) y < 100ms (con caché)
time curl http://localhost:8000/api/v1/productos/
```

#### Test 2: Búsqueda por código de barras
```bash
# Debe responder en < 200ms (hay índice)
time curl http://localhost:8000/api/v1/productos/barcode/AUDIT999
```

#### Test 3: Historial de auditoría
```bash
# Debe responder en < 300ms (índice compuesto)
time curl http://localhost:8000/api/v1/productos/5/historial
```

#### Test 4: Consulta de auditoría con filtros
```bash
# Debe responder en < 400ms (múltiples índices)
time curl "http://localhost:8000/api/v1/auditoria/?modulo=inventario&limit=100"
```

---

**Resultado Final Esperado:** ✅ Todas las operaciones < 1 segundo
