"""Compatibilidad: clase `EmpleadoService` que envuelve el UseCase hexagonal
pero mantiene la API existente (acepta `db: Session` en el constructor).
"""

from sqlalchemy.orm import Session
from hexagonal.empleado.usecases.employee_usecase import EmployeeUseCase
from repositories.empleado_repo import EmpleadoRepository


class EmpleadoService:
	def __init__(self, db: Session):
		repo = EmpleadoRepository(db)
		self._usecase = EmployeeUseCase(repo)

	def create_empleado(self, data):
		return self._usecase.create_employee(data.model_dump() if hasattr(data, 'model_dump') else data)

	def list_empleados(self):
		return self._usecase.list_employees()

	def get_by_id(self, id: int):
		return self._usecase.get_by_id(id)

	def update_empleado(self, id: int, data):
		payload = data.model_dump(exclude_unset=True) if hasattr(data, 'model_dump') else data
		return self._usecase.update_employee(id, payload)

	def delete_empleado(self, id: int):
		return self._usecase.delete_employee(id)

__all__ = ["EmpleadoService"]