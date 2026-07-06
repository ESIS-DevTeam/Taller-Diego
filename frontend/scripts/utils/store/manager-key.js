const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api/v1'  // Desarrollo local
  : '/api/v1';

// Margen de seguridad: renovar si faltan menos de 2 minutos para expirar
const MARGEN_EXPIRACION_MS = 2 * 60 * 1000;

// Evita múltiples refresh simultáneos (todas las llamadas esperan el mismo)
let refreshEnCurso = null;

/**
 * Autentica un usuario usando el endpoint del backend y guarda la sesión
 * completa (access token + refresh token) en localStorage.
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object|null} Datos de autenticación o null si falla
 */
export async function obtainToken(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // El backend siempre responde 200, verificamos el campo success
    if (!data.success) {
      return null;
    }

    guardarSesion(data);

    // Formateamos la respuesta para que sea compatible con el código existente
    return {
      session: {
        access_token: data.access_token
      },
      user: {
        email: data.user_email
      }
    };
  } catch (error) {
    return null;
  }
}

/**
 * Guarda access token, refresh token y momento de expiración.
 */
function guardarSesion(data) {
  localStorage.setItem('supabase_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('supabase_refresh_token', data.refresh_token);
  }
  const expiraEn = (data.expires_in || 3600) * 1000;
  localStorage.setItem('supabase_token_expira', String(Date.now() + expiraEn));
}

/**
 * Indica si el access token actual está vencido o por vencer.
 */
export function tokenPorExpirar() {
  const expira = parseInt(localStorage.getItem('supabase_token_expira'), 10);
  // Sesiones antiguas sin fecha de expiración: tratarlas como por expirar
  if (!expira || isNaN(expira)) return true;
  return Date.now() >= expira - MARGEN_EXPIRACION_MS;
}

/**
 * Renueva la sesión con el refresh token. Si falla (refresh vencido o
 * revocado), cierra la sesión y redirige a login.
 * @returns {Promise<boolean>} true si la sesión quedó renovada
 */
export async function refreshSesion() {
  const refreshToken = localStorage.getItem('supabase_refresh_token');
  if (!refreshToken) return false;

  // Reutilizar el refresh en curso si varias peticiones llegan a la vez
  if (refreshEnCurso) return refreshEnCurso;

  refreshEnCurso = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await response.json();
      if (!data.success) return false;
      guardarSesion(data);
      return true;
    } catch (error) {
      return false;
    } finally {
      refreshEnCurso = null;
    }
  })();

  return refreshEnCurso;
}

/**
 * Devuelve un access token válido, renovándolo primero si está por
 * expirar. Si no se puede renovar, cierra la sesión (redirige a login).
 * @returns {Promise<string|null>}
 */
export async function getValidToken() {
  const token = localStorage.getItem('supabase_token');
  if (!token) return null;

  if (tokenPorExpirar()) {
    const renovado = await refreshSesion();
    if (!renovado) {
      // Sin refresh token (sesión antigua) el token actual puede seguir
      // siendo válido: solo cerrar sesión si de verdad ya expiró.
      const expira = parseInt(localStorage.getItem('supabase_token_expira'), 10);
      if (expira && Date.now() >= expira) {
        closeSesion();
        return null;
      }
      return token;
    }
  }

  return localStorage.getItem('supabase_token');
}

export async function closeSesion() {
  localStorage.removeItem('supabase_token');
  localStorage.removeItem('supabase_refresh_token');
  localStorage.removeItem('supabase_token_expira');
  window.location.replace('login.html');
}
