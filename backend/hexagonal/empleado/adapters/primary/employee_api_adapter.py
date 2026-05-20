from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import SessionLocal
from schemas.empleado_schema import EmpleadoCreate, EmpleadoResponse
from hexagonal.empleado.usecases.employee_usecase import EmployeeUseCase
from core.auth import require_supabase_user

router = APIRouter(tags=["Empleados"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_usecase(db: Session = Depends(get_db)) -> EmployeeUseCase:
    repo = __import__("hexagonal.empleado.adapters.secondary.sqlalchemy_employee_repository", fromlist=["SqlAlchemyEmployeeRepository"]) 
    RepoClass = getattr(repo, "SqlAlchemyEmployeeRepository")
    usecase = EmployeeUseCase(RepoClass(db))
    return usecase


@router.post("/", response_model=EmpleadoResponse, dependencies=[Depends(require_supabase_user)])
def create_empleado(data: EmpleadoCreate, usecase: EmployeeUseCase = Depends(get_usecase)):
    return usecase.create_employee(data.model_dump())


@router.get("/", response_model=list[EmpleadoResponse])
def list_empleados(usecase: EmployeeUseCase = Depends(get_usecase)):
    return usecase.list_employees()


@router.get("/{id}", response_model=EmpleadoResponse)
def get_empleado(id: int, usecase: EmployeeUseCase = Depends(get_usecase)):
    empleado = usecase.get_by_id(id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.put("/{id}", response_model=EmpleadoResponse, dependencies=[Depends(require_supabase_user)])
def update_empleado(id: int, data: EmpleadoCreate, usecase: EmployeeUseCase = Depends(get_usecase)):
    empleado = usecase.update_employee(id, data.model_dump(exclude_unset=True))
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.delete("/{id}", dependencies=[Depends(require_supabase_user)])
def delete_empleado(id: int, usecase: EmployeeUseCase = Depends(get_usecase)):
    empleado = usecase.delete_employee(id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"detail": "Empleado eliminado"}
