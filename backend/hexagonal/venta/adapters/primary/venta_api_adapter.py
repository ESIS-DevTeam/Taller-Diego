from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import SessionLocal
from schemas.venta_schema import VentaCreate, VentaResponse
from hexagonal.venta.usecases.venta_usecase import VentaUseCase
from core.auth import require_supabase_user

router = APIRouter(tags=["Ventas"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_venta_usecase(db: Session = Depends(get_db)) -> VentaUseCase:
    repo_module = __import__("hexagonal.venta.adapters.secondary.sqlalchemy_venta_repository", fromlist=["SqlAlchemyVentaRepository"]) 
    RepoClass = getattr(repo_module, "SqlAlchemyVentaRepository")
    return VentaUseCase(RepoClass(db))


@router.post("/", response_model=VentaResponse, dependencies=[Depends(require_supabase_user)])
def create_venta(data: VentaCreate, usecase: VentaUseCase = Depends(get_venta_usecase)):
    return usecase.create_venta(data)


@router.get("/", response_model=list[VentaResponse])
def list_ventas(usecase: VentaUseCase = Depends(get_venta_usecase)):
    return usecase.list_ventas()


@router.get("/{id}", response_model=VentaResponse)
def get_venta(id: int, usecase: VentaUseCase = Depends(get_venta_usecase)):
    venta = usecase.get_by_id(id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


@router.delete("/{id}", dependencies=[Depends(require_supabase_user)])
def delete_venta(id: int, usecase: VentaUseCase = Depends(get_venta_usecase)):
    result = usecase.delete_venta(id)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {"detail": "Venta eliminada"}
