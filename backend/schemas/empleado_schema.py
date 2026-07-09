from pydantic import BaseModel
from pydantic import ConfigDict

class EmpleadoBase(BaseModel):
    nombres: str
    apellidos: str
    estado: str = "activo"
    especialidad: str
    documento: str | None = None
    telefono: str | None = None
    correo: str | None = None

class EmpleadoCreate(EmpleadoBase):
    pass

class EmpleadoResponse(EmpleadoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)