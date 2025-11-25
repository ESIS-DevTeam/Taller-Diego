# Documentación del Backend - Taller Diego

Esta carpeta contiene la configuración de **Sphinx** para generar documentación HTML a partir de los docstrings del código.

## 📖 Cómo Generar la Documentación

### Opción 1: Con el Script (Recomendado)

**Windows:**
```bash
cd c:\Users\LEGION\Desktop\Taller-Diego
./generate-docs.bat
```

**Linux/Mac:**
```bash
cd /path/to/Taller-Diego
./generate-docs.sh
chmod +x generate-docs.sh  # Hacer ejecutable (primera vez)
```

### Opción 2: Manual con Sphinx

```bash
cd docs
sphinx-build -b html . _build/html
```

## 📂 Estructura de Archivos

```
docs/
├── conf.py              # Configuración de Sphinx
├── index.rst            # Página principal
├── intro.rst            # Introducción
├── architecture.rst     # Documentación de arquitectura
├── modules/             # Módulos del backend
│   ├── models.rst
│   ├── schemas.rst
│   ├── repositories.rst
│   ├── services.rst
│   └── routes.rst
└── _build/              # Documentación generada (HTML)
    └── html/
        └── index.html   # Abrir en navegador
```

## 🚀 Usando la Documentación

Una vez generada, abre en tu navegador:

```
docs/_build/html/index.html
```

La documentación incluye:

- ✅ Descripción de todos los módulos
- ✅ Docstrings auto-extraídos del código
- ✅ Diagramas de arquitectura
- ✅ Guías de uso
- ✅ Referencia de APIs

## 📋 Requisitos

Sphinx está incluido en `requirements.txt`:

```bash
pip install -r ../requirements.txt
```

O instálalo manualmente:

```bash
pip install sphinx sphinx-rtd-theme
```

## 🎨 Tema

Se usa **sphinx-rtd-theme** (Read the Docs theme) que proporciona:

- Diseño moderno y responsive
- Navegación intuitiva
- Búsqueda completa
- Modo oscuro/claro

## 🔧 Configuración

El archivo `conf.py` contiene:

- Extensiones de Sphinx
- Configuración del tema
- Rutas de módulos
- Opciones de autodoc

### Extensiones habilitadas:

- `sphinx.ext.autodoc` - Auto-documentación desde docstrings
- `sphinx.ext.napoleon` - Soporte para docstrings en formato NumPy/Google
- `sphinx.ext.viewcode` - Enlaces a código fuente
- `sphinx.ext.intersphinx` - Enlaces a documentación externa

## 📝 Actualizar Documentación

Si modificas docstrings en el código:

1. Regenera la documentación:
   ```bash
   generate-docs.bat  # Windows
   ./generate-docs.sh  # Linux/Mac
   ```

2. Abre `docs/_build/html/index.html`

Los cambios se reflejarán automáticamente.

## 💡 Tips

- Los docstrings deben seguir el formato PEP 257/Sphinx
- Usa `:param` y `:returns` en docstrings de funciones
- Usa `:ivar` para atributos de clase
- Los ejemplos en docstrings se mostrarán en la documentación

## 🔗 Enlaces Útiles

- [Sphinx Documentation](https://www.sphinx-doc.org/)
- [PEP 257 - Docstring Conventions](https://peps.python.org/pep-0257/)
- [Napoleon Extension](https://www.sphinx-doc.org/en/master/usage/extensions/napoleon.html)
- [Read the Docs Theme](https://sphinx-rtd-theme.readthedocs.io/)

---

Generado con ❤️ por el equipo de Backend - ESIS-DevTeam
