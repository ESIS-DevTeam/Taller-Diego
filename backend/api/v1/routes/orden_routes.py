"""
Rutas API para operaciones de Órdenes.

Este módulo define los endpoints REST para crear, leer y eliminar órdenes
de servicio. Proporciona funcionalidad de búsqueda por ID y por fecha.

Las rutas siguen el patrón RESTful:
- POST /: Crear nueva orden
- GET /: Listar todas las órdenes
- GET /{id}: Obtener orden por ID
- GET /fecha/{fecha}: Buscar órdenes por fecha
- DELETE /{id}: Eliminar orden

:author: Backend Team
:version: 1.0
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.orden_schema import OrdenCreate, OrdenResponse
from services.orden_service import OrdenService
from datetime import date

router = APIRouter(tags=["Ordenes"])


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


def get_orden_service(db: Session = Depends(get_db)) -> OrdenService:
    """
    Función de dependencia que proporciona el servicio de órdenes.
    
    Inyecta la sesión de base de datos en el servicio de órdenes
    para que este pueda acceder a los datos.
    
    :param db: Sesión de base de datos inyectada
    :type db: Session
    :returns: Instancia del servicio de órdenes
    :rtype: OrdenService
    """
    return OrdenService(db)


@router.post("/", response_model=OrdenResponse)
def create_orden(
    data: OrdenCreate,
    service: OrdenService = Depends(get_orden_service)
):
    """
    Crea una nueva orden de servicio.
    
    Soporta la creación de órdenes simples o complejas (con servicios
    y empleados asociados). El servicio maneja la lógica de transacciones.
    
    :param data: Datos de la orden a crear
    :type data: OrdenCreate
    :param service: Servicio de órdenes inyectado
    :type service: OrdenService
    :returns: Orden creada
    :rtype: OrdenResponse
    :raises HTTPException: Si hay error de validación (400)
    """
    return service.create_orden(data)


@router.get("/", response_model=list[OrdenResponse])
def list_ordens(
    service: OrdenService = Depends(get_orden_service)
):
    """
    Lista todas las órdenes registradas.
    
    :param service: Servicio de órdenes inyectado
    :type service: OrdenService
    :returns: Lista de todas las órdenes
    :rtype: list[OrdenResponse]
    """
    return service.list_ordens()


@router.get("/{id}", response_model=OrdenResponse)
def get_orden_by_id(id: int, service: OrdenService = Depends(get_orden_service)):
    """
    Obtiene una orden específica por su ID.
    
    :param id: Identificador de la orden
    :type id: int
    :param service: Servicio de órdenes inyectado
    :type service: OrdenService
    :returns: Orden encontrada
    :rtype: OrdenResponse
    :raises HTTPException: Si la orden no existe (404)
    """
    orden = service.get_by_id(id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden


@router.get("/fecha/{fecha}", response_model=list[OrdenResponse])
def get_ordens_by_fecha(fecha: date, service: OrdenService = Depends(get_orden_service)):
    """
    Busca órdenes creadas en una fecha específica.
    
    :param fecha: Fecha para filtrar órdenes
    :type fecha: date
    :param service: Servicio de órdenes inyectado
    :type service: OrdenService
    :returns: Lista de órdenes creadas en esa fecha
    :rtype: list[OrdenResponse]
    """
    return service.get_by_fecha(fecha)


@router.delete("/{id}")
def delete_orden(id: int, service: OrdenService = Depends(get_orden_service)):
    """
    Elimina una orden existente.
    
    :param id: Identificador de la orden a eliminar
    :type id: int
    :param service: Servicio de órdenes inyectado
    :type service: OrdenService
    :returns: Mensaje de confirmación de eliminación
    :rtype: dict
    :raises HTTPException: Si la orden no existe (404)
    """
    result = service.delete_orden(id)
    if not result:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return {"detail": "Orden eliminada"}
