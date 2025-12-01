"""
Script para insertar datos de productos en la base de datos.

Este script carga productos y autopartes de ejemplo para llenar el inventario
del sistema. Útil para pruebas y desarrollo.

Uso:
    python seed_productos.py

:author: Backend Team
:version: 1.0
"""

import sys
import os

# Añadir backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from db.base import engine
from db.models import Producto, Autoparte
from datetime import datetime


def seed_productos():
    """
    Inserta datos de productos y autopartes en la base de datos.
    
    Crea una sesión y añade ~200 productos de ejemplo con diferentes categorías
    y autopartes específicas para vehículos variados.
    
    :returns: Número de productos insertados
    :rtype: int
    """
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Verificar si ya existen datos
        producto_count = session.query(Producto).count()
        if producto_count > 0:
            print(f"⚠️  Ya existen {producto_count} productos en la base de datos.")
            respuesta = input("¿Deseas continuar? (s/n): ")
            if respuesta.lower() != 's':
                print("Operación cancelada.")
                return 0
        
        # Categorías y productos
        categorias_productos = {
            "Lubricantes": [
                ("Aceite Sintético 5W30", "Aceite de motor sintético de alta calidad", 85000, 60000, "Mobil"),
                ("Aceite Sintético 10W40", "Aceite de motor para clima cálido", 78000, 55000, "Castrol"),
                ("Aceite Mineral 15W40", "Aceite mineral estándar", 45000, 32000, "Shell"),
                ("Aceite Premium 0W20", "Aceite de baja viscosidad para motores modernos", 95000, 68000, "Mobil"),
                ("Aceite Semi-Sintético 5W40", "Aceite semi-sintético balanceado", 65000, 48000, "Total"),
            ],
            "Filtros": [
                ("Filtro de Aire", "Filtro de aire OEM de reemplazo", 35000, 25000, "Fram"),
                ("Filtro de Aire Premium", "Filtro de aire de alto rendimiento", 45000, 32000, "Bosch"),
                ("Filtro de Cabin", "Filtro de aire acondicionado", 28000, 20000, "Fram"),
                ("Filtro de Gasolina", "Filtro de combustible", 22000, 16000, "Wix"),
                ("Filtro de Diesel", "Filtro para motores diesel", 38000, 28000, "Mann"),
                ("Juego de Filtros", "Combo filtro aire + aceite + cabin", 120000, 85000, "Fram"),
            ],
            "Sistema de Frenos": [
                ("Pastillas de Freno Cerámicas", "Pastillas de freno cerámicas de bajo ruido", 125000, 90000, "Brembo"),
                ("Pastillas de Freno Orgánicas", "Pastillas orgánicas de buena frenada", 95000, 68000, "TRW"),
                ("Pastillas de Freno Racing", "Pastillas de alto rendimiento", 180000, 130000, "Brembo"),
                ("Discos de Freno", "Discos de freno ventilados", 165000, 120000, "Brembo"),
                ("Líquido de Frenos DOT4", "Líquido de frenos de alta temperatura", 35000, 25000, "Bosch"),
                ("Cilindro Maestro Freno", "Cilindro maestro completo", 285000, 200000, "TRW"),
            ],
            "Electricidad": [
                ("Batería 12V 60Ah", "Batería automotriz de 60 amperios/hora", 250000, 180000, "Bosch"),
                ("Batería 12V 70Ah", "Batería de mayor capacidad", 280000, 200000, "Exell"),
                ("Batería 12V 50Ah", "Batería compacta", 220000, 160000, "Bosch"),
                ("Alternador", "Alternador de carga para batería", 380000, 270000, "Bosch"),
                ("Motor Arranque", "Motor de arranque completo", 350000, 250000, "Bosch"),
                ("Relé Automotriz", "Relé de diferentes amperajes", 15000, 10000, "Siemens"),
                ("Fusibles Automotrices", "Juego de fusibles variados", 12000, 8000, "Bussmann"),
            ],
            "Motor": [
                ("Bujías NGK", "Bujías de encendido de platino", 28000, 20000, "NGK"),
                ("Bujías Bosch", "Bujías de encendido premium", 32000, 23000, "Bosch"),
                ("Cables de Bujías", "Juego de cables de bujías", 55000, 40000, "NGK"),
                ("Correa de Distribución", "Correa de distribución con dientes", 180000, 130000, "Gates"),
                ("Tensor Correa", "Tensor de distribución", 95000, 68000, "Dayco"),
                ("Juego de Empaques Motor", "Empaques completos para motor", 250000, 180000, "Elring"),
                ("Válvula EGR", "Válvula de recirculación", 145000, 105000, "Pierburg"),
            ],
            "Refrigeración": [
                ("Líquido Refrigerante Rojo", "Refrigerante anticongelante rojo", 45000, 32000, "Motorex"),
                ("Líquido Refrigerante Verde", "Refrigerante anticongelante verde", 42000, 30000, "Motorex"),
                ("Radiador Completo", "Radiador de aluminio", 450000, 320000, "Modine"),
                ("Bomba de Agua", "Bomba de agua centrífuga", 280000, 200000, "Airtex"),
                ("Termostato", "Termostato de temperatura", 85000, 60000, "Wahler"),
                ("Manguera Radiador", "Mangueras radiador reforzadas", 65000, 48000, "Dayco"),
                ("Ventilador Eléctrico", "Ventilador de refrigeración", 220000, 160000, "Spal"),
            ],
            "Accesorios": [
                ("Limpiaparabrisas", "Escobillas de goma para parabrisas", 22000, 16000, "Bosch"),
                ("Limpiaparabrisas Premium", "Escobillas de alta visibilidad", 35000, 25000, "Bosch"),
                ("Líquido Limpiaparabrisas", "Líquido concentrado limpiador", 18000, 12000, "Prestone"),
                ("Focos Halógenos H7", "Focos delanteros halógenos", 45000, 32000, "Philips"),
                ("Focos LED H7", "Focos delanteros LED", 85000, 60000, "Osram"),
                ("Luces Traseras", "Luces rojas traseras", 55000, 40000, "Hella"),
                ("Aros Rueda 15 pulgadas", "Aros de acero cromados", 180000, 130000, "Enkei"),
            ],
            "Suspensión": [
                ("Amortiguador Delantero", "Amortiguador de gas presurizado", 320000, 230000, "KYB"),
                ("Amortiguador Trasero", "Amortiguador trasero completo", 280000, 200000, "KYB"),
                ("Resorte Helicoidal", "Resorte de suspensión reforzado", 150000, 110000, "Eibach"),
                ("Barra Estabilizadora", "Barra anti-vuelco", 200000, 145000, "Lemforder"),
                ("Rótula Dirección", "Rótula de dirección completa", 165000, 120000, "Lemforder"),
                ("Buje de Suspensión", "Bujes de goma reforzados", 75000, 55000, "Moog"),
            ],
            "Transmisión": [
                ("Aceite Transmisión Automática", "Fluido ATF para automáticas", 68000, 50000, "Mobil"),
                ("Aceite Transmisión Manual", "Aceite mineral transmisión", 52000, 38000, "Castrol"),
                ("Filtro Transmisión", "Filtro de transmisión automática", 95000, 70000, "Mann"),
                ("Junta Transmisión", "Junta de transmisión completa", 240000, 175000, "Elring"),
                ("Embrague Completo", "Kit de embrague con disco y prensa", 580000, 420000, "Sachs"),
            ],
            "Combustible": [
                ("Bomba Gasolina", "Bomba eléctrica de combustible", 280000, 200000, "Airtex"),
                ("Inyectores Combustible", "Juego de 4 inyectores limpios", 450000, 320000, "Bosch"),
                ("Tanque Gasolina", "Tanque de combustible completo", 650000, 460000, "OEM"),
                ("Tubo Combustible", "Tubo reforzado de gasolina", 120000, 85000, "Gates"),
            ],
            "Direccion": [
                ("Fluido Dirección Hidráulica", "Fluido para dirección asistida", 55000, 40000, "Mobil"),
                ("Bomba Dirección Hidráulica", "Bomba completa de dirección", 580000, 415000, "Bosch"),
                ("Cilindro Dirección", "Cilindro de dirección", 420000, 300000, "TRW"),
                ("Barra Dirección", "Barra de dirección completa", 320000, 230000, "Lemforder"),
            ],
        }
        
        # Modelos de vehículos para autopartes
        modelos_vehiculos = [
            ("Toyota Corolla", 2020), ("Toyota Corolla", 2021), ("Toyota Corolla", 2022),
            ("Hyundai Accent", 2020), ("Hyundai Accent", 2021),
            ("Nissan Qashqai", 2019), ("Nissan Qashqai", 2020),
            ("Chevrolet Cruze", 2018), ("Chevrolet Cruze", 2019),
            ("Ford Focus", 2017), ("Ford Focus", 2018), ("Ford Focus", 2019),
            ("Mazda 3", 2019), ("Mazda 3", 2020), ("Mazda 3", 2021),
            ("Volkswagen Jetta", 2020), ("Volkswagen Jetta", 2021),
            ("Peugeot 308", 2021), ("Peugeot 308", 2022),
            ("BMW 320i", 2020), ("BMW 320i", 2021),
            ("Mercedes C200", 2019), ("Mercedes C200", 2020),
            ("Audi A3", 2020), ("Audi A3", 2021),
            ("Kia Forte", 2020), ("Kia Forte", 2021),
            ("Honda Civic", 2019), ("Honda Civic", 2020),
            ("Subaru Impreza", 2021), ("Subaru Impreza", 2022),
        ]
        
        total_insertados = 0
        
        # Crear productos generales
        for categoria, productos_lista in categorias_productos.items():
            for nombre, descripcion, precioVenta, precioCompra, marca in productos_lista:
                producto = Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precioVenta=precioVenta,
                    precioCompra=precioCompra,
                    marca=marca,
                    categoria=categoria,
                    stock=25,
                    stockMin=5,
                    tipo="producto"
                )
                session.add(producto)
                total_insertados += 1
                if total_insertados % 50 == 0:
                    session.flush()
        
        session.flush()
        
        # Crear autopartes para diferentes modelos
        contador_autopartes = 0
        categoria_index = 1  # Para variar las categorías
        
        for modelo, anio in modelos_vehiculos:
            # Crear autopartes con nombres únicos variando categorías
            for idx in range(3):  # 3 autopartes por modelo
                if contador_autopartes >= 120:  # Limitar a ~120 autopartes
                    break
                
                # Seleccionar categoría de forma rotativa
                cat_list = list(categorias_productos.items())
                categoria, productos_lista = cat_list[(categoria_index + idx) % len(cat_list)]
                nombre, descripcion, precioVenta, precioCompra, marca = productos_lista[idx % len(productos_lista)]
                
                precio_ajustado = int(precioVenta * (1 + (anio - 2017) * 0.05))
                precio_compra_ajustado = int(precioCompra * (1 + (anio - 2017) * 0.05))
                
                # Nombre único con timestamp
                nombre_unico = f"{nombre} {modelo} {anio}"
                
                autoparte = Autoparte(
                    nombre=nombre_unico,
                    descripcion=f"{descripcion} para {modelo} ({anio})",
                    precioVenta=precio_ajustado,
                    precioCompra=precio_compra_ajustado,
                    marca=marca,
                    categoria=categoria,
                    stock=max(2, 10 - (anio - 2017)),
                    stockMin=1,
                    modelo=modelo,
                    anio=anio,
                    tipo="autoparte"
                )
                session.add(autoparte)
                total_insertados += 1
                contador_autopartes += 1
                
                if total_insertados % 50 == 0:
                    session.flush()
            
            categoria_index += 3
        
        # Commit de todas las inserciones
        session.commit()
        
        print("\n" + "="*60)
        print("✅ DATOS DE PRODUCTOS INSERTADOS EXITOSAMENTE")
        print("="*60)
        print(f"📊 Total de productos insertados: {total_insertados}")
        print(f"  • Productos generales: {sum(len(p) for p in categorias_productos.values())}")
        print(f"  • Autopartes específicas: {contador_autopartes}")
        print("="*60)
        print(f"📦 Categorías cubiertas: {len(categorias_productos)}")
        print(f"🚗 Modelos de vehículos: {len(modelos_vehiculos)}")
        print("="*60 + "\n")
        
        return total_insertados
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Error al insertar datos: {str(e)}")
        return 0
    finally:
        session.close()


if __name__ == "__main__":
    print("\n🔧 Iniciando seed de productos...\n")
    cantidad = seed_productos()
    if cantidad > 0:
        print(f"\n✨ {cantidad} registros insertados correctamente.\n")
    else:
        print("\n⚠️  No se insertaron registros.\n")
