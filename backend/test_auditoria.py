"""
Script de prueba para el sistema de auditoría
Ejecutar: python test_auditoria.py
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"

def print_separator():
    print("\n" + "="*70 + "\n")

def test_crear_producto():
    """Prueba 1: Crear un producto y verificar auditoría"""
    print("🧪 PRUEBA 1: Crear producto")
    print_separator()
    
    producto = {
        "nombre": "Producto de Prueba Auditoría",
        "descripcion": "Producto para probar sistema de trazabilidad",
        "precio": 50000,
        "stock": 25,
        "codBarras": f"TEST{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    
    # Enviar header con usuario
    headers = {
        "Content-Type": "application/json",
        "X-Usuario": "Juan Pérez - Tester"
    }
    
    response = requests.post(
        f"{API_BASE}/productos/",
        json=producto,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        producto_id = data["id"]
        print(f"✅ Producto creado: ID={producto_id}, Nombre={data['nombre']}")
        return producto_id
    else:
        print(f"❌ Error al crear producto: {response.status_code}")
        print(response.text)
        return None

def test_actualizar_producto(producto_id):
    """Prueba 2: Actualizar un producto y verificar auditoría"""
    print("🧪 PRUEBA 2: Actualizar producto")
    print_separator()
    
    actualizacion = {
        "nombre": "Producto de Prueba Auditoría MODIFICADO",
        "descripcion": "Descripción actualizada",
        "precio": 75000,  # Precio modificado
        "stock": 30,      # Stock modificado
        "codBarras": f"TEST{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-Usuario": "María García - Admin"
    }
    
    response = requests.put(
        f"{API_BASE}/productos/{producto_id}",
        json=actualizacion,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Producto actualizado: Precio ${data['precio']}, Stock {data['stock']}")
    else:
        print(f"❌ Error al actualizar: {response.status_code}")
        print(response.text)

def test_ver_historial(producto_id):
    """Prueba 3: Ver historial de cambios del producto"""
    print("🧪 PRUEBA 3: Ver historial de cambios")
    print_separator()
    
    response = requests.get(f"{API_BASE}/productos/{producto_id}/historial")
    
    if response.status_code == 200:
        data = response.json()
        historial = data["historial"]
        
        print(f"📋 Historial del producto ID={producto_id}")
        print(f"Total de cambios registrados: {len(historial)}\n")
        
        for i, registro in enumerate(historial, 1):
            print(f"--- Cambio #{i} ---")
            print(f"Fecha: {registro['fecha']}")
            print(f"Usuario: {registro['usuario']}")
            print(f"Acción: {registro['accion']}")
            print(f"IP: {registro['ip_address']}")
            print(f"Descripción: {registro['descripcion']}")
            
            if registro.get('datos_anteriores'):
                print(f"Datos anteriores: {json.dumps(registro['datos_anteriores'], indent=2)}")
            if registro.get('datos_nuevos'):
                print(f"Datos nuevos: {json.dumps(registro['datos_nuevos'], indent=2)}")
            print()
    else:
        print(f"❌ Error al obtener historial: {response.status_code}")

def test_consultar_auditoria():
    """Prueba 4: Consultar auditoría con filtros"""
    print("🧪 PRUEBA 4: Consultar auditoría del módulo inventario")
    print_separator()
    
    response = requests.get(
        f"{API_BASE}/auditoria/",
        params={
            "modulo": "inventario",
            "tabla": "productos",
            "limit": 10
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"📊 Total de registros: {data.get('total', 0)}")
        print(f"Registros en esta página: {len(data.get('registros', []))}\n")
        
        for registro in data.get('registros', [])[:5]:
            print(f"• {registro['fecha']} - {registro['usuario']}")
            print(f"  {registro['accion']}: {registro['descripcion']}")
            print()
    else:
        print(f"❌ Error al consultar auditoría: {response.status_code}")

def test_eliminar_producto(producto_id):
    """Prueba 5: Eliminar producto y verificar auditoría"""
    print("🧪 PRUEBA 5: Eliminar producto")
    print_separator()
    
    headers = {
        "X-Usuario": "Pedro López - Admin"
    }
    
    response = requests.delete(
        f"{API_BASE}/productos/{producto_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✅ Producto eliminado correctamente")
        
        # Ver historial después de eliminar
        print("\n📋 Historial completo después de eliminar:")
        test_ver_historial(producto_id)
    else:
        print(f"❌ Error al eliminar: {response.status_code}")

def main():
    print("\n" + "🔍 SISTEMA DE TRAZABILIDAD - PRUEBAS".center(70, "="))
    print("\nAsegúrate de que el servidor esté corriendo en http://localhost:8000\n")
    
    try:
        # Verificar que el servidor esté corriendo
        response = requests.get(f"{API_BASE}/../")
        if response.status_code != 200:
            print("❌ El servidor no está respondiendo")
            return
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor. ¿Está corriendo?")
        return
    
    # Ejecutar pruebas
    producto_id = test_crear_producto()
    
    if producto_id:
        test_actualizar_producto(producto_id)
        test_ver_historial(producto_id)
        test_consultar_auditoria()
        test_eliminar_producto(producto_id)
    
    print_separator()
    print("✅ Pruebas completadas")
    print("\n💡 Puedes ver más detalles en:")
    print(f"   - Historial completo: GET {API_BASE}/auditoria/")
    print(f"   - Por usuario: GET {API_BASE}/auditoria/usuario/Juan%20Pérez")
    print(f"   - Por módulo: GET {API_BASE}/auditoria/modulo/inventario")
    print()

if __name__ == "__main__":
    main()
