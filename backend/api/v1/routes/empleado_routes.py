"""Rutas API para Empleado.

Define los endpoints para operaciones CRUD de Empleado.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.empleado_schema import EmpleadoCreate, EmpleadoResponse
from services.empleado_service import EmpleadoService

router = APIRouter(tags=["Empleados"])

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

def get_empleado_service(db: Session = Depends(get_db)) -> EmpleadoService:
    """Proporciona una instancia del servicio de Empleado.

    Dependencia para inyección del servicio.

    :param db: Sesión de BD inyectada.
    :returns: Instancia de EmpleadoService.
    """

    return EmpleadoService(db)

@router.post("/", response_model=EmpleadoResponse)
def create_empleado(
    data: EmpleadoCreate,
    service: EmpleadoService = Depends(get_empleado_service)
):
    """Crea un nuevo empleado.

    :param data: Payload con datos del empleado.
    :param service: Servicio de Empleado inyectado.
    :returns: EmpleadoResponse con el empleado creado.
    :raises HTTPException: 409 si el empleado ya existe, 422 si validación falla.
    """

    return service.create_empleado(data)

@router.get("/", response_model=list[EmpleadoResponse])
def list_empleados(
    service: EmpleadoService = Depends(get_empleado_service)
):
    """Obtiene todos los empleados.

    :param service: Servicio de Empleado inyectado.
    :returns: Lista de EmpleadoResponse.
    """

    return service.list_empleados()

@router.get("/{id}", response_model=EmpleadoResponse)
def get_empleado(id: int, service: EmpleadoService = Depends(get_empleado_service)):
    """Obtiene un empleado por su identificador.

    :param id: Identificador del empleado.
    :param service: Servicio de Empleado inyectado.
    :returns: EmpleadoResponse con el empleado.
    :raises HTTPException: 404 si el empleado no existe.
    """

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
    """Actualiza un empleado existente.

    :param id: Identificador del empleado a actualizar.
    :param data: Payload con nuevos datos.
    :param service: Servicio de Empleado inyectado.
    :returns: EmpleadoResponse con el empleado actualizado.
    :raises HTTPException: 404 si el empleado no existe, 422 si validación falla.
    """

    empleado = service.update_empleado(id, data)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado

@router.delete("/{id}")
def delete_empleado(id: int, service: EmpleadoService = Depends(get_empleado_service)):
    """Elimina un empleado.

    :param id: Identificador del empleado a eliminar.
    :param service: Servicio de Empleado inyectado.
    :returns: Mensaje de confirmación.
    :raises HTTPException: 404 si el empleado no existe.
    """

    empleado = service.delete_empleado(id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"detail": "Empleado eliminado"}