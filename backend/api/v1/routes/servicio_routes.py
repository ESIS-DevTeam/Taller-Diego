from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.servicio_schema import ServicioCreate, ServicioResponse
from services.servicio_service import ServicioService
from core.auth import require_supabase_user

router = APIRouter(tags=["Servicios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_servicio_service(db: Session = Depends(get_db)) -> ServicioService:
    return ServicioService(db)

@router.post("/", response_model=ServicioResponse, dependencies=[Depends(require_supabase_user)])
def create_servicio(
    data: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    try:
        return service.create_servicio(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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

@router.put("/{id}", response_model=ServicioResponse, dependencies=[Depends(require_supabase_user)])
def update_servicio(
    id: int,
    data: ServicioCreate,
    service: ServicioService = Depends(get_servicio_service)
):
    try:
        servicio = service.update_servicio(id, data)
        if not servicio:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        return servicio
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(require_supabase_user)])
def delete_servicio(id: int, service: ServicioService = Depends(get_servicio_service)):
    try:
        servicio = service.delete_servicio(id)
        if not servicio:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        return {"detail": "Servicio eliminado"}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))