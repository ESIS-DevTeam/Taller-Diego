from fastapi import APIRouter
from schemas.auth_schema import LoginRequest, LoginResponse
from services.auth_service import AuthService

router = APIRouter(tags=["Autenticación"])

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Endpoint de inicio de sesión.
    
    Autentica al usuario contra Supabase Auth y devuelve siempre
    un código de estado 200 con un JSON indicando el resultado.
    
    Args:
        credentials: Credenciales del usuario (email y password)
        
    Returns:
        LoginResponse con:
        - success: True si las credenciales son válidas, False en caso contrario
        - message: Mensaje descriptivo del resultado
        - access_token: Token JWT si el login fue exitoso
        - user_email: Email del usuario autenticado
        
    Examples:
        Solicitud exitosa:
        ```json
        {
            "email": "usuario@example.com",
            "password": "miPassword123"
        }
        ```
        
        Respuesta exitosa:
        ```json
        {
            "success": true,
            "message": "Inicio de sesión exitoso",
            "access_token": "eyJhbGc...",
            "user_email": "usuario@example.com"
        }
        ```
        
        Respuesta con credenciales inválidas:
        ```json
        {
            "success": false,
            "message": "Credenciales inválidas. Por favor, verifica tu email y contraseña.",
            "access_token": null,
            "user_email": null
        }
        ```
    """
    auth_service = AuthService()
    return await auth_service.login(credentials.email, credentials.password)
