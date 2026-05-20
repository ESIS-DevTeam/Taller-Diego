from datetime import datetime
from typing import List

from hexagonal.venta.ports.venta_driven_port import VentaRepository
from backend.domain.venta import Venta


class InMemoryVentaRepository(VentaRepositoryInterface):
    def __init__(self):
        self._store: List[Venta] = []
        self._next_id = 1

    def create(self, fecha: datetime):
        venta = Venta(fecha=fecha)
        venta.id = self._next_id
        self._next_id += 1
        self._store.append(venta)
        return venta

    def create_with_products(self, fecha: datetime, productos: list[dict]):
        venta = self.create(fecha)
        for item in productos:
            pid = item.get('producto_id')
            cantidad = item.get('cantidad', 0)
            vp = type('VP', (), {})()
            vp.producto = type('P', (), {'id': pid, 'precioVenta': item.get('precio', 0)})()
            vp.cantidad = cantidad
            venta.agregar_producto(vp)
        return venta

    def save(self, venta):
        for i, v in enumerate(self._store):
            if v.id == venta.id:
                self._store[i] = venta
                return venta
        venta.id = self._next_id
        self._next_id += 1
        self._store.append(venta)
        return venta

    def get_all(self):
        return list(self._store)

    def get_by_id(self, id: int):
        for v in self._store:
            if v.id == id:
                return v
        return None

    def delete(self, id: int):
        for v in self._store:
            if v.id == id:
                self._store.remove(v)
                return True
        return False

    def get_by_fecha(self, fecha: datetime):
        return [v for v in self._store if v.fecha.date() == fecha.date()]
