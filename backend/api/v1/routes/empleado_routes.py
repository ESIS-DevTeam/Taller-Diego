from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.empleado_schema import EmpleadoCreate, EmpleadoResponse
from services.empleado_service import EmpleadoService

router = APIRouter(tags=["Empleados"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_empleado_service(db: Session = Depends(get_db)) -> EmpleadoService:
    return EmpleadoService(db)

@router.post("/", response_model=EmpleadoResponse)
def create_empleado(
    data: EmpleadoCreate,
    service: EmpleadoService = Depends(get_empleado_service)
):
    return service.create(data)

@router.get("/", response_model=list[EmpleadoResponse])
def list_empleados(
    service: EmpleadoService = Depends(get_empleado_service)
):
    return service.get_all()

@router.get("/{id}", response_model=EmpleadoResponse)
def get_empleado(id: int, service: EmpleadoService = Depends(get_empleado_service)):
    empleado = service.get_by_id(id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado

@router.put("/{id}", response_model=EmpleadoResponse)
def update_empleado(
    id: int,
    data: EmpleadoCreate,
    service: EmpleadoService = Depends(get_empleado_service)
):
    empleado = service.update(id, data)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado

@router.delete("/{id}")
def delete_empleado(id: int, service: EmpleadoService = Depends(get_empleado_service)):
    result = service.delete(id)
    if not result:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"detail": "Empleado eliminado"}