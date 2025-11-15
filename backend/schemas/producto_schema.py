from pydantic import BaseModel


class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precio_compra: float
    precio_venta: float
    marca: str
    categoria: str
    stock: int
    stock_min: int


class ProductoCreate(ProductoBase):
    cod_barras: str | None = None
    img: str | None = None


class ProductoResponse(ProductoBase):
    id: int
    cod_barras: str | None = None
    img: str | None = None
    tipo: str | None = None

class Config:
    from_attributes = True