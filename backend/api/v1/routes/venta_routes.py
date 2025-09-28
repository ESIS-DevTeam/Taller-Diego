from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.venta_schema import VentaCreate, VentaResponse
from services.venta_service import VentaService
from datetime import datetime

router = APIRouter(prefix="/ventas", tags=["ventas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_venta_service(db: Session = Depends(get_db)) -> VentaService:
    return VentaService(db)

@router.post("/", response_model=VentaResponse)
def create_venta(
    data: VentaCreate,
    service: VentaService = Depends(get_venta_service)
):
    return service.create_venta(data)

@router.get("/", response_model=list[VentaResponse])
def list_ventas(
    service: VentaService = Depends(get_venta_service)
):
    return service.list_ventas()

@router.get("/{id}", response_model=VentaResponse)
def get_venta_by_id(id: int, service: VentaService = Depends(get_venta_service)):
    venta = service.get_by_id(id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta not found")
    return venta

@router.get("/fecha/{fecha}", response_model=list[VentaResponse])
def get_ventas_by_fecha(fecha: datetime, service: VentaService = Depends(get_venta_service)):
    return service.get_by_fecha(fecha)

@router.delete("/{id}")
def delete_venta(id: int, service: VentaService = Depends(get_venta_service)):
    result = service.delete_venta(id)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {"detail": "Venta eliminada"}
