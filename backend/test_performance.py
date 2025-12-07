"""
Script de pruebas de rendimiento
Objetivo: Verificar que todas las operaciones respondan en < 1 segundo
"""

import requests
import time
import statistics
from typing import List, Dict
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"

class PerformanceTest:
    def __init__(self):
        self.results = []
        self.failed_tests = []
    
    def measure_time(self, name: str, func, *args, **kwargs) -> float:
        """Mide el tiempo de ejecución de una función"""
        start = time.time()
        try:
            response = func(*args, **kwargs)
            elapsed = time.time() - start
            
            success = response.status_code in [200, 201]
            self.results.append({
                "test": name,
                "time": elapsed,
                "success": success,
                "status": response.status_code
            })
            
            status = "✅" if elapsed < 1.0 and success else "❌"
            print(f"{status} {name}: {elapsed:.3f}s (status: {response.status_code})")
            
            if elapsed >= 1.0 or not success:
                self.failed_tests.append({
                    "test": name,
                    "time": elapsed,
                    "status": response.status_code
                })
            
            return elapsed
        except Exception as e:
            print(f"❌ {name}: ERROR - {str(e)}")
            self.failed_tests.append({"test": name, "error": str(e)})
            return -1
    
    def run_test(self, name: str, method: str, endpoint: str, **kwargs):
        """Ejecuta una prueba HTTP"""
        url = f"{API_BASE}{endpoint}"
        func = getattr(requests, method.lower())
        return self.measure_time(name, func, url, **kwargs)
    
    def print_summary(self):
        """Imprime resumen de resultados"""
        print("\n" + "="*70)
        print("📊 RESUMEN DE PRUEBAS DE RENDIMIENTO")
        print("="*70)
        
        if not self.results:
            print("No hay resultados")
            return
        
        times = [r["time"] for r in self.results if r["time"] > 0]
        
        print(f"\nTotal de pruebas: {len(self.results)}")
        print(f"Exitosas: {len([r for r in self.results if r['success']])}")
        print(f"Fallidas: {len(self.failed_tests)}")
        
        if times:
            print(f"\n⏱️  Estadísticas de Tiempo:")
            print(f"  Mínimo: {min(times):.3f}s")
            print(f"  Máximo: {max(times):.3f}s")
            print(f"  Promedio: {statistics.mean(times):.3f}s")
            print(f"  Mediana: {statistics.median(times):.3f}s")
        
        # Pruebas que exceden 1 segundo
        slow_tests = [r for r in self.results if r["time"] >= 1.0]
        if slow_tests:
            print(f"\n⚠️  Pruebas lentas (>= 1s): {len(slow_tests)}")
            for test in slow_tests:
                print(f"  - {test['test']}: {test['time']:.3f}s")
        
        # Pruebas fallidas
        if self.failed_tests:
            print(f"\n❌ Pruebas fallidas:")
            for test in self.failed_tests:
                if "error" in test:
                    print(f"  - {test['test']}: {test['error']}")
                else:
                    print(f"  - {test['test']}: {test['time']:.3f}s (status: {test.get('status', 'N/A')})")
        
        # Resultado final
        print("\n" + "="*70)
        if not self.failed_tests and all(r["time"] < 1.0 for r in self.results if r["time"] > 0):
            print("✅ TODAS LAS PRUEBAS PASARON - Sistema responde en < 1 segundo")
        else:
            print("❌ ALGUNAS PRUEBAS FALLARON - Revisar optimizaciones")
        print("="*70 + "\n")


def main():
    print("\n🚀 PRUEBAS DE RENDIMIENTO - Sistema Taller Diego")
    print("Objetivo: Todas las operaciones deben responder en < 1 segundo\n")
    
    tester = PerformanceTest()
    
    # 1. Pruebas de Productos
    print("📦 PRUEBAS DE PRODUCTOS")
    print("-" * 70)
    
    tester.run_test(
        "GET /productos/ (lista completa)",
        "GET",
        "/productos/"
    )
    
    tester.run_test(
        "GET /productos/1 (por ID)",
        "GET",
        "/productos/1"
    )
    
    tester.run_test(
        "GET /productos/barcode/AUDIT999 (por código de barras)",
        "GET",
        "/productos/barcode/AUDIT999"
    )
    
    # 2. Pruebas de Auditoría
    print("\n📋 PRUEBAS DE AUDITORÍA")
    print("-" * 70)
    
    tester.run_test(
        "GET /auditoria/ (sin filtros, limit 100)",
        "GET",
        "/auditoria/?limit=100"
    )
    
    tester.run_test(
        "GET /auditoria/ (con filtro de módulo)",
        "GET",
        "/auditoria/?modulo=inventario&limit=100"
    )
    
    tester.run_test(
        "GET /auditoria/ (con múltiples filtros)",
        "GET",
        "/auditoria/?modulo=inventario&accion=CREATE&limit=50"
    )
    
    tester.run_test(
        "GET /productos/5/historial (historial de un producto)",
        "GET",
        "/productos/5/historial"
    )
    
    # 3. Pruebas de Servicios
    print("\n🔧 PRUEBAS DE SERVICIOS")
    print("-" * 70)
    
    tester.run_test(
        "GET /servicios/ (lista completa)",
        "GET",
        "/servicios/"
    )
    
    # 4. Pruebas de Ventas
    print("\n💰 PRUEBAS DE VENTAS")
    print("-" * 70)
    
    tester.run_test(
        "GET /ventas/ (lista completa)",
        "GET",
        "/ventas/"
    )
    
    # 5. Pruebas de Caché (segunda llamada debería ser más rápida)
    print("\n💾 PRUEBAS DE CACHÉ (segunda llamada)")
    print("-" * 70)
    
    time1 = tester.run_test(
        "GET /productos/ (primera llamada - sin caché)",
        "GET",
        "/productos/"
    )
    
    time.sleep(0.1)  # Pequeña pausa
    
    time2 = tester.run_test(
        "GET /productos/ (segunda llamada - con caché)",
        "GET",
        "/productos/"
    )
    
    if time1 > 0 and time2 > 0:
        improvement = ((time1 - time2) / time1) * 100
        print(f"   Mejora con caché: {improvement:.1f}% ({time1:.3f}s → {time2:.3f}s)")
    
    # 6. Pruebas de Escritura
    print("\n✏️  PRUEBAS DE ESCRITURA")
    print("-" * 70)
    
    # Crear producto
    nuevo_producto = {
        "nombre": f"Producto Test Rendimiento {datetime.now().strftime('%Y%m%d%H%M%S')}",
        "descripcion": "Producto de prueba de rendimiento",
        "precioCompra": 10000,
        "precioVenta": 15000,
        "marca": "Test",
        "categoria": "Pruebas",
        "stock": 100,
        "stockMin": 10,
        "codBarras": f"PERF{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    
    response = requests.post(
        f"{API_BASE}/productos/",
        json=nuevo_producto,
        headers={"X-Usuario": "Test Performance"}
    )
    
    if response.status_code == 200:
        producto_id = response.json()["id"]
        print(f"✅ Producto creado: ID={producto_id}")
        
        # Actualizar producto
        tester.run_test(
            "PUT /productos/{id} (actualización)",
            "PUT",
            f"/productos/{producto_id}",
            json={**nuevo_producto, "stock": 95},
            headers={"X-Usuario": "Test Performance"}
        )
        
        # Ver historial
        tester.run_test(
            f"GET /productos/{producto_id}/historial (después de UPDATE)",
            "GET",
            f"/productos/{producto_id}/historial"
        )
    else:
        print(f"❌ No se pudo crear producto de prueba: {response.status_code}")
    
    # 7. Pruebas de Carga (múltiples requests seguidos)
    print("\n⚡ PRUEBAS DE CARGA (10 requests consecutivos)")
    print("-" * 70)
    
    times = []
    for i in range(10):
        start = time.time()
        response = requests.get(f"{API_BASE}/productos/")
        elapsed = time.time() - start
        times.append(elapsed)
        
        status = "✅" if elapsed < 1.0 else "❌"
        print(f"{status} Request {i+1}/10: {elapsed:.3f}s")
    
    print(f"\n   Promedio: {statistics.mean(times):.3f}s")
    print(f"   Mínimo: {min(times):.3f}s")
    print(f"   Máximo: {max(times):.3f}s")
    
    # Resumen final
    tester.print_summary()
    
    # Recomendaciones
    print("💡 RECOMENDACIONES:")
    print("-" * 70)
    
    avg_time = statistics.mean([r["time"] for r in tester.results if r["time"] > 0])
    
    if avg_time < 0.5:
        print("✅ Excelente rendimiento - Sistema muy optimizado")
    elif avg_time < 1.0:
        print("✅ Buen rendimiento - Cumple el objetivo de < 1 segundo")
    else:
        print("⚠️  Rendimiento mejorable - Considerar:")
        print("   - Verificar índices en base de datos")
        print("   - Aumentar TTL del caché")
        print("   - Revisar latencia de red a Supabase")
        print("   - Implementar Redis para producción")
        print("   - Optimizar queries complejas")
    
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Pruebas interrumpidas por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error durante las pruebas: {str(e)}")
