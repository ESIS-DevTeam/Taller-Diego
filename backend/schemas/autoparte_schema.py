"""Esquemas Pydantic para Autoparte.

Define modelos de validación y serialización para operaciones de autoparte.
"""

from .producto_schema import ProductoBase



class AutoparteBase(ProductoBase):
    """Datos comunes de una autoparte.

    Extiende ProductoBase con campos específicos de autopartes.

    :ivar modelo: Modelo de vehículo compatible.
    :ivar anio: Año del modelo de vehículo.
    """

    modelo: str
    anio: int


class AutoparteCreate(AutoparteBase):
    """Payload de creación/actualización de autoparte.

    :ivar cod_barras: Código de barras (opcional, único si se provee).
    :ivar img: URL o ruta de imagen (opcional).
    """

    cod_barras: str | None = None
    img: str | None = None


class AutoparteResponse(AutoparteBase):
    """Modelo de respuesta para autoparte.

    Incluye identificador y campos heredados de Producto.

    :ivar id: Identificador único de la autoparte.
    :ivar cod_barras: Código de barras si aplica.
    :ivar img: URL o ruta de imagen.
    """

    id: int
    cod_barras: str | None = None
    img: str | None = None

    class Config:
        from_attributes = True