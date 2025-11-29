"""Esquemas Pydantic para Producto.

Define modelos de validación y serialización para operaciones de producto.
"""

from pydantic import BaseModel



class ProductoBase(BaseModel):
    """Datos comunes de un producto.

    :ivar nombre: Nombre del producto (único).
    :ivar descripcion: Descripción breve del producto.
    :ivar precio_compra: Precio unitario de compra.
    :ivar precio_venta: Precio unitario de venta.
    :ivar marca: Marca o fabricante.
    :ivar categoria: Categoría del producto.
    :ivar stock: Cantidad disponible en inventario.
    :ivar stock_min: Umbral mínimo de stock para alertas.
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

    :ivar cod_barras: Código de barras (opcional, único si se provee).
    :ivar img: URL o ruta de imagen (opcional).
    """

    cod_barras: str | None = None
    img: str | None = None


class ProductoResponse(ProductoBase):
    """Modelo de respuesta para producto.

    Incluye campos de solo lectura como identificador y tipo polimórfico.

    :ivar id: Identificador único del producto.
    :ivar cod_barras: Código de barras si aplica.
    :ivar img: URL o ruta de imagen.
    :ivar tipo: Identidad polimórfica (p. ej., 'producto' o 'autoparte').
    """

    id: int
    codBarras: str | None = None
    img: str | None = None
    tipo: str | None = None

class Config:
    from_attributes = True