from .producto_schema import ProductoBase

class AutoparteBase(ProductoBase):
    modelo: str
    anio: int

class AutoparteCreate(AutoparteBase):
    codBarras: str | None = None
    img: str | None = None

class AutoparteResponse(AutoparteBase):
    id: int
    codBarras: str | None = None
    img: str | None = None

    class Config:
        from_attributes = True