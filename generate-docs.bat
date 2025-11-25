@echo off
REM Script para generar documentación con Sphinx

cd /d "%~dp0docs"

echo.
echo ====================================
echo Generando documentacion con Sphinx
echo ====================================
echo.

REM Verificar si sphinx-build está disponible
where sphinx-build >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: sphinx-build no encontrado
    echo Instálalo con: pip install sphinx sphinx-rtd-theme
    pause
    exit /b 1
)

REM Limpiar build anterior
if exist _build (
    rmdir /s /q _build
    echo Carpeta _build limpiada
)

REM Generar documentación HTML
echo.
echo Generando HTML...
sphinx-build -b html . _build/html

if %ERRORLEVEL% EQ 0 (
    echo.
    echo ====================================
    echo Documentacion generada exitosamente
    echo ====================================
    echo.
    echo Abre: docs\_build\html\index.html
    echo.
    
    REM Abrir en navegador (opcional)
    REM start _build\html\index.html
) else (
    echo.
    echo Error durante la generacion
    pause
    exit /b 1
)

pause
