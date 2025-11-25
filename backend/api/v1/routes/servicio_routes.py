"""Rutas API para gestión de servicios.

Define los endpoints REST para operaciones CRUD de servicios.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.servicio_schema import ServicioCreate, ServicioResponse
from services.servicio_service import ServicioService

router = APIRouter(tags=["Servicios"])

def get_db():
    """Obtiene una sesión de base de datos.

    :yields: Sesión de SQLAlchemy.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_servicio_service(db: Session = Depends(get_db)) -> ServicioService:
    """Obtiene una instancia del servicio de servicios.

    :param db: Sesión de base de datos.
    :returns: Instancia de ServicioService.
    """

    return ServicioService(db)

@router.post("/", response_model=ServicioResponse)
def create_servicio(
    data: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    """Crea un nuevo servicio.

    :param data: Datos del servicio a crear.
    :param service: Instancia del servicio de servicios.
    :returns: Servicio creado.
    :raises HTTPException: Si la creación falla.
    """

    return service.create_servicio(data)

@router.get("/", response_model=list[ServicioResponse])
def list_servicios(
    service: ServicioService = Depends(get_servicio_service)
):
    """Obtiene todos los servicios.

    :param service: Instancia del servicio de servicios.
    :returns: Lista de servicios.
    """

    return service.list_servicios()

@router.get("/{id}", response_model=ServicioResponse)
def get_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
    """Obtiene un servicio por su identificador.

    :param id: Identificador del servicio.
    :param service: Instancia del servicio de servicios.
    :returns: Servicio solicitado.
    :raises HTTPException: Si el servicio no existe (404).
    """

    servicio = service.get_by_id(id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio

@router.put("/{id}", response_model=ServicioResponse)
def update_servicio(
    id: int,
    data: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    """Actualiza un servicio existente.

    :param id: Identificador del servicio a actualizar.
    :param data: Nuevos datos del servicio.
    :param service: Instancia del servicio de servicios.
    :returns: Servicio actualizado.
    :raises HTTPException: Si el servicio no existe (404).
    """

    servicio = service.update_servicio(id, data)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio

@router.delete("/{id}")
def delete_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
    """Elimina un servicio.

    :param id: Identificador del servicio a eliminar.
    :param service: Instancia del servicio de servicios.
    :returns: Mensaje de confirmación.
    :raises HTTPException: Si el servicio no existe (404).
    """

    servicio = service.delete_servicio(id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"detail": "Servicio eliminado"}