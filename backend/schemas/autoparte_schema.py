from .producto_schema import ProductoBase



class AutoparteBase(ProductoBase):
    modelo: str
    anio: int


class AutoparteCreate(AutoparteBase):
    cod_barras: str | None = None
    img: str | None = None


class AutoparteResponse(AutoparteBase):
    id: int
    cod_barras: str | None = None
    img: str | None = None

    class Config:
        from_attributes = True