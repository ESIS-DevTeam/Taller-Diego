"""Rutas API para gestión de productos.

Define los endpoints REST para operaciones CRUD de productos.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.producto_schema import ProductoCreate, ProductoResponse
from services.producto_service import ProductoService

router = APIRouter(tags=["Productos"])


def get_db():
    """Obtiene una sesión de base de datos.

    :yields: Sesión de SQLAlchemy.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_producto_service(db: Session = Depends(get_db)) -> ProductoService:
    """Obtiene una instancia del servicio de productos.

    :param db: Sesión de base de datos.
    :returns: Instancia de ProductoService.
    """

    return ProductoService(db)

@router.post("/", response_model=ProductoResponse)
def create_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    """Crea un nuevo producto.

    :param data: Datos del producto a crear.
    :param service: Instancia del servicio de productos.
    :returns: Producto creado.
    :raises HTTPException: Si la creación falla.
    """

    return service.create_producto(data)


@router.get("/", response_model=list[ProductoResponse])
def list_productos(
    service: ProductoService = Depends(get_producto_service)
):
    """Obtiene todos los productos.

    :param service: Instancia del servicio de productos.
    :returns: Lista de productos.
    """

    return service.list_productos()


@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    """Obtiene un producto por su identificador.

    :param id: Identificador del producto.
    :param service: Instancia del servicio de productos.
    :returns: Producto solicitado.
    :raises HTTPException: Si el producto no existe (404).
    """

    producto = service.get_by_id(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.put("/{id}", response_model=ProductoResponse)
def update_producto(
    id: int,
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    """Actualiza un producto existente.

    :param id: Identificador del producto a actualizar.
    :param data: Nuevos datos del producto.
    :param service: Instancia del servicio de productos.
    :returns: Producto actualizado.
    :raises HTTPException: Si el producto no existe (404).
    """

    producto = service.update_producto(id, data)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.delete("/{id}")
def delete_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    """Elimina un producto.

    :param id: Identificador del producto a eliminar.
    :param service: Instancia del servicio de productos.
    :returns: Mensaje de confirmación.
    :raises HTTPException: Si el producto no existe (404).
    """

    producto = service.delete_producto(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"detail": "Producto eliminado"}