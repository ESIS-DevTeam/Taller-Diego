from sqlalchemy.orm import Session
from repositories.servicio_repo import ServicioRepository
from schemas.servicio_schema import ServicioCreate

class ServicioService:

    def __init__(self, db: Session):
        self.repo = ServicioRepository(db)
    
    def create_servicio(self, data: ServicioCreate):
        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe un servicio con ese nombre")
        servicio_data = data
        servicio = self.repo.create(servicio_data)
        return servicio
    
    def list_servicios(self):
        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        return self.repo.get_by_id(id)
    
    def get_by_name(self, nombre: str):
        return self.repo.get_by_name(nombre)
    
    def update_servicio(self, id: int, data: ServicioCreate):
        return self.repo.update(id, data)
    
    def delete_servicio(self, id: int):
        return self.repo.delete(id)