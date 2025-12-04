from datetime import datetime, timedelta
from typing import Optional, Any, Dict
import json
import hashlib

class SimpleCache:
    """
    Caché en memoria simple con TTL (Time To Live) optimizado para alta performance
    """
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._hit_count = 0
        self._miss_count = 0
    
    def get(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del caché si existe y no ha expirado
        """
        if key not in self._cache:
            self._miss_count += 1
            return None
        
        entry = self._cache[key]
        if datetime.now() > entry['expires_at']:
            # Expiró, eliminar
            del self._cache[key]
            self._miss_count += 1
            return None
        
        self._hit_count += 1
        return entry['value']
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """
        Guarda un valor en el caché con un TTL (por defecto 5 minutos)
        """
        self._cache[key] = {
            'value': value,
            'expires_at': datetime.now() + timedelta(seconds=ttl_seconds)
        }
    
    def delete(self, key: str):
        """
        Elimina una entrada del caché
        """
        if key in self._cache:
            del self._cache[key]
    
    def clear(self):
        """
        Limpia todo el caché
        """
        self._cache.clear()
        self._hit_count = 0
        self._miss_count = 0
    
    def invalidate_pattern(self, pattern: str):
        """
        Invalida todas las claves que coincidan con un patrón
        Ejemplo: invalidate_pattern('productos') elimina todas las claves que contengan 'productos'
        """
        keys_to_delete = [key for key in self._cache.keys() if pattern in key]
        for key in keys_to_delete:
            del self._cache[key]
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del caché"""
        total = self._hit_count + self._miss_count
        hit_rate = (self._hit_count / total * 100) if total > 0 else 0
        return {
            "size": len(self._cache),
            "hits": self._hit_count,
            "misses": self._miss_count,
            "hit_rate": f"{hit_rate:.2f}%"
        }
    
    @staticmethod
    def generate_key(*args, **kwargs) -> str:
        """Generar clave de caché a partir de argumentos"""
        key_data = str(args) + str(sorted(kwargs.items()))
        return hashlib.md5(key_data.encode()).hexdigest()

# Instancia global del caché
cache = SimpleCache()
