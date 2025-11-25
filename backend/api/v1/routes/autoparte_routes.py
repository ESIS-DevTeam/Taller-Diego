"""
Rutas API para operaciones de Autopartes.

Este módulo define los endpoints REST para crear, leer, actualizar y eliminar
autopartes. Incluye operaciones de búsqueda especializadas por modelo y año.

Las rutas siguen el patrón RESTful:
- POST /: Crear nueva autoparte
- GET /: Listar todas las autopartes
- GET /{id}: Obtener autoparte por ID
- PUT /{id}: Actualizar autoparte
- DELETE /{id}: Eliminar autoparte
- GET /modelo/{modelo}: Buscar por modelo
- GET /anio/{anio}: Buscar por año

:author: Backend Team
:version: 1.0
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.autoparte_schema import AutoparteCreate, AutoparteResponse
from services.autoparte_service import AutoparteService

router = APIRouter(tags=["Autopartes"])


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


def get_autoparte_service(db: Session = Depends(get_db)) -> AutoparteService:
    """
    Función de dependencia que proporciona el servicio de autopartes.
    
    Inyecta la sesión de base de datos en el servicio de autopartes
    para que este pueda acceder a los datos.
    
    :param db: Sesión de base de datos inyectada
    :type db: Session
    :returns: Instancia del servicio de autopartes
    :rtype: AutoparteService
    """
    return AutoparteService(db)


@router.post("/", response_model=AutoparteResponse)
def create_autoparte(
    data: AutoparteCreate,
    service: AutoparteService = Depends(get_autoparte_service)
):
    """
    Crea una nueva autoparte.
    
    Recibe los datos de la autoparte en el cuerpo de la solicitud
    y retorna la autoparte creada con su ID generado.
    
    :param data: Datos de la autoparte a crear
    :type data: AutoparteCreate
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Autoparte creada
    :rtype: AutoparteResponse
    :raises ValueError: Si el nombre de la autoparte ya existe
    """
    return service.create_autoparte(data)


@router.get("/", response_model=list[AutoparteResponse])
def list_autopartes(
    service: AutoparteService = Depends(get_autoparte_service)
):
    """
    Lista todas las autopartes registradas.
    
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Lista de todas las autopartes
    :rtype: list[AutoparteResponse]
    """
    return service.list_autopartes()


@router.get("/{id}", response_model=AutoparteResponse)
def get_autoparte(id: int, service: AutoparteService = Depends(get_autoparte_service)):
    """
    Obtiene una autoparte específica por su ID.
    
    :param id: Identificador de la autoparte
    :type id: int
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Autoparte encontrada
    :rtype: AutoparteResponse
    :raises HTTPException: Si la autoparte no existe (404)
    """
    autoparte = service.get_by_id(id)
    if not autoparte:
        raise HTTPException(status_code=404, detail="Autoparte no encontrada")
    return autoparte


@router.put("/{id}", response_model=AutoparteResponse)
def update_autoparte(
    id: int,
    data: AutoparteCreate,
    service: AutoparteService = Depends(get_autoparte_service)
):
    """
    Actualiza una autoparte existente.
    
    :param id: Identificador de la autoparte a actualizar
    :type id: int
    :param data: Nuevos datos de la autoparte
    :type data: AutoparteCreate
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Autoparte actualizada
    :rtype: AutoparteResponse
    :raises HTTPException: Si la autoparte no existe (404)
    """
    autoparte = service.update_autoparte(id, data)
    if not autoparte:
        raise HTTPException(status_code=404, detail="Autoparte no encontrada")
    return autoparte


@router.delete("/{id}")
def delete_autoparte(id: int, service: AutoparteService = Depends(get_autoparte_service)):
    """
    Elimina una autoparte existente.
    
    :param id: Identificador de la autoparte a eliminar
    :type id: int
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Mensaje de confirmación de eliminación
    :rtype: dict
    :raises HTTPException: Si la autoparte no existe (404)
    """
    autoparte = service.delete_autoparte(id)
    if not autoparte:
        raise HTTPException(status_code=404, detail="Autoparte no encontrada")
    return {"detail": "Autoparte eliminada"}


@router.get("/modelo/{modelo}", response_model=list[AutoparteResponse])
def get_autopartes_by_modelo(
    modelo: str,
    service: AutoparteService = Depends(get_autoparte_service)
):
    """
    Busca autopartes compatibles con un modelo específico de vehículo.
    
    :param modelo: Modelo del vehículo para filtrar autopartes
    :type modelo: str
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Lista de autopartes compatible con el modelo
    :rtype: list[AutoparteResponse]
    """
    return service.get_by_modelo(modelo)


@router.get("/anio/{anio}", response_model=list[AutoparteResponse])
def get_autopartes_by_anio(
    anio: int,
    service: AutoparteService = Depends(get_autoparte_service)
):
    """
    Busca autopartes compatibles con un año específico de vehículo.
    
    :param anio: Año del vehículo para filtrar autopartes
    :type anio: int
    :param service: Servicio de autopartes inyectado
    :type service: AutoparteService
    :returns: Lista de autopartes compatibles con el año
    :rtype: list[AutoparteResponse]
    """
    return service.get_by_anio(anio)