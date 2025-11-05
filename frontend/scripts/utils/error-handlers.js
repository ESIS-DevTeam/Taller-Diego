/** 
* @module utils/error-handlers
* @description Manejo de errores centralizados
*/

import { showNotification } from "./notification.js";

/**
 * 
 * @param {Error} error - error lanzado por la api o el sistema 
 */

export function handleApiError(error) {
  let typeNotification = "error";
  let message = "";
  console.error("Error capturado");
  if(error.detail) {
    showNotification(error.detail, typeNotification);
    return;
  }
  if (error.status) {
    switch (error.status) {
      case 400:
        message = "Solicitud invalida, intente de nuevo.";  
        break;
      case 401:
        message = "No autenticado, intente de nuevo.";  
        break;
      case 403:
        message = "No tiene permiso para relizar esta operacion.";  
        break;
      case 404:
        message = "No se encontro el recurso solicitado.";  
        typeNotification = "warning";
        break;
      case 409:
        message = "Ya existe un registro con esos datos.";  
        break;
      case 500:
        message = "Error interno del servidor, intente más tarde";  
        break;
      default:
        message = "Ocurrio un error inesperado, intente de nuevo";  
        break;
      }
  } else if(error.message?.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      message = "No se pudo completar la accion, compruebe su conexion a internet";
      typeNotification = "warning"
  } else {
      message = "Ocurrio un error desconocido, intente mas tarde.";
  }
  showNotification(message, typeNotification);
}