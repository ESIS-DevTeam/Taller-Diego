from abc import ABC, abstractmethod
from datetime import datetime
from typing import List


class CreateVentaPort(ABC):
    @abstractmethod
    def create_venta(self, data) : ...


class ListVentasPort(ABC):
    @abstractmethod
    def list_ventas(self) -> List: ...


class GetVentaPort(ABC):
    @abstractmethod
    def get_by_id(self, id: int): ...


class UpdateVentaPort(ABC):
    @abstractmethod
    def update_venta(self, id: int, data): ...


class DeleteVentaPort(ABC):
    @abstractmethod
    def delete_venta(self, id: int): ...
