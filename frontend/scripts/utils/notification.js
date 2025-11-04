export function showNotification(message, type = 'info') {
  // Crear contenedor si no existe
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Crear toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = getIconForType(type);
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Animar entrada
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-cerrar después de 3 segundos
  const timeout = setTimeout(() => removeToast(toast), 3000);

  // Cerrar manualmente
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    clearTimeout(timeout);
    removeToast(toast);
  });
}

function removeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 300);
}

function getIconForType(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

export function showSuccess(message) {
  showNotification(message, 'success');
}

export function showError(message) {
  showNotification(message, 'error');
}

export function showWarning(message) {
  showNotification(message, 'warning');
}

export function showInfo(message) {
  showNotification(message, 'info');
}