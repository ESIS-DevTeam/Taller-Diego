/** 
* @module utils/error-handlers
* @description Manejo de errores centralizados
*/

import { showNotification } from "./notification.js";

/**
 * 
 * @param {Error} error - error lanzado por la api o el sistema 
 * @param {Object} context - Contexto adicional del error (endpoint, método, datos)
 * @throws {Error} Re-lanza el error después de manejarlo
 */

export function handleApiError(error, context = {}) {
  let typeNotification = "error";
  let message = "";
  const isGraveError = error.status >= 500 || error.message?.includes("Failed to fetch");
  
  console.error("Error capturado:", {
    error: error.message,
    status: error.status,
    endpoint: context.endpoint,
    method: context.method,
    timestamp: new Date().toISOString(),
  });

  if(isGraveError) {
    console.error("Stack trace:", error.stack);
    console.error("Detalles completos:", {
      error,
      context,
      userAgent: navigator.userAgent,
    });
  }
  if(error.detail) {
    showNotification(error.detail, typeNotification);
    throw error;
  }
  if (error.status) {
    switch (error.status) {
      case 200:
        message = "Proceso realizado.";
        typeNotification = "success";
        break;
      case 400:
        message = "Solicitud invalida, intente de nuevo.";
        console.info("Error leve: solicitud inválida");
        break;
      case 401:
        message = "No autenticado, intente de nuevo.";
        console.info("Error leve: no autenticado");
        break;
      case 403:
        message = "No tiene permiso para relizar esta operacion.";
        console.info("Error leve: sin permisos");
        break;
      case 404:
        message = "No se encontro el recurso solicitado.";
        typeNotification = "warning";
        console.info("Error leve: recurso no encontrado");
        break;
      case 409:
        message = "Ya existe un registro con esos datos.";
        console.info("Error leve: conflicto de datos");
        break;
      case 422:
        message = "Validacion incorrecto, intente de nuevo.";
        console.info("Error leve: validación fallida");
        break;
      case 500:
        message = "Error interno del servidor, intente más tarde";
        console.error("Error grave: fallo interno del servidor");
        break;
      default:
        message = "Ocurrio un error inesperado, intente de nuevo";  
        console.error("Error inesperado con status:", error.status);
        break;
      }
  } else if(error.message?.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      message = "No se pudo completar la accion, compruebe su conexion a internet";
      typeNotification = "warning";
      console.error("Error grave: fallo de red");
  } else {
      message = "Ocurrio un error desconocido, intente mas tarde.";
      console.error("Error desconocido:", error);
  }
  showNotification(message, typeNotification);
  throw error; 
}