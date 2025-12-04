"""
Utilidades para la auditoría
"""
from fastapi import Request
from typing import Optional

def obtener_ip_cliente(request: Request) -> str:
    """
    Extraer la dirección IP del cliente desde el request
    
    Considera:
    - X-Forwarded-For (si está detrás de un proxy/load balancer)
    - X-Real-IP
    - client.host (conexión directa)
    """
    # Intentar obtener IP real si está detrás de proxy
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        # X-Forwarded-For puede contener múltiples IPs, tomar la primera
        return x_forwarded_for.split(",")[0].strip()
    
    # Intentar X-Real-IP
    x_real_ip = request.headers.get("X-Real-IP")
    if x_real_ip:
        return x_real_ip.strip()
    
    # Fallback a la conexión directa
    if request.client:
        return request.client.host
    
    return "Desconocida"

def obtener_usuario_actual(request: Request) -> str:
    """
    Obtener el usuario actual desde el request
    
    Por ahora retorna un valor por defecto, pero puedes integrarlo con:
    - JWT tokens
    - Sessions
    - Headers personalizados
    """
    # Intentar obtener desde un header personalizado
    usuario = request.headers.get("X-Usuario")
    if usuario:
        return usuario
    
    # Si tienes autenticación JWT, extraer de ahí
    # auth_header = request.headers.get("Authorization")
    # if auth_header and auth_header.startswith("Bearer "):
    #     token = auth_header[7:]
    #     # Decodificar JWT y extraer usuario
    #     pass
    
    # Por defecto
    return "Sistema"

class AuditoriaHelper:
    """Helper class para facilitar el registro de auditoría"""
    
    @staticmethod
    def preparar_contexto(request: Request) -> dict:
        """
        Preparar el contexto de auditoría desde un request
        
        Returns:
            dict con usuario e ip_address
        """
        return {
            "usuario": obtener_usuario_actual(request),
            "ip_address": obtener_ip_cliente(request)
        }
    
    @staticmethod
    def formatear_cambios(datos_anteriores: dict, datos_nuevos: dict) -> list:
        """
        Formatear los cambios entre dos versiones de datos
        
        Returns:
            Lista de strings describiendo cada cambio
        """
        cambios = []
        
        # Detectar campos modificados
        for key in datos_nuevos.keys():
            if key in datos_anteriores:
                valor_anterior = datos_anteriores[key]
                valor_nuevo = datos_nuevos[key]
                
                if valor_anterior != valor_nuevo:
                    cambios.append(f"{key}: {valor_anterior} → {valor_nuevo}")
        
        # Detectar campos nuevos
        for key in datos_nuevos.keys():
            if key not in datos_anteriores:
                cambios.append(f"{key}: [nuevo] {datos_nuevos[key]}")
        
        # Detectar campos eliminados
        for key in datos_anteriores.keys():
            if key not in datos_nuevos:
                cambios.append(f"{key}: {datos_anteriores[key]} [eliminado]")
        
        return cambios
