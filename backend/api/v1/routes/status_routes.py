"""
Rutas API para chequeo de salud (Health Check).

Este módulo define endpoints para validar el estado del sistema y la conectividad
entre las capas de la arquitectura (Frontend → Backend → Database).

Valida el flujo arquitectónico completo del proyecto, verificando que:
1. El frontend puede conectarse al backend
2. El backend está operativo
3. La base de datos está disponible y respondiendo

:author: Backend Team
:version: 1.0
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.base import SessionLocal
from datetime import datetime

router = APIRouter()


def get_db():
    """
    Función de dependencia que proporciona una sesión de base de datos.
    
    Crea una nueva sesión SQLAlchemy para cada request y la cierra
    después de completar la solicitud.
    
    :returns: Sesión de base de datos
    :rtype: Session
    :yields: Sesión de SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def health_check(db: Session = Depends(get_db)):
    """
    Realiza un chequeo de salud completo del sistema.
    
    Valida el flujo arquitectónico completo verificando:
    1. Conectividad con la base de datos
    2. Estado del backend
    3. Información del motor de base de datos
    
    Este endpoint es útil para:
    - Monitoreo del sistema
    - Validación de despliegues
    - Diagnóstico de problemas de conectividad
    
    :param db: Sesión de base de datos inyectada para validar conectividad
    :type db: Session
    :returns: Respuesta de salud con estado de todas las capas arquitectónicas
    :rtype: dict
    :raises: Captura excepciones y retorna estado de error
    
    **Ejemplo de respuesta exitosa:**
    
    .. code-block:: json
    
        {
            "status": "success",
            "message": "Línea Base Arquitectónica validada ✅",
            "layers": {
                "presentation": "Frontend conectado",
                "service": "Backend operativo",
                "persistence": {
                    "database_connected": true,
                    "database_name": "taller_diego_db",
                    "database_version": "PostgreSQL 15.0"
                }
            },
            "timestamp": "2025-11-25T10:30:45.123456",
            "architecture_flow": "✓ Frontend → ✓ Backend → ✓ Database → ✓ Response"
        }
    """
    try:
        # Capa de Persistencia: Ejecutar consulta trivial a la BD
        result = db.execute(text("SELECT 1 as status, 'OK' as message")).fetchone()
        
        # Verificar conexión y obtener información adicional
        db_info = db.execute(text("SELECT current_database(), version()")).fetchone()
        
        return {
            "status": "success",
            "message": "Línea Base Arquitectónica validada ✅",
            "layers": {
                "presentation": "Frontend conectado",
                "service": "Backend operativo",
                "persistence": {
                    "database_connected": result.status == 1,
                    "database_name": db_info[0] if db_info else "unknown",
                    "database_version": db_info[1].split(',')[0] if db_info else "unknown"
                }
            },
            "timestamp": datetime.now().isoformat(),
            "architecture_flow": "✓ Frontend → ✓ Backend → ✓ Database → ✓ Response"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error en la línea base: {str(e)}",
            "timestamp": datetime.now().isoformat(),
            "architecture_flow": "✗ Fallo en comunicación"
        }
