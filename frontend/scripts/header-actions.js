import { closeSesion, getValidToken } from './utils/store/manager-key.js';

// ========================================
// SESIÓN: renovación automática del token
// ========================================
// Al cargar cualquier página protegida se valida/renueva el token, y cada
// 5 minutos se revisa de nuevo para que nunca expire durante el uso.
if (localStorage.getItem('supabase_token')) {
  getValidToken();
  setInterval(() => getValidToken(), 5 * 60 * 1000);
}

// Delegación de eventos global para el botón de cerrar sesión
document.addEventListener('click', (event) => {
  const target = event.target;
  const pendingLink = target.closest('[data-pending-feature]');
  if (pendingLink) {
    event.preventDefault();
    window.alert('Este módulo está planificado para la siguiente fase del MVP.');
    return;
  }

  // Verifica si el click fue en el botón logout o sus hijos (imagen, etc.)
  if (target.matches('#logout-btn') || target.closest('#logout-btn')) {
    event.preventDefault();
    closeSesion();
  }
});
