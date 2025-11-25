"""Repositorio de Órdenes - Refactorizado con Genéricos"""
from sqlalchemy.orm import Session
from db.models import Orden
from sqlalchemy import Date, cast
from db.models import OrdenServicio, Servicio
from db.models import OrdenEmpleado, Empleado
from repositories.base_repository import BaseRepository


class OrdenRepository(BaseRepository[Orden]):
    """
    Repositorio específico para Órdenes.
    Hereda operaciones CRUD básicas y agrega lógica compleja de transacciones.
    """
    
    def __init__(self, db: Session):
        super().__init__(Orden, db)

    def create_simple(self, garantia: int, estadoPago: str, precio: int, fecha):
        """Crea una orden simple sin servicios ni empleados."""
        orden = Orden(garantia=garantia, estadoPago=estadoPago, precio=precio, fecha=fecha)
        return super().create(orden)

    def create_with_services(self, garantia: int, estadoPago: str, precio: int, fecha, servicios: list[dict], empleados: list[dict] | None = None):
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

    def get_by_fecha(self, fecha):
        return self.db.query(Orden).filter(
            cast(Orden.fecha, Date) == fecha
        ).all()