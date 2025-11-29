"""Repositorio de acceso a datos para Orden.

Implementa las operaciones CRUD y consultas especializadas para Orden.
"""

from sqlalchemy.orm import Session
from db.models import Orden
from sqlalchemy import Date, cast
from db.models import OrdenServicio, Servicio
from db.models import OrdenEmpleado, Empleado

class OrdenRepository:
    """Repositorio CRUD para Orden.

    Orquesta las operaciones de base de datos para Orden y sus relaciones.

    :ivar db: Sesión de SQLAlchemy.
    """

    def __init__(self, db: Session):
        """Inicializa el repositorio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.db = db

    def create(self, garantia: int, estadoPago: str, precio: int, fecha):
        """Crea una orden sin servicios ni empleados.

        :param garantia: Período de garantía.
        :param estadoPago: Estado de pago.
        :param precio: Precio de la orden.
        :param fecha: Fecha de la orden.
        :returns: Instancia Orden creada.
        """

        orden = Orden(garantia=garantia, estadoPago=estadoPago, precio=precio, fecha=fecha)
        self.db.add(orden)
        self.db.commit()
        self.db.refresh(orden)
        return orden

    def create_with_services(self, garantia: int, estadoPago: str, precio: int, fecha, servicios: list[dict], empleados: list[dict] | None = None):
        """Crea una orden con servicios y empleados asociados.

        Valida existencia de servicios y empleados.

        :param garantia: Período de garantía.
        :param estadoPago: Estado de pago.
        :param precio: Precio de la orden.
        :param fecha: Fecha de la orden.
        :param servicios: Lista de dicts con servicio_id y precio_servicio.
        :param empleados: Lista de dicts con empleado_id (opcional).
        :returns: Instancia Orden creada con relaciones.
        :raises ValueError: Si servicio o empleado no existen.
        """

        orden = Orden(garantia=garantia, estadoPago=estadoPago, precio=precio, fecha=fecha)
        self.db.add(orden)
        try:
            # flush to get orden.id without committing
            self.db.flush()

            for item in servicios:
                sid = item.get("servicio_id")
                precio_servicio = item.get("precio_servicio")
                if not sid or precio_servicio is None:
                    raise ValueError("Servicio o precio_servicio inválido")

                servicio = self.db.query(Servicio).filter(Servicio.id == sid).first()
                if not servicio:
                    raise ValueError(f"Servicio con id {sid} no existe")

                # create relation orden-servicio
                os = OrdenServicio(orden_id=orden.id, servicio_id=sid, precio_servicio=precio_servicio)
                self.db.add(os)

            # asociar empleados si vienen
            if empleados:
                for item in empleados:
                    eid = item.get("empleado_id")
                    if not eid:
                        raise ValueError("empleado_id inválido")
                    empleado = self.db.query(Empleado).filter(Empleado.id == eid).first()
                    if not empleado:
                        raise ValueError(f"Empleado con id {eid} no existe")

                    oe = OrdenEmpleado(orden_id=orden.id, empleado_id=eid)
                    self.db.add(oe)

            # commit everything
            self.db.commit()
            # refresh to load relationships
            self.db.refresh(orden)
            return orden
        except Exception:
            self.db.rollback()
            raise

    def get_all(self):
        """Obtiene todas las órdenes.

        :returns: Lista de instancias Orden.
        """

        return self.db.query(Orden).all()

    def get_by_id(self, id: int):
        """Obtiene una orden por su identificador.

        :param id: Identificador de la orden.
        :returns: Instancia Orden o None si no existe.
        """

        return self.db.query(Orden).filter(Orden.id == id).first()

    def delete(self, id: int):
        """Elimina una orden.

        :param id: Identificador de la orden a eliminar.
        :returns: True si fue eliminada, False si no existe.
        """

        orden = self.get_by_id(id)
        if orden:
            self.db.delete(orden)
            self.db.commit()
            return True
        return False

    def get_by_fecha(self, fecha):
        """Obtiene órdenes por fecha.

        :param fecha: Fecha a consultar.
        :returns: Lista de instancias Orden de esa fecha.
        """

        return self.db.query(Orden).filter(
            cast(Orden.fecha, Date) == fecha
        ).all()