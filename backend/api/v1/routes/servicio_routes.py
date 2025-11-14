"""Rutas API para Servicio.

Define los endpoints para operaciones CRUD de Servicio.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.servicio_schema import ServicioCreate, ServicioResponse
from services.servicio_service import ServicioService

router = APIRouter(tags=["Servicios"])

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

def get_servicio_service(db: Session = Depends(get_db)) -> ServicioService:
    """Proporciona una instancia del servicio de Servicio.

    Dependencia para inyección del servicio.

    :param db: Sesión de BD inyectada.
    :returns: Instancia de ServicioService.
    """

    return ServicioService(db)

@router.post("/", response_model=ServicioResponse)
def create_servicio(
    data: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    """Crea un nuevo servicio.

    :param data: Payload con datos del servicio.
    :param service: Servicio de Servicio inyectado.
    :returns: ServicioResponse con el servicio creado.
    :raises HTTPException: 409 si el servicio ya existe, 422 si validación falla.
    """

    return service.create_servicio(data)

@router.get("/", response_model=list[ServicioResponse])
def list_servicios(
    service: ServicioService = Depends(get_servicio_service)
):
    """Obtiene todos los servicios.

    :param service: Servicio de Servicio inyectado.
    :returns: Lista de ServicioResponse.
    """

    return service.list_servicios()

@router.get("/{id}", response_model=ServicioResponse)
def get_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
    """Obtiene un servicio por su identificador.

    :param id: Identificador del servicio.
    :param service: Servicio de Servicio inyectado.
    :returns: ServicioResponse con el servicio.
    :raises HTTPException: 404 si el servicio no existe.
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
    :param data: Payload con nuevos datos.
    :param service: Servicio de Servicio inyectado.
    :returns: ServicioResponse con el servicio actualizado.
    :raises HTTPException: 404 si el servicio no existe, 422 si validación falla.
    """

    servicio = service.update_servicio(id, data)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio

@router.delete("/{id}")
def delete_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
    """Elimina un servicio.

    :param id: Identificador del servicio a eliminar.
    :param service: Servicio de Servicio inyectado.
    :returns: Mensaje de confirmación.
    :raises HTTPException: 404 si el servicio no existe.
    """

    servicio = service.delete_servicio(id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"detail": "Servicio eliminado"}