from typing import Dict, List
from sqlalchemy.orm import Session

from db.models import Empleado
from schemas.empleado_schema import EmpleadoCreate
from hexagonal.empleado.ports.employee_driven_port import EmployeeRepository


class SqlAlchemyEmployeeRepository(EmployeeRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, employee_data: Dict) -> Dict:
        empleado = Empleado(**employee_data)
        self.db.add(empleado)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado

    def get_all(self) -> List[Dict]:
        return self.db.query(Empleado).all()

    def get_by_id(self, id: int):
        return self.db.query(Empleado).filter(Empleado.id == id).first()

    def get_by_name(self, nombres: str):
        return self.db.query(Empleado).filter(Empleado.nombres == nombres).first()

    def update(self, id: int, employee_data: Dict):
        empleado = self.get_by_id(id)
        if not empleado:
            return None
        for key, value in employee_data.items():
            setattr(empleado, key, value)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado

    def delete(self, id: int):
        empleado = self.get_by_id(id)
        if empleado:
            self.db.delete(empleado)
            self.db.commit()
        return empleado
