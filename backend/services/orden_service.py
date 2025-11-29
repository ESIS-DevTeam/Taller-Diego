"""Servicio de negocio para Orden.

Orquesta la lógica de negocio y validaciones de orden.
"""

from sqlalchemy.orm import Session
from repositories.orden_repo import OrdenRepository
from schemas.orden_schema import OrdenCreate
from fastapi import HTTPException

class OrdenService:
    """Servicio CRUD para Orden.

    Implementa reglas de negocio y validaciones específicas de orden.

    :ivar repo: Instancia de OrdenRepository.
    """

    def __init__(self, db: Session):
        """Inicializa el servicio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.repo = OrdenRepository(db)

    def create_orden(self, data: OrdenCreate):
        """Crea una nueva orden.

        Procesa la orden con sus servicios y empleados asociados.

        :param data: Datos de creación de la orden.
        :returns: Instancia de Orden creada.
        :raises HTTPException: 400 si hay errores de validación.
        """

        servicios = getattr(data, "servicios", None)
        empleados = getattr(data, "empleados", None)

        servicios_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in servicios] if servicios else []
        empleados_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in empleados] if empleados else []

        # Si hay servicios o empleados asociados, crear con relaciones
        if servicios_list or empleados_list:
            try:
                return self.repo.create_with_services(
                    data.garantia,
                    data.estadoPago,
                    data.precio,
                    data.fecha,
                    servicios_list,
                    empleados_list,
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

        # Caso simple: solo la orden
        return self.repo.create(data.garantia, data.estadoPago, data.precio, data.fecha)

    def list_ordens(self):
        """Obtiene todas las órdenes.

        :returns: Lista de instancias Orden.
        """

        return self.repo.get_all()

    def get_by_id(self, id: int):
        """Obtiene una orden por su identificador.

        :param id: Identificador de la orden.
        :returns: Instancia Orden o None si no existe.
        """

        return self.repo.get_by_id(id)

    def get_by_fecha(self, fecha):
        """Obtiene órdenes por fecha.

        :param fecha: Fecha a consultar.
        :returns: Lista de órdenes de esa fecha.
        """

        return self.repo.get_by_fecha(fecha)

    def delete_orden(self, id: int):
        """Elimina una orden.

        :param id: Identificador de la orden a eliminar.
        :returns: True si fue eliminada, False si no existe.
        """

        return self.repo.delete(id)