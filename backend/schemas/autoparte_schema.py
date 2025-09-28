from pydantic import BaseModel

class AutoparteBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    marca: str
    categoria: str
    stock: int
    stockMin: int
    modelo: str
    año: int

class AutoparteCreate(AutoparteBase):
    codBarras: str | None = None
    img: str | None = None

class AutoparteResponse(AutoparteBase):
    id: int
    codBarras: str | None = None
    img: str | None = None

    class Config:
        from_attributes = True