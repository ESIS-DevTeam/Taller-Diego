import pytest
from datetime import datetime
from backend.domain.venta import Venta
from backend.repositories.inmemory.venta_inmemory_repo import InMemoryVentaRepository

@pytest.mark.integration
class TestIntegracionVenta:
    
    def setup_method(self):
        # 1. ARRANGE: Inicializamos nuestro adaptador secundario (Repositorio en memoria)
        # Esto simula nuestra base de datos, reseteándose en cada prueba (beforeEach)
        self.repositorio_db = InMemoryVentaRepository()

    def test_guardar_y_recuperar_venta_integramente(self):
        # Arrange: Entidad originada en el Dominio
        fecha_actual = datetime.now()
        
        # Act: Delegación al adaptador secundario (el repositorio guarda en RAM)
        venta_guardada = self.repositorio_db.create(fecha_actual)
        
        # Recuperamos la venta desde nuestra base de datos simulada usando el ID que nos dio
        venta_recuperada = self.repositorio_db.get_by_id(venta_guardada.id)

        # Assert: Validación de persistencia de la identidad
        assert venta_recuperada is not None, "La venta debería haberse guardado en la base de datos"
        assert venta_recuperada.id == venta_guardada.id, "El ID de la venta recuperada debe coincidir"
        assert venta_recuperada.fecha == fecha_actual, "La fecha debe mantenerse intacta tras guardarse"

    def test_guardar_venta_con_productos_calcula_total(self):
        # Arrange: Preparamos los datos crudos que enviaríamos desde la API (Controlador HTTP)
        fecha_actual = datetime.now()
        productos_comprados = [
            {'producto_id': 1, 'cantidad': 2, 'precio': 50.0},  # Total: 100
            {'producto_id': 2, 'cantidad': 1, 'precio': 150.0}  # Total: 150
        ]
        
        # Act: El adaptador convierte estos datos, arma el Agregado Venta y lo persiste
        venta_guardada = self.repositorio_db.create_with_products(fecha_actual, productos_comprados)
        total_pagar = venta_guardada.calcular_total() # Operación del núcleo de dominio
        
        # Assert: Comprobamos que el repositorio y el dominio trabajan bien juntos
        assert total_pagar == 250.0, "El total calculado después de guardar debe ser 250.0"
        assert venta_guardada.obtener_cantidad_productos() == 2, "Debe tener 2 productos registrados"
        
        # Verificamos que si se puede extraer y los datos siguen siendo válidos
        venta_extraida = self.repositorio_db.get_by_id(venta_guardada.id)
        assert len(venta_extraida.productos) == 2, "La venta extraída debe traer sus detalles"