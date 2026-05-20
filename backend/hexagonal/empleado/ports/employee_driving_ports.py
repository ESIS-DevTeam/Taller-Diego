from abc import ABC, abstractmethod
from typing import Dict, List


class CreateEmployeePort(ABC):
    @abstractmethod
    def create_employee(self, employee_data: Dict) -> Dict: ...


class ListEmployeesPort(ABC):
    @abstractmethod
    def list_employees(self) -> List[Dict]: ...


class GetEmployeePort(ABC):
    @abstractmethod
    def get_by_id(self, id: int) -> Dict | None: ...


class UpdateEmployeePort(ABC):
    @abstractmethod
    def update_employee(self, id: int, employee_data: Dict) -> Dict | None: ...


class DeleteEmployeePort(ABC):
    @abstractmethod
    def delete_employee(self, id: int) -> Dict | None: ...
