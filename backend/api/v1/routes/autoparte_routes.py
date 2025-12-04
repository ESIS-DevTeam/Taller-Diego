from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.autoparte_schema import AutoparteCreate, AutoparteResponse
from services.autoparte_service import AutoparteService

router = APIRouter(tags=["Autopartes"])



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 

def get_autoparte_service(db: Session = Depends(get_db)) -> AutoparteService:
    return AutoparteService(db)

@router.post("/", response_model=AutoparteResponse)
def create_autoparte(
    data: AutoparteCreate,
    service: AutoparteService = Depends(get_autoparte_service)
):
    return service.create_autoparte(data)


@router.get("/", response_model=list[AutoparteResponse])
def list_autopartes(
    service: AutoparteService = Depends(get_autoparte_service)
):
    return service.list_autopartes()


@router.get("/{id}", response_model=AutoparteResponse)
def get_autoparte(id: int, service: AutoparteService = Depends(get_autoparte_service)):
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
    autoparte = service.update_autoparte(id, data)
    if not autoparte:
        raise HTTPException(status_code=404, detail="Autoparte no encontrada")
    return autoparte


@router.delete("/{id}")
def delete_autoparte(id: int, service: AutoparteService = Depends(get_autoparte_service)):
    autoparte = service.delete_autoparte(id)
    if not autoparte:
        raise HTTPException(status_code=404, detail="Autoparte no encontrada")
    return {"detail": "Autoparte eliminada"}

# Endpoints específicos para autopartes
@router.get("/modelo/{modelo}", response_model=list[AutoparteResponse])
def get_autopartes_by_modelo(
    modelo: str,
    service: AutoparteService = Depends(get_autoparte_service)
):
    return service.get_by_modelo(modelo)


@router.get("/anio/{anio}", response_model=list[AutoparteResponse])
def get_autopartes_by_anio(
    anio: int,  # El usuario busca con un año numérico (ej: 2020)
    service: AutoparteService = Depends(get_autoparte_service)
):
    """Busca autopartes compatibles con un año específico"""
    return service.get_by_anio(anio)