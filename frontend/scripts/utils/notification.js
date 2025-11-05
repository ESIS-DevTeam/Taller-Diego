/**
 * Muestra una notificación flotante en pantalla.
 * @param {string} message - Texto del mensaje.
 * @param {"info"|"success"|"warning"|"error"} [type="info"] - Tipo de notificación.
 * @param {number} [duration=3000] - Duración en milisegundos.
 */
export function showNotification(message, type = "info", duration = 3000) {
  const idContainer = "notification-container";
  let container = document.getElementById(idContainer);

  if (!container) {
    container = docum|ent.createElement("div");
    container.id = idContainer;
    document.body.appendChild(container);
  }

  const noti = document.createElement("div");
  noti.className = `notification ${type}`;
  noti.innerHTML = `<p>${message}</p>`;
  container.appendChild(noti);

  setTimeout(() => noti.remove(), duration);
}