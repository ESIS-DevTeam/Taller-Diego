from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.orden_schema import OrdenCreate, OrdenResponse
from services.orden_service import OrdenService
from datetime import date

router = APIRouter(tags=["Ordenes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_orden_service(db: Session = Depends(get_db)) -> OrdenService:
    return OrdenService(db)

@router.post("/", response_model=OrdenResponse)
def create_orden(
    data: OrdenCreate,
    service: OrdenService = Depends(get_orden_service)
):
    return service.create_orden(data)

@router.get("/", response_model=list[OrdenResponse])
def list_ordens(
    service: OrdenService = Depends(get_orden_service)
):
    return service.list_ordens()

@router.get("/{id}", response_model=OrdenResponse)
def get_orden_by_id(id: int, service: OrdenService = Depends(get_orden_service)):
    orden = service.get_by_id(id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden

@router.get("/fecha/{fecha}", response_model=list[OrdenResponse])
def get_ordens_by_fecha(fecha: date, service: OrdenService = Depends(get_orden_service)):
    return service.get_by_fecha(fecha)

@router.delete("/{id}")
def delete_orden(id: int, service: OrdenService = Depends(get_orden_service)):
    result = service.delete_orden(id)
    if not result:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return {"detail": "Orden eliminada"}
