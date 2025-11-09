"""
Rutas de API para gestión de servicios.

Define los endpoints REST para operaciones CRUD de servicios.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.servicio_schema import ServicioCreate, ServicioUpdate, ServicioResponse
from services.servicio_service import ServicioService

router = APIRouter(tags=["Servicios"])


def get_db():
    """
    Genera una sesión de base de datos.
    
    Yields:
        Session: Sesión de SQLAlchemy que se cierra automáticamente
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_servicio_service(db: Session = Depends(get_db)) -> ServicioService:
    """
    Crea una instancia del servicio de servicios.
    
    Args:
        db: Sesión de base de datos inyectada
        
    Returns:
        ServicioService: Instancia del servicio
    """
    return ServicioService(db)


@router.post("/servicios", response_model=ServicioResponse, status_code=status.HTTP_201_CREATED)
def create_servicio(
    servicio: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    """
    Crea un nuevo servicio.
    
    Args:
        servicio: Datos del servicio a crear
        service: Servicio inyectado
        
    Returns:
        ServicioResponse: Servicio creado con ID
        
    Raises:
        HTTPException 400: Si ya existe un servicio con ese nombre
    """
    try:
        return service.create_servicio(servicio)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/servicios", response_model=list[ServicioResponse])
def list_servicios(service: ServicioService = Depends(get_servicio_service)):
    """
    Obtiene todos los servicios.
    
    Args:
        service: Servicio inyectado
        
    Returns:
        list[ServicioResponse]: Lista de todos los servicios
    """
    return service.list_servicios()


@router.get("/servicios/{servicio_id}", response_model=ServicioResponse)
def get_servicio(
    servicio_id: int,
    service: ServicioService = Depends(get_servicio_service)
):
    """
    Obtiene un servicio por su ID.
    
    Args:
        servicio_id: ID del servicio
        service: Servicio inyectado
        
    Returns:
        ServicioResponse: Servicio encontrado
        
    Raises:
        HTTPException 404: Si el servicio no existe
    """
    try:
        return service.get_by_id(servicio_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/servicios/{servicio_id}", response_model=ServicioResponse)
def update_servicio(
    servicio_id: int,
    servicio: ServicioUpdate,
    service: ServicioService = Depends(get_servicio_service)
):
    """
    Actualiza un servicio existente.
    
    Args:
        servicio_id: ID del servicio a actualizar
        servicio: Nuevos datos del servicio
        service: Servicio inyectado
        
    Returns:
        ServicioResponse: Servicio actualizado
        
    Raises:
        HTTPException 404: Si el servicio no existe
        HTTPException 400: Si el nombre está duplicado
    """
    try:
        return service.update_servicio(servicio_id, servicio)
    except ValueError as e:
        if "No se encontró" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/servicios/{servicio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_servicio(
    servicio_id: int,
    service: ServicioService = Depends(get_servicio_service)
):
    """
    Elimina un servicio.
    
    Args:
        servicio_id: ID del servicio a eliminar
        service: Servicio inyectado
        
    Raises:
        HTTPException 404: Si el servicio no existe
    """
    try:
        service.delete_servicio(servicio_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
