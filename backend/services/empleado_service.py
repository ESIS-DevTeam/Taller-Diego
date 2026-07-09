"""Compatibilidad: clase `EmpleadoService` que envuelve el UseCase hexagonal
pero mantiene la API existente (acepta `db: Session` en el constructor).
"""

from sqlalchemy.orm import Session
from hexagonal.empleado.usecases.employee_usecase import EmployeeUseCase
from repositories.empleado_repo import EmpleadoRepository
from db.models.orden_trabajo import OrdenTrabajo
from db.models.orden_empleado import OrdenEmpleado


class EmpleadoService:
	def __init__(self, db: Session):
		self._db = db
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

	def tiene_servicios(self, id: int) -> bool:
		"""Indica si el empleado tiene órdenes o servicios registrados."""
		en_ordenes_trabajo = (self._db.query(OrdenTrabajo.id)
			.filter(OrdenTrabajo.mecanico_id == id).first())
		en_ordenes_clasicas = (self._db.query(OrdenEmpleado.id)
			.filter(OrdenEmpleado.empleado_id == id).first())
		return bool(en_ordenes_trabajo or en_ordenes_clasicas)

	def delete_empleado(self, id: int):
		"""Elimina un empleado.

		Caso especial: si tiene servicios registrados NO se elimina
		(se perdería el historial); se debe desactivar en su lugar.
		"""
		empleado = self._usecase.get_by_id(id)
		if not empleado:
			return None
		if self.tiene_servicios(id):
			raise ValueError(
				"No se puede eliminar: el mecánico tiene servicios registrados en el historial. "
				"Puedes desactivarlo para que no reciba nuevas órdenes.")
		return self._usecase.delete_employee(id)

__all__ = ["EmpleadoService"]
