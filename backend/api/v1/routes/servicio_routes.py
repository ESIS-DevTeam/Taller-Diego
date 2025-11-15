from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.servicio_schema import ServicioCreate, ServicioResponse
from services.servicio_service import ServicioService

router = APIRouter(tags=["Servicios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_servicio_service(db: Session = Depends(get_db)) -> ServicioService:
    return ServicioService(db)

@router.post("/", response_model=ServicioResponse)
def create_servicio(
    data: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    return service.create_servicio(data)

@router.get("/", response_model=list[ServicioResponse])
def list_servicios(
    service: ServicioService = Depends(get_servicio_service)
):
    return service.list_servicios()

@router.get("/{id}", response_model=ServicioResponse)
def get_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
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
    servicio = service.update_servicio(id, data)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio

@router.delete("/{id}")
def delete_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
    servicio = service.delete_servicio(id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"detail": "Servicio eliminado"}