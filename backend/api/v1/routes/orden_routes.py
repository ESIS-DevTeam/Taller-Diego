"""Rutas API para Orden.

Define los endpoints para operaciones CRUD de Orden.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.orden_schema import OrdenCreate, OrdenResponse
from services.orden_service import OrdenService
from datetime import date

router = APIRouter(tags=["Ordenes"])

def get_db():
    """Proporciona una sesión de BD.

    Dependencia para inyección de sesión de SQLAlchemy.

    :yields: Sesión de BD.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_orden_service(db: Session = Depends(get_db)) -> OrdenService:
    """Proporciona una instancia del servicio de Orden.

    Dependencia para inyección del servicio.

    :param db: Sesión de BD inyectada.
    :returns: Instancia de OrdenService.
    """

    return OrdenService(db)

@router.post("/", response_model=OrdenResponse)
def create_orden(
    data: OrdenCreate,
    service: OrdenService = Depends(get_orden_service)
):
    """Crea una nueva orden.

    :param data: Payload con datos de la orden, servicios y empleados.
    :param service: Servicio de Orden inyectado.
    :returns: OrdenResponse con la orden creada.
    :raises HTTPException: 400 si hay errores de validación, 422 si falla validación.
    """

    return service.create_orden(data)

@router.get("/", response_model=list[OrdenResponse])
def list_ordens(
    service: OrdenService = Depends(get_orden_service)
):
    """Obtiene todas las órdenes.

    :param service: Servicio de Orden inyectado.
    :returns: Lista de OrdenResponse.
    """

    return service.list_ordens()

@router.get("/{id}", response_model=OrdenResponse)
def get_orden_by_id(id: int, service: OrdenService = Depends(get_orden_service)):
    """Obtiene una orden por su identificador.

    :param id: Identificador de la orden.
    :param service: Servicio de Orden inyectado.
    :returns: OrdenResponse con la orden.
    :raises HTTPException: 404 si la orden no existe.
    """

    orden = service.get_by_id(id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden

@router.get("/fecha/{fecha}", response_model=list[OrdenResponse])
def get_ordens_by_fecha(fecha: date, service: OrdenService = Depends(get_orden_service)):
    """Obtiene órdenes por fecha.

    :param fecha: Fecha a consultar.
    :param service: Servicio de Orden inyectado.
    :returns: Lista de OrdenResponse de esa fecha.
    """

    return service.get_by_fecha(fecha)

@router.delete("/{id}")
def delete_orden(id: int, service: OrdenService = Depends(get_orden_service)):
    """Elimina una orden.

    :param id: Identificador de la orden a eliminar.
    :param service: Servicio de Orden inyectado.
    :returns: Mensaje de confirmación.
    :raises HTTPException: 404 si la orden no existe.
    """

    result = service.delete_orden(id)
    if not result:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return {"detail": "Orden eliminada"}
