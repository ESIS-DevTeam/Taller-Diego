import { fetchFromApi } from "../../data-manager.js";
import { handleApiError } from "../error-handlers.js";
import { showNotification } from "../notification.js";
import { SUPABASE } from "./data-store.js";


/**
 * Sube una imagen a Supabase Storage.
 * @param {File} file - Archivo de imagen a subir
 * @param {string|number} idObject - ID usado para nombrar el archivo
 * @param {string} bucket - Nombre del bucket (por defecto 'productos')
 * @returns {Promise<string>} Nombre del archivo subido (ej: "123.jpg")
 */
export async function uploadImage(file, idObject, bucket = 'productos') {
  if(!file){
    showNotification("No se proporcionó ningun archivo", "info");
  }
  const ext = (file.name.split('.').pop() || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const fileName = `${idObject}.${ext}`;

  const { data, error } = await SUPABASE.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (error) {
    handleApiError(error);
    throw error;
  }

  return fileName;
}


/**
 * Actualiza la imagen de un producto existente.
 * @param {string|number} idObject - ID del producto
 * @param {File} file - Nueva imagen
 * @param {string} bucket - Bucket de Supabase
 * @param {string} endpoint - Endpoint de la API (ej: 'productos')
 * @returns {Promise<string>} Nombre del archivo actualizado
 */
export async function updateImage(idObject, file, bucket = 'productos', endpoint) {
  if (!file) {
    showNotification('No se proporcionó ningún archivo para actualizar',"info");
  }
  const data = await fetchFromApi(endpoint,idObject);

  if(data.img){
    await deleteImage(data.img,bucket);
  }

  

  const ext = (file.name.split('.').pop() || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const fileName = `${idObject}.${ext}`;

  
  const { error } = await SUPABASE.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (error) {
    handleApiError(error);
    throw error;
  }

  return fileName;
}

/**
 * Elimina una imagen de Supabase Storage.
 * @param {string} fileName - Nombre del archivo a eliminar (ej: "123.jpg")
 * @param {string} bucket - Bucket de Supabase
 */
export async function deleteImage(fileName, bucket='productos'){
  if (!fileName) return;
  const {error} = await SUPABASE.storage
  .from(bucket)
  .remove([fileName])
  if(error){
    handleApiError(error);
  }
}

/**
 * Obtiene la URL pública de una imagen.
 * @param {string} fileName - Nombre del archivo (ej: "123.jpg")
 * @param {string} bucket - Bucket de Supabase
 * @returns {string} URL pública de la imagen
 */
export function fetchFromImagen(fileName, bucket = 'productos') {
  if(!fileName){
    return;
  }
  const { data } = SUPABASE.storage.from(bucket).getPublicUrl(fileName);
  return data?.publicUrl || '';
}
