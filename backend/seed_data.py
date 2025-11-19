"""
Script para poblar la base de datos con datos de prueba
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from db.base import engine, Base
from db.models.producto import Producto
from db.models.autoparte import Autoparte
from db.models.servicio import Servicio
from db.models.empleado import Empleado

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

def seed_database():
    """Pobla la base de datos con datos de prueba"""
    from db.base import SessionLocal
    db = SessionLocal()
    
    try:
        # Limpiar datos existentes (opcional, descomenta si quieres empezar de cero)
        # db.query(Producto).delete()
        # db.query(Servicio).delete()
        # db.query(Empleado).delete()
        # db.commit()
        
        # ============= PRODUCTOS =============
        print("📦 Cargando productos...")
        productos = [
            Producto(
                nombre="Aceite Motor 10W40",
                descripcion="Aceite de motor sintético",
                precioVenta=45000,
                precioCompra=30000,
                marca="Castrol",
                categoria="Fluidos",
                stock=50,
                stockMin=10,
                tipo="producto"
            ),
            Producto(
                nombre="Filtro Aire",
                descripcion="Filtro de aire para motor",
                precioVenta=25000,
                precioCompra=15000,
                marca="Mann",
                categoria="Filtros",
                stock=40,
                stockMin=5,
                tipo="producto"
            ),
            Producto(
                nombre="Pastillas Freno",
                descripcion="Pastillas de freno delantera",
                precioVenta=80000,
                precioCompra=50000,
                marca="Brembo",
                categoria="Frenos",
                stock=30,
                stockMin=5,
                tipo="producto"
            ),
            Producto(
                nombre="Correa Serpentín",
                descripcion="Correa de distribución",
                precioVenta=120000,
                precioCompra=75000,
                marca="Gates",
                categoria="Correas",
                stock=15,
                stockMin=3,
                tipo="producto"
            ),
            Producto(
                nombre="Batería Auto",
                descripcion="Batería 12V 60Ah",
                precioVenta=250000,
                precioCompra=180000,
                marca="Bosch",
                categoria="Eléctrico",
                stock=25,
                stockMin=5,
                tipo="producto"
            ),
        ]
        
        for producto in productos:
            db_producto = db.query(Producto).filter(Producto.nombre == producto.nombre).first()
            if not db_producto:
                db.add(producto)
        
        db.commit()
        print(f"✅ {len(productos)} productos cargados")
        
        # ============= AUTOPARTES =============
        print("🚗 Cargando autopartes...")
        autopartes = [
            Autoparte(
                nombre="Faro Delantero Mazda 3",
                descripcion="Faro LED delantero",
                precioVenta=450000,
                precioCompra=300000,
                marca="Mazda",
                categoria="Iluminación",
                stock=12,
                stockMin=2,
                modelo="Mazda 3",
                anio=2020,
                tipo="autoparte"
            ),
            Autoparte(
                nombre="Espejo Lateral Hyundai i10",
                descripcion="Espejo retrovisor externo",
                precioVenta=180000,
                precioCompra=120000,
                marca="Hyundai",
                categoria="Espejos",
                stock=20,
                stockMin=3,
                modelo="Hyundai i10",
                anio=2022,
                tipo="autoparte"
            ),
            Autoparte(
                nombre="Puerta Toyota Corolla",
                descripcion="Puerta delantera derecha",
                precioVenta=900000,
                precioCompra=600000,
                marca="Toyota",
                categoria="Carrocería",
                stock=5,
                stockMin=1,
                modelo="Toyota Corolla",
                anio=2019,
                tipo="autoparte"
            ),
        ]
        
        for autoparte in autopartes:
            db_autoparte = db.query(Autoparte).filter(Autoparte.nombre == autoparte.nombre).first()
            if not db_autoparte:
                db.add(autoparte)
        
        db.commit()
        print(f"✅ {len(autopartes)} autopartes cargadas")
        
        # ============= SERVICIOS =============
        print("🔧 Cargando servicios...")
        servicios = [
            Servicio(
                nombre="Cambio de Aceite",
                descripcion="Cambio de aceite y filtro de motor"
            ),
            Servicio(
                nombre="Alineación",
                descripcion="Alineación de ruedas 4 ejes"
            ),
            Servicio(
                nombre="Balanceo",
                descripcion="Balanceo dinámico de llantas"
            ),
            Servicio(
                nombre="Reparación Frenos",
                descripcion="Revisión y reparación del sistema de frenos"
            ),
            Servicio(
                nombre="Diagnóstico Computarizado",
                descripcion="Diagnóstico electrónico completo del vehículo"
            ),
        ]
        
        for servicio in servicios:
            db_servicio = db.query(Servicio).filter(Servicio.nombre == servicio.nombre).first()
            if not db_servicio:
                db.add(servicio)
        
        db.commit()
        print(f"✅ {len(servicios)} servicios cargados")
        
        # ============= EMPLEADOS =============
        print("👷 Cargando empleados...")
        empleados = [
            Empleado(
                nombres="Juan",
                apellidos="García",
                especialidad="Mecánico General",
                estado="activo"
            ),
            Empleado(
                nombres="María",
                apellidos="López",
                especialidad="Electricista Automotriz",
                estado="activo"
            ),
            Empleado(
                nombres="Carlos",
                apellidos="Martínez",
                especialidad="Pintor",
                estado="activo"
            ),
            Empleado(
                nombres="Ana",
                apellidos="Rodríguez",
                especialidad="Enderezadora",
                estado="activo"
            ),
            Empleado(
                nombres="Pedro",
                apellidos="Sánchez",
                especialidad="Mecánico Motor",
                estado="activo"
            ),
        ]
        
        for empleado in empleados:
            db_empleado = db.query(Empleado).filter(Empleado.nombres == empleado.nombres).first()
            if not db_empleado:
                db.add(empleado)
        
        db.commit()
        print(f"✅ {len(empleados)} empleados cargados")
        
        print("\n🎉 ¡Base de datos poblada correctamente!")
        
    except Exception as e:
        print(f"❌ Error al cargar datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
