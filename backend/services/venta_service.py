"""Compatibilidad: wrapper `VentaService` que mantiene la API existente
pero delega en la implementación hexagonal.
"""

from sqlalchemy.orm import Session
from hexagonal.venta.usecases.venta_usecase import VentaUseCase
from repositories.venta_repo import VentaRepository


class VentaService:
	def __init__(self, db: Session | None = None, repo: VentaRepository | None = None):
		if repo is not None:
			self.repo = repo
		elif db is not None:
			self.repo = VentaRepository(db)
		else:
			raise ValueError("Se debe pasar `db` o `repo` al inicializar VentaService")
		self._usecase = VentaUseCase(self.repo)

	def create_venta(self, data):
		return self._usecase.create_venta(data)

	def list_ventas(self):
		return self._usecase.list_ventas()

	def get_by_id(self, id: int):
		return self._usecase.get_by_id(id)

	def get_by_fecha(self, fecha):
		return self._usecase.repository.get_by_fecha(fecha)

	def delete_venta(self, id: int):
		return self._usecase.delete_venta(id)

	def obtener_total_venta(self, id: int) -> float:
		venta = self._usecase.get_by_id(id)
		if not venta:
			raise ValueError("Venta no encontrada")
		return venta.calcular_total()

	def obtener_resumen_venta(self, id: int) -> dict:
		venta = self._usecase.get_by_id(id)
		if not venta:
			raise ValueError("Venta no encontrada")
		return {
			"id": venta.id,
			"fecha": venta.obtener_fecha(),
			"cantidad_productos": venta.obtener_cantidad_productos(),
			"cantidad_items_totales": venta.obtener_cantidad_total_items(),
			"total": venta.calcular_total(),
			"tiene_productos": venta.tiene_productos()
		}

__all__ = ["VentaService"]
