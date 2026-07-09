# 🧑‍🔧 Sistema Taller de Diego

Proyecto de sistema desarrollado con **FastAPI**.

---

## 📌 Funcionalidades principales

- Registro e historial de servicios
- Listado, actualización y eliminación de productos.
- Gestión y asignación de empleados.

---

## 🚀 Tecnologías

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy
- Pydantic v2
- SQLite

### Frontend
- HTML 5
- CSS 3
- JavaScript
- TailwindCSS

---

## ⚙️ Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/ESIS-DevTeam/Taller-Diego.git
cd Taller-Diego
```
2. Crea y activa un entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate           # Windows
source venv/bin/activate        # Linux/Mac
```
4. Instala las dependencias:
```bash
pip install -r requirements.txt
```
5. Cambia el path de python a backend
```bash
$env:PYTHONPATH = "backend"
```
6. Crea el archivo `.env` en la carpeta `backend` con la conexión a Supabase
```env
DATABASE_URL="<link>"
SUPABASE_URL="<link>"
SUPABASE_ANON_KEY="<ANON PUBLIC KEY>>"
JWT_SECRET="<SECRET KEY ES256>"
```
7. Ejecuta el script para crear las tablas
```bash
python .\backend\database.py
```
8. Corre el servidor:
```bash
uvicorn main:app --reload
```
### 🗂️ Estructura del proyecto

```plaintext
app/
├── backend/
│   ├── api/                  # Rutas FastAPI organizadas por versión
│   │   └── v1/
│   │       └── routes/
│   │           └── producto_routes.py
│   │
│   ├── core/                 # Configuración central (env, settings, etc.)
│   │   └── config.py
│   │
│   ├── db/                   # Conexión y modelos de base de datos
│   │   ├── base.py
│   │   └── models/
│   │       └── producto.py
│   │
│   ├── schemas/              # Esquemas Pydantic (validación y serialización)
│   │   └── producto_schema.py
│   │
│   ├── repositories/         # Repositorios: acceso y persistencia de datos
│   │   └── producto_repo.py
│   │
│   └── services/             # Servicios: lógica de negocio
│       └── producto_service.py
│
├── frontend/
│   ├── assets/               # Recursos, imagenes, iconos, fuentes
│   ├── views/                # Archivos HTML o plantillas
│   │   └── index.html        # Archivo de ejemplo principal
│   ├── styles/               # Archivos CSS
│   └── scripts/              # Archivos JavaScript
│
├── main.py                   # Punto de entrada principal de la app
├── requirements.txt          # Dependencias de Python
└── README.md                 # Documentación del proyecto
```
---

## Política de Versionamiento (SemVer 2.0.0)

Este proyecto sigue **Semantic Versioning 2.0.0** (Preston-Werner, 2013). La versión se expresa como `vMAJOR.MINOR.PATCH` y cada segmento comunica a los consumidores de la API (`/api/v1`) qué clase de cambio se introdujo.

- **MAJOR** (`vX.0.0`): cualquier cambio **incompatible** en la API pública del backend.
  *Ejemplo:* renombrar o eliminar un campo de la respuesta de `GET /api/v1/productos` (p. ej. `precioVenta` → `precio_venta`), cambiar el tipo de un campo, o eliminar un endpoint. El frontend y cualquier consumidor deben adaptar su código antes de actualizar.
- **MINOR** (`v0.X.0`): funcionalidad **nueva y retrocompatible**.
  *Ejemplo:* agregar el módulo CAJA con sus endpoints `GET /api/v1/caja/cierre`, `/notas`, `/deudores` sin alterar los endpoints existentes. Los consumidores pueden actualizar sin riesgo.
- **PATCH** (`v0.0.X`): **corrección retrocompatible** de errores, sin cambiar la interfaz pública.
  *Ejemplo:* validar el nombre duplicado al editar un producto (`PUT /api/v1/productos/{id}` ahora responde `400` ante duplicado); la firma del endpoint no cambia.
- **Pre-release** (`vX.Y.Z-rc.1`): versiones de validación previas a un release oficial. No se despliegan a producción; sirven para pruebas de integración.

### Clasificación de los cambios del sprint

| Cambio | Tipo | Justificación |
|---|---|---|
| Rediseño del dashboard de Inicio con KPIs reales (`/caja/cierre`, `/ordenes-trabajo`, `/caja/deudores`, `/caja/notas`) | **MINOR** | Funcionalidad nueva retrocompatible: no altera ningún endpoint existente. |
| Validación de nombre duplicado al editar producto/autoparte (HTTP 400) | **PATCH** | Corrección de un defecto (antes permitía duplicados); interfaz pública sin cambios. |
| Renombrar campos de la respuesta de `GET /api/v1/productos` | **MAJOR** | Breaking change: los consumidores dejan de encontrar los campos originales. |

### Proceso de Release

1. Clasificar el cambio según la política anterior y acordar `vX.Y.Z`.
2. Crear la etiqueta firmada: `git tag -s vX.Y.Z -m "descripción del release"`.
3. Verificar la firma: `git tag -v vX.Y.Z`.
4. Publicar: `git push origin vX.Y.Z`.
5. Sincronizar el despliegue declarativo: `argocd app sync taller-diego`.
6. Ante un release defectuoso: `argocd app rollback taller-diego` + `git revert` (nunca modificar el clúster a mano).
