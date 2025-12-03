from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.producto_schema import ProductoCreate, ProductoResponse
from services.producto_service import ProductoService
from core.auth import require_supabase_user

router = APIRouter(tags=["Productos"])



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 

def get_producto_service(db: Session = Depends(get_db)) -> ProductoService:
    return ProductoService(db)

@router.post("/", response_model=ProductoResponse, dependencies=[Depends(require_supabase_user)])
def create_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    try:
        return service.create_producto(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/", response_model=list[ProductoResponse])
def list_productos(
    service: ProductoService = Depends(get_producto_service)
):
    return service.list_productos()


@router.get("/barcode/{codBarras}", response_model=ProductoResponse)
def get_producto_by_barcode(codBarras: str, service: ProductoService = Depends(get_producto_service)):
    producto = service.get_by_barcode(codBarras)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    producto = service.get_by_id(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.put("/{id}", response_model=ProductoResponse, dependencies=[Depends(require_supabase_user)])
def update_producto(
    id: int,
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    producto = service.update_producto(id, data)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.delete("/{id}", dependencies=[Depends(require_supabase_user)])
def delete_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        producto = service.delete_producto(id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"detail": "Producto eliminado"}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))