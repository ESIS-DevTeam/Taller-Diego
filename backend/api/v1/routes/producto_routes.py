from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.producto_schema import ProductoCreate, ProductoResponse
from services.producto_service import ProductoService
import logging

router = APIRouter(tags=["Productos"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_producto_service(db: Session = Depends(get_db)) -> ProductoService:
    return ProductoService(db)

@router.post("/", response_model=ProductoResponse)
def create_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    try:
        return service.create_producto(data)
    except ValueError as ve:
        # business validation (e.g., duplicate)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        logging.exception("Error en endpoint crear producto")
        raise HTTPException(status_code=500, detail="Error interno al crear producto")

@router.get("/", response_model=list[ProductoResponse])
def list_productos(
    service: ProductoService = Depends(get_producto_service)
):
    try:
        return service.list_productos()
    except Exception:
        logging.exception("Error en endpoint listar productos")
        raise HTTPException(status_code=500, detail="Error interno al listar productos")

@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        producto = service.get_by_id(id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto
    except HTTPException:
        raise
    except Exception:
        logging.exception("Error en endpoint obtener producto")
        raise HTTPException(status_code=500, detail="Error interno al obtener producto")

@router.put("/{id}", response_model=ProductoResponse)
def update_producto(
    id: int,
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    try:
        producto = service.update_producto(id, data)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto
    except HTTPException:
        raise
    except Exception:
        logging.exception("Error en endpoint actualizar producto")
        raise HTTPException(status_code=500, detail="Error interno al actualizar producto")

@router.delete("/{id}")
def delete_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        producto = service.delete_producto(id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return {"detail": "Producto eliminado"}
    except HTTPException:
        raise
    except Exception:
        logging.exception("Error en endpoint eliminar producto")
        raise HTTPException(status_code=500, detail="Error interno al eliminar producto")