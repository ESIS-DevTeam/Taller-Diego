"""Esquemas Pydantic para Producto.

Define modelos de validación y serialización para operaciones de producto.
"""

from pydantic import BaseModel


class ProductoBase(BaseModel):
    """Datos comunes de un producto.

    :ivar nombre: Nombre único del producto.
    :ivar descripcion: Descripción detallada del producto.
    :ivar precioCompra: Precio de adquisición.
    :ivar precioVenta: Precio de venta.
    :ivar marca: Marca o fabricante.
    :ivar categoria: Categoría de clasificación.
    :ivar stock: Cantidad en existencia.
    :ivar stockMin: Cantidad mínima para alertas.
    """

    nombre: str
    descripcion: str
    precioCompra: float
    precioVenta: float
    marca: str
    categoria: str
    stock: int
    stockMin: int


class ProductoCreate(ProductoBase):
    """Payload de creación/actualización de producto.

    :ivar codBarras: Código de barras (opcional, único).
    :ivar img: URL o ruta de imagen (opcional).
    """

    codBarras: str | None = None
    img: str | None = None


class ProductoResponse(ProductoBase):
    """Modelo de respuesta para producto.

    Incluye identificador y campos heredados de ProductoBase.

    :ivar id: Identificador único del producto.
    :ivar codBarras: Código de barras si aplica.
    :ivar img: URL o ruta de imagen.
    :ivar tipo: Tipo de producto (discriminador de herencia).
    """

    id: int
    codBarras: str | None = None
    img: str | None = None
    tipo: str | None = None

    class Config:
        from_attributes = True