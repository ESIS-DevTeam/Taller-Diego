"""Siembra datos de ejemplo para desarrollo con base local (SQLite).

Uso (PowerShell):
    $env:PYTHONPATH = "backend"
    $env:DATABASE_URL = "sqlite:///./taller_local.db"
    python backend/database.py       # crea tablas
    python backend/seed_local.py     # siembra datos de ejemplo

No afecta a Supabase: solo escribe en la base indicada por DATABASE_URL.
"""
from db.base import SessionLocal, engine
import db.models  # registra todos los modelos
from db.models import Producto, Autoparte, Servicio, Empleado


def seed():
    db = SessionLocal()
    try:
        if db.query(Producto).count() > 0:
            print("La base ya tiene datos, no se vuelve a sembrar.")
            return

        # --- Productos / autopartes ---
        productos = [
            Producto(nombre="Aceite 10W-40 sintético", descripcion="Bidón 1L",
                     precioVenta=8000, precioCompra=5000, marca="Mobil",
                     categoria="Aceites", stock=40, stockMin=8,
                     codBarras="T-AC-1040", tipo="producto"),
            Producto(nombre="Filtro de aceite estándar", descripcion="",
                     precioVenta=12000, precioCompra=7000, marca="Bosch",
                     categoria="Filtros", stock=25, stockMin=5,
                     codBarras="T-FA-001", tipo="producto"),
            Producto(nombre="Filtro de aire", descripcion="",
                     precioVenta=15000, precioCompra=9000, marca="K&N",
                     categoria="Filtros", stock=18, stockMin=5,
                     codBarras="T-FI-002", tipo="producto"),
        ]
        db.add_all(productos)

        autopartes = [
            Autoparte(nombre="Buje de bandeja delantero", descripcion="",
                      precioVenta=18000, precioCompra=11000, marca="SKF",
                      categoria="Suspensión", stock=12, stockMin=4,
                      codBarras="T-BJ-100", tipo="autoparte",
                      modelo="Corolla", anio="2015-2022"),
            Autoparte(nombre="Terminal de dirección", descripcion="",
                      precioVenta=12000, precioCompra=7500, marca="555",
                      categoria="Dirección", stock=10, stockMin=3,
                      codBarras="T-TD-101", tipo="autoparte",
                      modelo="Versa", anio="2012-2019"),
            Autoparte(nombre="Amortiguador delantero", descripcion="",
                      precioVenta=65000, precioCompra=42000, marca="Monroe",
                      categoria="Suspensión", stock=8, stockMin=2,
                      codBarras="T-AM-102", tipo="autoparte",
                      modelo="Universal", anio="2010-2023"),
        ]
        db.add_all(autopartes)

        # --- Servicios del catálogo ---
        servicios = [
            Servicio(nombre="Cambio de aceite y filtro",
                     descripcion="Cambio de aceite de motor y filtro."),
            Servicio(nombre="Alineación y balanceo",
                     descripcion="Alineación de dirección y balanceo de ruedas."),
            Servicio(nombre="Cambio de bujes de bandeja",
                     descripcion="Reemplazo de bujes de la bandeja de suspensión."),
            Servicio(nombre="Revisión de terminales de dirección",
                     descripcion="Diagnóstico y ajuste de terminales."),
            Servicio(nombre="Reparación de suspensión",
                     descripcion="Cambio de amortiguadores y componentes."),
        ]
        db.add_all(servicios)

        # --- Mecánicos ---
        mecanicos = [
            Empleado(nombres="Sebastián", apellidos="Tapia", estado="activo",
                     especialidad="Motor y suspensión", documento="12.345.678-9",
                     telefono="911 222 333", correo="s.tapia@taller.cl"),
            Empleado(nombres="Esteban", apellidos="Saavedra", estado="activo",
                     especialidad="Frenos y dirección", documento="18.999.111-2",
                     telefono="922 333 444", correo="e.saavedra@taller.cl"),
            Empleado(nombres="Rosa", apellidos="Morales", estado="inactivo",
                     especialidad="Diagnóstico", documento="15.222.333-4",
                     telefono="933 222 111", correo=None),
        ]
        db.add_all(mecanicos)

        db.commit()
        print("Datos de ejemplo sembrados:")
        print(f"  {len(productos)} productos + {len(autopartes)} autopartes")
        print(f"  {len(servicios)} servicios")
        print(f"  {len(mecanicos)} mecánicos")
    except Exception as e:
        db.rollback()
        print("Error al sembrar:", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
