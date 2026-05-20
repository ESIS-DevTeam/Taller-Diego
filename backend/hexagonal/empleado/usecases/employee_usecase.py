from typing import Dict, List

from hexagonal.empleado.ports.employee_driven_port import EmployeeRepository
from hexagonal.empleado.ports.employee_driving_ports import (
    CreateEmployeePort,
    ListEmployeesPort,
    GetEmployeePort,
    UpdateEmployeePort,
    DeleteEmployeePort,
)


class EmployeeUseCase(CreateEmployeePort, ListEmployeesPort, GetEmployeePort, UpdateEmployeePort, DeleteEmployeePort):
    def __init__(self, repository: EmployeeRepository):
        self.repository = repository

    def create_employee(self, employee_data: Dict) -> Dict:
        if self.repository.get_by_name(employee_data.get("nombres")):
            raise ValueError("Ya existe un empleado con ese nombre")
        return self.repository.create(employee_data)

    def list_employees(self) -> List[Dict]:
        return self.repository.get_all()

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def update_employee(self, id: int, employee_data: Dict):
        return self.repository.update(id, employee_data)

    def delete_employee(self, id: int):
        return self.repository.delete(id)
