"""Servicio de negocio para Venta.

Orquesta la lógica de negocio y validaciones de venta.
"""

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.venta_repo import VentaRepository
from schemas.venta_schema import VentaCreate



class VentaService:
    """Servicio CRUD para Venta.

    Implementa reglas de negocio y validaciones específicas de venta.

    :ivar repo: Instancia de VentaRepository.
    """

    def __init__(self, db: Session):
        """Inicializa el servicio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.repo = VentaRepository(db)

    def create_venta(self, data: VentaCreate):
        """Crea una nueva venta.

        Procesa la venta con sus productos y maneja validaciones de stock.

        :param data: Datos de creación de la venta.
        :returns: Instancia de Venta creada.
        :raises HTTPException: 400 si hay errores de stock o validación.
        """

        productos = getattr(data, "productos", None)
        if productos:
            productos_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in productos]
            try:
                return self.repo.create_with_products(data.fecha, productos_list)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
        return self.repo.create(data.fecha)

    def list_ventas(self):
        """Obtiene todas las ventas.

        :returns: Lista de instancias Venta.
        """

        return self.repo.get_all()

    def get_by_id(self, id: int):
        """Obtiene una venta por su identificador.

        :param id: Identificador de la venta.
        :returns: Instancia Venta o None si no existe.
        """

        return self.repo.get_by_id(id)

    def get_by_fecha(self, fecha: datetime):
        """Obtiene ventas por fecha.

        :param fecha: Fecha a consultar.
        :returns: Lista de ventas de esa fecha.
        """

        return self.repo.get_by_fecha(fecha)

    def delete_venta(self, id: int):
        """Elimina una venta.

        :param id: Identificador de la venta a eliminar.
        :returns: True si fue eliminada, False si no existe.
        """

        return self.repo.delete(id)
