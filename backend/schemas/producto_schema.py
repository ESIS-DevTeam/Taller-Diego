from pydantic import BaseModel
class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precioCompra: float
    precioVenta: float
    marca: str
    categoria: str
    stock: int
    stockMin: int

class ProductoCreate(ProductoBase):
    codBarras: str | None = None
    img: str | None = None

class ProductoResponse(ProductoBase):
    id: int
    codBarras: str | None = None
    img: str | None = None
    tipo: str | None = None

    class Config:
        from_attributes = True


class ProductosPaginatedResponse(BaseModel):
    items: list[ProductoResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int

    class Config:
        from_attributes = True