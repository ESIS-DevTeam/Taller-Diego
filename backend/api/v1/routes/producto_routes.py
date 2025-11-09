from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.producto_schema import ProductoCreate, ProductoResponse, ProductosPaginatedResponse
from services.producto_service import ProductoService

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
    return service.create_producto(data)

@router.get("/", response_model=ProductosPaginatedResponse)
def list_productos(
    service: ProductoService = Depends(get_producto_service),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Tamaño de página"),
    order_by: str | None = Query(None, description="Campo para ordenar"),
    order_dir: str | None = Query(None, description="Dirección de ordenamiento"),
    categoria: str | None = Query(None, description="Filtrar por categoría" ),
    precio_min: float | None = Query(None, description="Precio mínimo (precioVenta)"),
    precio_max: float | None = Query(None, description="Precio máximo (precioVenta)"),
    low_stock: bool = Query(False, description="Si true, devuelve productos con stock <= stockMin"),
    nombre: str | None = Query(None, description="Buscar por nombre (coincidencia parcial, case-insensitive)")
):
    filtros: dict = {
        "page": page,
        "page_size": page_size,
        "order_by": order_by,
        "order_dir": order_dir,
    }
    filtros.update({
        "categoria": categoria,
        "precio_min": precio_min,
        "precio_max": precio_max,
        "low_stock": low_stock,
        "nombre": nombre,
    })
    # Eliminar claves con valor None
    filtros = {k: v for k, v in filtros.items() if v is not None}
    return service.list_productos(filtros)

@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    producto = service.get_by_id(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.get("/low-stock/count")
def count_low_stock(service: ProductoService = Depends(get_producto_service)):
    count = service.count_low_stock()
    return {"low_stock_count": count}

@router.put("/{id}", response_model=ProductoResponse)
def update_producto(
    id: int,
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    producto = service.update_producto(id, data)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.delete("/{id}")
def delete_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    producto = service.delete_producto(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"detail": "Producto eliminado"}