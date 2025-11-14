"""Rutas API para Autoparte.

Define los endpoints para operaciones CRUD de Autoparte con filtros especializados.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.autoparte_schema import AutoparteCreate, AutoparteResponse
from services.autoparte_service import AutoparteService

router = APIRouter(tags=["Autopartes"])


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


def get_autoparte_service(db: Session = Depends(get_db)) -> AutoparteService:
    """Proporciona una instancia del servicio de Autoparte.

    Dependencia para inyección del servicio.

    :param db: Sesión de BD inyectada.
    :returns: Instancia de AutoparteService.
    """

    return AutoparteService(db)


@router.post("/", response_model=AutoparteResponse)
def create_autoparte(
    data: AutoparteCreate,
    service: AutoparteService = Depends(get_autoparte_service)
):
    """Crea una nueva autoparte.

    :param data: Payload con datos de la autoparte.
    :param service: Servicio de Autoparte inyectado.
    :returns: AutoparteResponse con la autoparte creada.
    :raises HTTPException: 409 si la autoparte ya existe, 422 si validación falla.
    """

    return service.create_autoparte(data)


@router.get("/", response_model=list[AutoparteResponse])
def list_autopartes(
    service: AutoparteService = Depends(get_autoparte_service)
):
    """Obtiene todas las autopartes.

    :param service: Servicio de Autoparte inyectado.
    :returns: Lista de AutoparteResponse.
    """

    return service.list_autopartes()


@router.get("/{id}", response_model=AutoparteResponse)
def get_autoparte(id: int, service: AutoparteService = Depends(get_autoparte_service)):
    """Obtiene una autoparte por su identificador.

    :param id: Identificador de la autoparte.
    :param service: Servicio de Autoparte inyectado.
    :returns: AutoparteResponse con la autoparte.
    :raises HTTPException: 404 si la autoparte no existe.
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
    """Actualiza una autoparte existente.

    :param id: Identificador de la autoparte a actualizar.
    :param data: Payload con nuevos datos.
    :param service: Servicio de Autoparte inyectado.
    :returns: AutoparteResponse con la autoparte actualizada.
    :raises HTTPException: 404 si la autoparte no existe, 422 si validación falla.
    """

    autoparte = service.update_autoparte(id, data)
    if not autoparte:
        raise HTTPException(status_code=404, detail="Autoparte no encontrada")
    return autoparte


@router.delete("/{id}")
def delete_autoparte(id: int, service: AutoparteService = Depends(get_autoparte_service)):
    """Elimina una autoparte.

    :param id: Identificador de la autoparte a eliminar.
    :param service: Servicio de Autoparte inyectado.
    :returns: Mensaje de confirmación.
    :raises HTTPException: 404 si la autoparte no existe.
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
    """Obtiene autopartes por su modelo.

    :param modelo: Modelo de la autoparte.
    :param service: Servicio de Autoparte inyectado.
    :returns: Lista de AutoparteResponse con las autopartes del modelo.
    """

    return service.get_by_modelo(modelo)


@router.get("/anio/{anio}", response_model=list[AutoparteResponse])
def get_autopartes_by_anio(
    anio: int,
    service: AutoparteService = Depends(get_autoparte_service)
):
    """Obtiene autopartes por su año de fabricación.

    :param anio: Año de fabricación.
    :param service: Servicio de Autoparte inyectado.
    :returns: Lista de AutoparteResponse con las autopartes del año.
    """

    return service.get_by_anio(anio)