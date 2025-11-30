"""Rutas API para Producto.

Define los endpoints para operaciones CRUD de Producto.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.producto_schema import ProductoCreate, ProductoResponse
from services.producto_service import ProductoService

router = APIRouter(tags=["Productos"])


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


def get_producto_service(db: Session = Depends(get_db)) -> ProductoService:
    """Proporciona una instancia del servicio de Producto.

    Dependencia para inyección del servicio.

    :param db: Sesión de BD inyectada.
    :returns: Instancia de ProductoService.
    """

    return ProductoService(db)


@router.post("/", response_model=ProductoResponse)
def create_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service)
):
    """Crea un nuevo producto.

    :param data: Payload con datos del producto.
    :param service: Servicio de Producto inyectado.
    :returns: ProductoResponse con el producto creado.
    :raises HTTPException: 409 si el producto ya existe, 422 si validación falla.
    """

    return service.create_producto(data)


@router.get("/", response_model=list[ProductoResponse])
def list_productos(
    service: ProductoService = Depends(get_producto_service)
):
    """Obtiene todos los productos.

    :param service: Servicio de Producto inyectado.
    :returns: Lista de ProductoResponse.
    """

    return service.list_productos()


@router.get("/barcode/{codBarras}", response_model=ProductoResponse)
def get_producto_by_barcode(codBarras: str, service: ProductoService = Depends(get_producto_service)):
    producto = service.get_by_barcode(codBarras)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    """Obtiene un producto por su identificador.

    :param id: Identificador del producto.
    :param service: Servicio de Producto inyectado.
    :returns: ProductoResponse con el producto.
    :raises HTTPException: 404 si el producto no existe.
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
    :param data: Payload con nuevos datos.
    :param service: Servicio de Producto inyectado.
    :returns: ProductoResponse con el producto actualizado.
    :raises HTTPException: 404 si el producto no existe, 422 si validación falla.
    """

    producto = service.update_producto(id, data)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.delete("/{id}")
def delete_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    """Elimina un producto.

    :param id: Identificador del producto a eliminar.
    :param service: Servicio de Producto inyectado.
    :returns: Mensaje de confirmación.
    :raises HTTPException: 404 si el producto no existe.
    """

    producto = service.delete_producto(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"detail": "Producto eliminado"}