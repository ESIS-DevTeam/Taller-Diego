"""Repositorio de acceso a datos para Venta.

Implementa las operaciones CRUD y consultas especializadas para Venta.
"""

from datetime import datetime

from sqlalchemy import Date, cast
from sqlalchemy.orm import Session

from db.models import Venta
from db.models import VentaProducto
from db.models import Producto



class VentaRepository:
    """Repositorio CRUD para Venta.

    Orquesta las operaciones de base de datos para Venta y VentaProducto.

    :ivar db: Sesión de SQLAlchemy.
    """

    def __init__(self, db: Session):
        """Inicializa el repositorio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.db = db

    def create(self, fecha: datetime):
        """Crea una venta sin productos (compatible hacia atrás).

        :param fecha: Fecha y hora de la venta.
        :returns: Instancia Venta creada.
        """

        # Backwards-compatible create (no products)
        venta = Venta(fecha=fecha)
        self.db.add(venta)
        self.db.commit()
        self.db.refresh(venta)
        return venta

    def create_with_products(self, fecha: datetime, productos: list[dict]):
        """Crea una venta con productos y actualiza stock.

        Valida disponibilidad de stock y decrementa cantidades.

        :param fecha: Fecha y hora de la venta.
        :param productos: Lista de dicts con producto_id y cantidad.
        :returns: Instancia Venta creada con relaciones.
        :raises ValueError: Si producto no existe o stock insuficiente.
        """

        venta = Venta(fecha=fecha)
        self.db.add(venta)
        try:
            # flush to get venta.id without committing
            self.db.flush()

            for item in productos:
                pid = item.get("producto_id")
                cantidad = item.get("cantidad", 0)
                if not pid or cantidad <= 0:
                    raise ValueError("Producto o cantidad inválida")

                producto = self.db.query(Producto).filter(Producto.id == pid).with_for_update().first()
                if not producto:
                    raise ValueError(f"Producto con id {pid} no existe")
                if producto.stock < cantidad:
                    raise ValueError(f"Stock insuficiente.")

                # create relation venta-producto
                vp = VentaProducto(venta_id=venta.id, producto_id=pid, cantidad=cantidad)
                self.db.add(vp)

                # update stock
                producto.stock = producto.stock - cantidad

            # commit everything
            self.db.commit()
            # refresh to load relationships
            self.db.refresh(venta)
            return venta
        except Exception:
            self.db.rollback()
            raise

    def get_all(self):
        """Obtiene todas las ventas.

        :returns: Lista de instancias Venta.
        """

        return self.db.query(Venta).all()

    def get_by_id(self, id: int):
        """Obtiene una venta por su identificador.

        :param id: Identificador de la venta.
        :returns: Instancia Venta o None si no existe.
        """

        return self.db.query(Venta).filter(Venta.id == id).first()

    def delete(self, id: int):
        """Elimina una venta.

        :param id: Identificador de la venta a eliminar.
        :returns: True si fue eliminada, False si no existe.
        """

        venta = self.get_by_id(id)
        if venta:
            self.db.delete(venta)
            self.db.commit()
            return True
        return False

    def get_by_fecha(self, fecha: datetime):
        """Obtiene ventas por fecha.

        :param fecha: Fecha a consultar.
        :returns: Lista de instancias Venta de esa fecha.
        """

        return self.db.query(Venta).filter(
            cast(Venta.fecha, Date) == fecha.date()
        ).all()
