"""Rutas API para Venta.

Define los endpoints para operaciones CRUD de Venta.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import SessionLocal
from schemas.venta_schema import VentaCreate, VentaResponse
from services.venta_service import VentaService

router = APIRouter(tags=["Ventas"])


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


def get_venta_service(db: Session = Depends(get_db)) -> VentaService:
    """Proporciona una instancia del servicio de Venta.

    Dependencia para inyección del servicio.

    :param db: Sesión de BD inyectada.
    :returns: Instancia de VentaService.
    """

    return VentaService(db)


@router.post("/", response_model=VentaResponse)
def create_venta(
    data: VentaCreate,
    service: VentaService = Depends(get_venta_service)
):
    """Crea una nueva venta.

    :param data: Payload con datos de la venta y productos.
    :param service: Servicio de Venta inyectado.
    :returns: VentaResponse con la venta creada.
    :raises HTTPException: 400 si hay errores de stock, 422 si validación falla.
    """

    return service.create_venta(data)


@router.get("/", response_model=list[VentaResponse])
def list_ventas(
    service: VentaService = Depends(get_venta_service)
):
    """Obtiene todas las ventas.

    :param service: Servicio de Venta inyectado.
    :returns: Lista de VentaResponse.
    """

    return service.list_ventas()


@router.get("/{id}", response_model=VentaResponse)
def get_venta_by_id(id: int, service: VentaService = Depends(get_venta_service)):
    """Obtiene una venta por su identificador.

    :param id: Identificador de la venta.
    :param service: Servicio de Venta inyectado.
    :returns: VentaResponse con la venta.
    :raises HTTPException: 404 si la venta no existe.
    """

    venta = service.get_by_id(id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta not found")
    return venta


@router.get("/fecha/{fecha}", response_model=list[VentaResponse])
def get_ventas_by_fecha(fecha: datetime, service: VentaService = Depends(get_venta_service)):
    """Obtiene ventas por fecha.

    :param fecha: Fecha a consultar.
    :param service: Servicio de Venta inyectado.
    :returns: Lista de VentaResponse de esa fecha.
    """

    return service.get_by_fecha(fecha)


@router.delete("/{id}")
def delete_venta(id: int, service: VentaService = Depends(get_venta_service)):
    """Elimina una venta.

    :param id: Identificador de la venta a eliminar.
    :param service: Servicio de Venta inyectado.
    :returns: Mensaje de confirmación.
    :raises HTTPException: 404 si la venta no existe.
    """

    result = service.delete_venta(id)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {"detail": "Venta eliminada"}
