"""
Rutas API para operaciones de Ventas.

Este módulo define los endpoints REST para crear, leer y eliminar ventas.
Proporciona funcionalidad de búsqueda por ID y por fecha, incluyendo
gestión de transacciones y control de stock.

Las rutas siguen el patrón RESTful:
- POST /: Crear nueva venta
- GET /: Listar todas las ventas
- GET /{id}: Obtener venta por ID
- GET /fecha/{fecha}: Buscar ventas por fecha
- DELETE /{id}: Eliminar venta

:author: Backend Team
:version: 1.0
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import SessionLocal
from schemas.venta_schema import VentaCreate, VentaResponse
from services.venta_service import VentaService

router = APIRouter(tags=["Ventas"])


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


def get_venta_service(db: Session = Depends(get_db)) -> VentaService:
    """
    Función de dependencia que proporciona el servicio de ventas.
    
    Inyecta la sesión de base de datos en el servicio de ventas
    para que este pueda acceder a los datos.
    
    :param db: Sesión de base de datos inyectada
    :type db: Session
    :returns: Instancia del servicio de ventas
    :rtype: VentaService
    """
    return VentaService(db)


@router.post("/", response_model=VentaResponse)
def create_venta(
    data: VentaCreate,
    service: VentaService = Depends(get_venta_service)
):
    """
    Crea una nueva venta.
    
    Soporta la creación de ventas simples o complejas (con productos asociados
    y control de stock). El servicio maneja la lógica de transacciones.
    
    :param data: Datos de la venta a crear
    :type data: VentaCreate
    :param service: Servicio de ventas inyectado
    :type service: VentaService
    :returns: Venta creada
    :rtype: VentaResponse
    :raises HTTPException: Si hay error de validación o stock insuficiente (400)
    """
    return service.create_venta(data)


@router.get("/", response_model=list[VentaResponse])
def list_ventas(
    service: VentaService = Depends(get_venta_service)
):
    """
    Lista todas las ventas registradas.
    
    :param service: Servicio de ventas inyectado
    :type service: VentaService
    :returns: Lista de todas las ventas
    :rtype: list[VentaResponse]
    """
    return service.list_ventas()


@router.get("/{id}", response_model=VentaResponse)
def get_venta_by_id(id: int, service: VentaService = Depends(get_venta_service)):
    """
    Obtiene una venta específica por su ID.
    
    :param id: Identificador de la venta
    :type id: int
    :param service: Servicio de ventas inyectado
    :type service: VentaService
    :returns: Venta encontrada
    :rtype: VentaResponse
    :raises HTTPException: Si la venta no existe (404)
    """
    venta = service.get_by_id(id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta not found")
    return venta


@router.get("/fecha/{fecha}", response_model=list[VentaResponse])
def get_ventas_by_fecha(fecha: datetime, service: VentaService = Depends(get_venta_service)):
    """
    Busca ventas realizadas en una fecha específica.
    
    :param fecha: Fecha para filtrar ventas
    :type fecha: datetime
    :param service: Servicio de ventas inyectado
    :type service: VentaService
    :returns: Lista de ventas realizadas en esa fecha
    :rtype: list[VentaResponse]
    """
    return service.get_by_fecha(fecha)


@router.delete("/{id}")
def delete_venta(id: int, service: VentaService = Depends(get_venta_service)):
    """
    Elimina una venta existente.
    
    :param id: Identificador de la venta a eliminar
    :type id: int
    :param service: Servicio de ventas inyectado
    :type service: VentaService
    :returns: Mensaje de confirmación de eliminación
    :rtype: dict
    :raises HTTPException: Si la venta no existe (404)
    """
    result = service.delete_venta(id)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {"detail": "Venta eliminada"}
