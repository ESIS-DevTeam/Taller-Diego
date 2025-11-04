from sqlalchemy.orm import Session
from repositories.orden_repo import OrdenRepository
from schemas.orden_schema import OrdenCreate
from fastapi import HTTPException

class OrdenService:
    
    def __init__(self, db: Session):
        self.repo = OrdenRepository(db)

    def create_orden(self, data: OrdenCreate):
        servicios = getattr(data, "servicios", None)
        if servicios:
            servicios_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in servicios]
            try:
                return self.repo.create_with_services(data.fecha, servicios_list)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
        return self.repo.create(data.fecha)

    def list_ordens(self):
        return self.repo.get_all()

    def get_by_id(self, id: int):
        return self.repo.get_by_id(id)

    def get_by_fecha(self, fecha):
        return self.repo.get_by_fecha(fecha)

    def delete_orden(self, id: int):
        return self.repo.delete(id)