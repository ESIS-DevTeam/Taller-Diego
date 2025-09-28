from sqlalchemy.orm import Session
from repositories.autoparte_repo import AutoparteRepository
from schemas.autoparte_schema import AutoparteCreate

class AutoparteService:

    def __init__(self, db: Session):
        self.repo = AutoparteRepository(db)
    
    def create_autoparte(self, data: AutoparteCreate):
        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe una autoparte con ese nombre")
        autoparte_data = data
        autoparte = self.repo.create(autoparte_data)
        return autoparte
    
    def list_autopartes(self):
        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        return self.repo.get_by_id(id)
    
    def get_by_name(self, nombre: str):
        return self.repo.get_by_name(nombre)
    
    def update_autoparte(self, id: int, data: AutoparteCreate):
        autoparte = self.repo.get_by_id(id)
        if not autoparte:
            raise ValueError("La autoparte no existe")
        return self.repo.update(id, data)
    
    def delete_autoparte(self, id: int):
        autoparte = self.repo.get_by_id(id)
        if not autoparte:
            raise ValueError("La autoparte no existe")
        return self.repo.delete(id)
    
    def get_by_modelo(self, modelo: str):
        return self.repo.get_by_modelo(modelo)
    
    def get_by_año(self, año: int):
        return self.repo.get_by_año(año)
    
    def get_by_modelo_and_año(self, modelo: str, año: int):
        return self.repo.get_by_modelo_and_año(modelo, año)
    
    def check_stock_minimo(self, id: int):
        autoparte = self.repo.get_by_id(id)
        if autoparte and autoparte.stock <= autoparte.stockMin:
            return True
        return False
    
    def get_autopartes_bajo_stock(self):
        autopartes = self.repo.get_all()
        return [ap for ap in autopartes if ap.stock <= ap.stockMin]