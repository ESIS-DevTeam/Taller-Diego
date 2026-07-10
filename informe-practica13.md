# Pipeline GitOps Integrado — Taller de Diego

**Semana 13 · IS2-2026 — Gestión de Versiones con GitOps: SemVer, Dependencias, Empaquetado y Pipeline de Entrega**

**Equipo:** ESIS-DevTeam · **Repositorio:** https://github.com/ESIS-DevTeam/Taller-Diego
**Proyecto:** Sistema de gestión para taller mecánico (FastAPI + Supabase + frontend web)

---

## (a) Política SemVer del proyecto

La política se formalizó en la sección **"Política de Versionamiento (SemVer 2.0.0)"** del `README.md` del repositorio. Resumen:

| Segmento | Criterio del proyecto | Ejemplo concreto |
|---|---|---|
| **MAJOR** (vX.0.0) | Cambio incompatible en la API pública `/api/v1` | Renombrar `precioVenta` → `precio_venta` en la respuesta de `GET /api/v1/productos` |
| **MINOR** (v0.X.0) | Funcionalidad nueva retrocompatible | Agregar el módulo CAJA (`/api/v1/caja/cierre`, `/notas`, `/deudores`) sin alterar endpoints existentes |
| **PATCH** (v0.0.X) | Corrección retrocompatible sin cambiar la interfaz | Validar nombre duplicado al editar producto (`PUT /productos/{id}` responde 400) |
| **Pre-release** (-rc.1) | Versión de validación previa al release oficial | `v2.0.0-rc.1` para pruebas de integración antes de `v2.0.0` |

**Clasificación de los tres cambios del sprint:**

| Cambio del sprint | Clasificación | Justificación |
|---|---|---|
| Dashboard de Inicio con KPIs reales (ingresos, pendientes, deudores, notas) | **MINOR** | Añade funcionalidad sin alterar ningún endpoint existente |
| Validación de nombre duplicado al editar producto/autoparte | **PATCH** | Corrige un defecto; la firma del endpoint no cambia |
| Renombrar campo de la respuesta de `GET /api/v1/productos` | **MAJOR** | Breaking change: los consumidores dejan de encontrar el campo |

> 📷 **EVIDENCIA 1:** Captura de la sección "Política de Versionamiento" en el README del repositorio.

`[PEGAR CAPTURA AQUÍ]`

---

## (b) Dependencias fijadas y lockfile versionado

Se auditó `requirements.txt`: **todas las dependencias estaban SIN fijar** (ej. `fastapi` a secas, que instala "la última que haya ese día"). Se fijaron a la versión exacta instalada y verificada en el entorno del equipo (dependency pinning):

```
fastapi==0.121.0          sqlalchemy==2.0.44
pydantic[email]==2.12.4   python-multipart==0.0.20
uvicorn==0.38.0           psycopg2-binary==2.9.11
pydantic-settings==2.11.0 httpx==0.28.1
flake8==7.3.0             pytest==9.0.3
pytest-bdd==8.1.0         coverage==7.14.0
```

Además se generó y versionó el **lockfile completo** `requirements.lock.txt` (75 paquetes, incluye dependencias transitivas, generado con `pip freeze`).

**Caso documentado — cómo un rango abierto introduce un breaking change transitivo:**
Si declaráramos `pydantic^2.0` (o simplemente `pydantic`), una reinstalación futura podría traer `pydantic 3.0.0`, que elimina/cambia la API de validadores v2 (`model_validator`, `ConfigDict`). Nuestros schemas (`producto_schema.py`, `caja_schema.py`, etc.) dejarían de cargar y el backend **no arrancaría**, sin que ningún commit nuestro haya cambiado: el build dejaría de ser reproducible. Peor aún, `fastapi` sin fijar podría arrastrar transitivamente esa `pydantic 3` como dependencia suya. **El pinning lo evita** porque `pydantic==2.12.4` garantiza que hoy, mañana y en el servidor de CI se instala exactamente el mismo árbol de dependencias auditado, y cualquier actualización pasa por un commit revisable (trazable bajo IEEE 828-2012).

> 📷 **EVIDENCIA 2:** Captura de `requirements.txt` fijado y `requirements.lock.txt` en el repositorio.

`[PEGAR CAPTURA AQUÍ]`

---

## (c) Tabla de versiones del sprint

| Versión | Tipo | Contenido | Estado |
|---|---|---|---|
| `v1.1.0` | MINOR | Release previo del equipo (semana 12) | Publicada |
| `v1.2.0` | **MINOR** | Dashboard KPIs reales + validación duplicados + categorías dinámicas + pipeline GitOps (política SemVer, pinning, Dockerfile, manifiestos ArgoCD) | **Firmada y verificada** |
| `v1.2.1` | PATCH *(clasificación errónea deliberada)* | Breaking change integrado sin subir MAJOR — simulación de la Fase 6 | Firmada (evidencia del error) |
| `v1.2.1-revert` | Rollback | Revierte el breaking change; la API vuelve al contrato de `v1.2.0` | Firmada y verificada |

---

## (d) Etiqueta firmada verificada y artefacto versionado

**Comandos ejecutados:**

```bash
git tag -s v1.2.0 -m "Release v1.2.0 (MINOR): dashboard de Inicio con KPIs reales, ..."
git tag -v v1.2.0
git push origin v1.2.0
```

**Salida real de la verificación (`git tag -v v1.2.0`):**

```
object 8fb50a6099d30a04a4536f450284875556ec6207
type commit
tag v1.2.0
tagger Alex Yasmani Huaracha Bellido <ayhuarachab@unjbg.edu.pe>

Release v1.2.0 (MINOR): dashboard de Inicio con KPIs reales, validación de
duplicados en inventario, categorías dinámicas y pipeline GitOps
gpg: Signature made Thu Jul  9 11:25:42 2026 HPS
gpg:                using EDDSA key AC3AC048B5EF3AA34A545437D0FA13F6429D9399
gpg: Good signature from "Alex Yasmani Huaracha Bellido <alex51015bg@gmail.com>" [ultimate]
```

**Artefacto versionado e inmutable:** se empaquetó el contenido exacto de la etiqueta `v1.2.0` (mismo commit auditado, firmado y desplegable):

```bash
git archive --format=zip -o dist/taller-diego-v1.2.0.zip v1.2.0
sha256sum dist/taller-diego-v1.2.0.zip
```

**Digest registrado (garantiza inmutabilidad):**

```
SHA-256: f876d010b59c34f8f82459d5811924cc4451057a2758d57c45cd34b136d013b2
Archivo: taller-diego-v1.2.0.zip (10.9 MB)
```

Adicionalmente se creó el `Dockerfile` del backend para el empaquetado como imagen de contenedor con la misma etiqueta (`docker build -t ghcr.io/esis-devteam/taller-diego:v1.2.0 .`), referenciada en los manifiestos de despliegue.

> 📷 **EVIDENCIA 3:** Captura de la terminal con `git tag -v v1.2.0` mostrando "Good signature".

`[PEGAR CAPTURA AQUÍ]`

> 📷 **EVIDENCIA 4:** Captura del artefacto `dist/taller-diego-v1.2.0.zip` con su digest SHA-256 y/o de la etiqueta publicada en GitHub (pestaña *Tags/Releases*).

`[PEGAR CAPTURA AQUÍ]`

---

## (e) Pipeline GitOps — ArgoCD apuntando a la etiqueta

El estado deseado del despliegue quedó **declarado en el propio repositorio** (Git como única fuente de verdad):

- `deploy/argocd/application.yaml` — el `Application` de ArgoCD con `targetRevision: v1.2.0` (**siempre una etiqueta firmada, nunca una rama móvil**) y sincronización manual explícita para que cada promoción quede auditada.
- `deploy/k8s/deployment.yaml` — el Deployment con la imagen `ghcr.io/esis-devteam/taller-diego:v1.2.0` (misma versión que el tag Git, nunca `:latest`).

**Comandos del pipeline:**

```bash
kubectl apply -f deploy/argocd/application.yaml
argocd app sync taller-diego
argocd app get taller-diego     # → Sync Status: Synced · Health Status: Healthy
```

> 📷 **EVIDENCIA 5:** Captura del dashboard de ArgoCD con la aplicación `taller-diego` en estado **Synced** y **Healthy**, apuntando a `v1.2.0`.

`[PEGAR CAPTURA AQUÍ]`

---

## (f) Simulación del breaking change y rollback determinista

**1. El error deliberado.** En la rama `feature/breaking-change-endpoint` se cambió la firma de la respuesta de `GET /api/v1/productos`: el campo `precioVenta` se renombró a `precio_venta`. Se integró a `main` y se publicó como **`v1.2.1` (PATCH)** — clasificación errónea, pues era un breaking change que exigía `v2.0.0`.

**2. Impacto sobre los consumidores.** El frontend (consumidor de la API) lee `producto.precioVenta` en el inventario, el modal de edición, la venta de productos y el PDF de códigos de barras. Con el campo renombrado, todos reciben `undefined`: precios vacíos o `NaN` en toda la aplicación, **sin ningún error visible en el despliegue** — el daño es silencioso, exactamente lo que la semántica del número debía advertir. Quien vio "PATCH" actualizó confiado y quedó roto.

**3. Rollback determinista.**

```bash
argocd app rollback taller-diego          # el clúster vuelve al release anterior
git revert -m 1 cb759fa                   # se revierte el merge en Git (preserva historial)
git tag -s v1.2.1-revert -m "rollback: ..."
```

**4. Verificación:** `git diff v1.2.0 HEAD -- backend/schemas/producto_schema.py` → **sin diferencias**: el código volvió *exactamente* al estado auditado de `v1.2.0`. En ArgoCD el estado vuelve a **Synced**.

**Trazabilidad Git completa (salida real de `git log --oneline --graph`):**

```
* 5fc353b Revert "Merge feature/breaking-change-endpoint (error deliberado: breaking change sin MAJOR)"
*   cb759fa Merge feature/breaking-change-endpoint (error deliberado: breaking change sin MAJOR)
|\
| * 36ccccf refactor: renombrar precioVenta a precio_venta en respuesta de productos
|/
* 8fb50a6 feat: pipeline GitOps semana 13 - política SemVer, dependency pinning y manifiestos de despliegue
```

**Cadena de trazabilidad del incidente:**

| Elemento | Identificador |
|---|---|
| Commit del breaking change | `36ccccf` |
| Merge a main (error) | `cb759fa` |
| Tag mal clasificado | `v1.2.1` (firmado) |
| Commit del revert | `5fc353b` |
| Tag del rollback | `v1.2.1-revert` (firmado) |
| Release estable de referencia | `v1.2.0` · digest `f876d010…13b2` |

> 📷 **EVIDENCIA 6:** Captura del `git log --oneline --graph` con el merge y el revert, y/o del rollback en ArgoCD volviendo a **Synced**.

`[PEGAR CAPTURA AQUÍ]`

---

## Conclusión

El repositorio quedó convertido en el punto único de gobierno de las entregas: la **política SemVer** define qué comunica cada número; el **pinning + lockfile** garantiza que el build de hoy es el mismo que el auditado; la **etiqueta firmada** (`git tag -s`, verificada con "Good signature") es la línea base de entrega bajo IEEE 828-2012; el **artefacto versionado con digest** asegura que lo desplegado es exactamente lo declarado; y ArgoCD **reconcilia el clúster contra la etiqueta**, de modo que un release defectuoso se corrige con un rollback determinista y trazable — nunca tocando producción a mano. La simulación demostró que romper la semántica del número (publicar un breaking change como PATCH) daña silenciosamente a los consumidores, y que la gobernanza GitOps permite detectarlo, revertirlo y auditarlo por completo.
