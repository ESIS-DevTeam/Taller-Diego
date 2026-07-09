from .producto_schema import ProductoBase
from pydantic import ConfigDict


class AutoparteBase(ProductoBase):
    modelo: str
    anio: str  # Formato: "2020", "2018-2023", o "2018, 2020, 2022"


class AutoparteCreate(AutoparteBase):
    codBarras: str | None = None
    img: str | None = None


class AutoparteResponse(AutoparteBase):
    id: int
    codBarras: str | None = None
    img: str | None = None

    model_config = ConfigDict(from_attributes=True)
