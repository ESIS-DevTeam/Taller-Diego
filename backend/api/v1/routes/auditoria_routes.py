from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from db.base import SessionLocal
from schemas.auditoria_schema import AuditoriaResponse, AuditoriaFilter
from services.auditoria_service import AuditoriaService

router = APIRouter(prefix="/auditoria", tags=["Auditoría"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=dict)
def obtener_auditoria(
    modulo: Optional[str] = Query(None, description="Filtrar por módulo (producto, servicio, venta)"),
    accion: Optional[str] = Query(None, description="Filtrar por acción (CREATE, UPDATE, DELETE)"),
    tabla: Optional[str] = Query(None, description="Filtrar por tabla"),
    usuario: Optional[str] = Query(None, description="Filtrar por usuario"),
    registro_id: Optional[int] = Query(None, description="Filtrar por ID de registro"),
    fecha_inicio: Optional[datetime] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[datetime] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    """
    Obtener registros de auditoría con filtros opcionales
    
    Permite filtrar por:
    - Módulo (producto, servicio, venta)
    - Acción (CREATE, UPDATE, DELETE)
    - Tabla
    - Usuario
    - ID de registro
    - Rango de fechas
    """
    filtro = AuditoriaFilter(
        modulo=modulo,
        accion=accion,
        tabla=tabla,
        usuario=usuario,
        registro_id=registro_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin
    )
    
    return AuditoriaService.obtener_por_filtro(db, filtro, skip, limit)

@router.get("/historial/{tabla}/{registro_id}", response_model=List[AuditoriaResponse])
def obtener_historial_registro(
    tabla: str,
    registro_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener el historial completo de cambios de un registro específico
    
    Ejemplo: /auditoria/historial/productos/123
    """
    return AuditoriaService.obtener_historial(db, tabla, registro_id)

@router.get("/usuario/{usuario}", response_model=List[AuditoriaResponse])
def obtener_acciones_usuario(
    usuario: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Obtener todas las acciones realizadas por un usuario específico
    """
    return AuditoriaService.obtener_acciones_usuario(db, usuario, skip, limit)

@router.get("/modulo/{modulo}", response_model=dict)
def obtener_auditoria_modulo(
    modulo: str,
    accion: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Obtener auditoría de un módulo específico (producto, servicio, venta)
    """
    filtro = AuditoriaFilter(modulo=modulo, accion=accion)
    return AuditoriaService.obtener_por_filtro(db, filtro, skip, limit)
