"""
Rutas API para operaciones de Empleados.

Este módulo define los endpoints REST para crear, leer, actualizar y eliminar
empleados. Implementa el patrón de inyección de dependencias de FastAPI para
gestionar sesiones de base de datos y servicios.

Las rutas siguen el patrón RESTful:
- POST /: Crear nuevo empleado
- GET /: Listar todos los empleados
- GET /{id}: Obtener empleado por ID
- PUT /{id}: Actualizar empleado
- DELETE /{id}: Eliminar empleado

:author: Backend Team
:version: 1.0
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.empleado_schema import EmpleadoCreate, EmpleadoResponse
from services.empleado_service import EmpleadoService

router = APIRouter(tags=["Empleados"])


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


def get_empleado_service(db: Session = Depends(get_db)) -> EmpleadoService:
    """
    Función de dependencia que proporciona el servicio de empleados.
    
    Inyecta la sesión de base de datos en el servicio de empleados
    para que este pueda acceder a los datos.
    
    :param db: Sesión de base de datos inyectada
    :type db: Session
    :returns: Instancia del servicio de empleados
    :rtype: EmpleadoService
    """
    return EmpleadoService(db)


@router.post("/", response_model=EmpleadoResponse)
def create_empleado(
    data: EmpleadoCreate,
    service: EmpleadoService = Depends(get_empleado_service)
):
    """
    Crea un nuevo empleado.
    
    Recibe los datos del empleado en el cuerpo de la solicitud
    y retorna el empleado creado con su ID generado.
    
    :param data: Datos del empleado a crear
    :type data: EmpleadoCreate
    :param service: Servicio de empleados inyectado
    :type service: EmpleadoService
    :returns: Empleado creado
    :rtype: EmpleadoResponse
    :raises ValueError: Si ya existe un empleado con ese nombre
    """
    return service.create_empleado(data)


@router.get("/", response_model=list[EmpleadoResponse])
def list_empleados(
    service: EmpleadoService = Depends(get_empleado_service)
):
    """
    Lista todos los empleados registrados.
    
    :param service: Servicio de empleados inyectado
    :type service: EmpleadoService
    :returns: Lista de todos los empleados
    :rtype: list[EmpleadoResponse]
    """
    return service.list_empleados()


@router.get("/{id}", response_model=EmpleadoResponse)
def get_empleado(id: int, service: EmpleadoService = Depends(get_empleado_service)):
    """
    Obtiene un empleado específico por su ID.
    
    :param id: Identificador del empleado
    :type id: int
    :param service: Servicio de empleados inyectado
    :type service: EmpleadoService
    :returns: Empleado encontrado
    :rtype: EmpleadoResponse
    :raises HTTPException: Si el empleado no existe (404)
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
    """
    Actualiza un empleado existente.
    
    :param id: Identificador del empleado a actualizar
    :type id: int
    :param data: Nuevos datos del empleado
    :type data: EmpleadoCreate
    :param service: Servicio de empleados inyectado
    :type service: EmpleadoService
    :returns: Empleado actualizado
    :rtype: EmpleadoResponse
    :raises HTTPException: Si el empleado no existe (404)
    """
    empleado = service.update_empleado(id, data)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.delete("/{id}")
def delete_empleado(id: int, service: EmpleadoService = Depends(get_empleado_service)):
    """
    Elimina un empleado existente.
    
    :param id: Identificador del empleado a eliminar
    :type id: int
    :param service: Servicio de empleados inyectado
    :type service: EmpleadoService
    :returns: Mensaje de confirmación de eliminación
    :rtype: dict
    :raises HTTPException: Si el empleado no existe (404)
    """
    empleado = service.delete_empleado(id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"detail": "Empleado eliminado"}