from datetime import datetime, timezone
from typing import List

from backend.core.value_objects import Cantidad, CantidadProductos


class Venta:
    """Modelo de dominio puro para `Venta` (Aggregate Root).

    Esta clase no depende de SQLAlchemy y puede usarse en tests
    y en implementaciones de repositorios que actúen como adaptadores.
    """

    def __init__(self, fecha: datetime | None = None, productos: List[object] | None = None):
        self.id = None
        self.fecha = fecha or datetime.now(timezone.utc)
        # Permitir compartir la lista de productos con el adaptador de persistencia
        self.productos: List[object] = productos if productos is not None else []

    def agregar_producto(self, venta_producto: object) -> None:
        cantidad_vo = Cantidad(venta_producto.cantidad)
        self.productos.append(venta_producto)

    def remover_producto(self, venta_producto: object) -> None:
        if venta_producto in self.productos:
            self.productos.remove(venta_producto)

    def obtener_cantidad_productos(self) -> int:
        cantidad_vo = CantidadProductos(len(self.productos))
        return cantidad_vo.value

    def tiene_productos(self) -> bool:
        cantidad_vo = CantidadProductos(len(self.productos))
        return not cantidad_vo.es_vacia()

    def obtener_fecha(self) -> datetime:
        return self.fecha

    def calcular_total(self) -> float:
        total = 0.0
        for vp in self.productos:
            if hasattr(vp, 'producto') and vp.producto:
                precio_venta = getattr(vp.producto, 'precioVenta', 0)
                total += vp.cantidad * precio_venta
        return total

    def obtener_cantidad_total_items(self) -> int:
        total_items = sum(vp.cantidad for vp in self.productos)
        if total_items > 0:
            CantidadProductos(total_items)
        return total_items
