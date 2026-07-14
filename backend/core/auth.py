from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx
import jwt

from core.config import settings

_bearer_scheme = HTTPBearer(auto_error=False)

# Cliente HTTP compartido: reutiliza la conexión TLS con Supabase
# (antes se creaba un cliente nuevo por request → handshake completo cada vez)
_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=5)
    return _http_client


def _validar_jwt_local(token: str) -> dict | None:
    """Valida el JWT de Supabase localmente con el secreto compartido.

    Evita el viaje HTTP a Supabase en cada request (~300-900 ms).
    Devuelve el payload si es válido, o None si no se puede validar
    localmente (p. ej. JWT_SECRET no configurado).
    """
    if not settings.JWT_SECRET:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )
        return payload
    except jwt.ExpiredSignatureError:
        # Expirado: rechazo directo (la firma sí era válida)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Supabase inválido o expirado",
        )
    except jwt.InvalidTokenError:
        # Firma/audiencia no verificable localmente (p. ej. JWT_SECRET
        # incorrecto o rotado): dejar que el respaldo HTTP decida.
        return None


async def require_supabase_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
):
    """Validate Supabase JWT and return the authenticated user profile."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Configuración de Supabase incompleta",
        )

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
        )

    # 1) Validación local (rápida, sin red)
    payload = _validar_jwt_local(credentials.credentials)
    if payload is not None:
        # Mismo formato básico que devuelve /auth/v1/user
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role"),
        }

    # 2) Respaldo: validar contra Supabase (JWT_SECRET no configurado)
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {credentials.credentials}",
    }
    user_endpoint = settings.SUPABASE_URL.rstrip("/") + "/auth/v1/user"

    try:
        response = await _get_http_client().get(user_endpoint, headers=headers)
    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No se pudo validar el token con Supabase: {error}",
        ) from error

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Supabase inválido o expirado",
        )

    return response.json()
