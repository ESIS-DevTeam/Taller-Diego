from typing import List

from hexagonal.venta.ports.venta_driven_port import VentaRepository
from hexagonal.venta.ports.venta_driving_ports import (
    CreateVentaPort,
    ListVentasPort,
    GetVentaPort,
    UpdateVentaPort,
    DeleteVentaPort,
)


class VentaUseCase(CreateVentaPort, ListVentasPort, GetVentaPort, UpdateVentaPort, DeleteVentaPort):
    def __init__(self, repository: VentaRepository):
        self.repository = repository

    def create_venta(self, data):
        productos = getattr(data, "productos", None)
        if productos:
            productos_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in productos]
            return self.repository.create_with_products(data.fecha, productos_list)
        return self.repository.create(data.fecha)

    def list_ventas(self) -> List:
        return self.repository.get_all()

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def update_venta(self, id: int, data):
        # Not implemented: delegate to repository.save if needed
        venta = self.repository.get_by_id(id)
        if not venta:
            return None
        # apply changes naively
        for k, v in (data.items() if isinstance(data, dict) else []):
            setattr(venta, k, v)
        return self.repository.save(venta)

    def delete_venta(self, id: int):
        return self.repository.delete(id)
