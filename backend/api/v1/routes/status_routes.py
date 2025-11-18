from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.base import SessionLocal
from datetime import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def health_check(db: Session = Depends(get_db)):
    """
    Hola Mundo Arquitectónico - Valida el flujo completo:
    Frontend → Backend → Base de Datos → Backend → Frontend
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
