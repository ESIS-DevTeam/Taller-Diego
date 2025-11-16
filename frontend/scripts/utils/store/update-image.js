import { handleApiError } from "../error-handlers.js";
import { SUPABASE } from "./data-store.js";

export async function uploadImage(inputId, name, bucket = 'product') {
  const input = document.getElementById(inputId);
  const file = input.files[0];
  
  const ext = file.name.split('.').pop();
  const fileName = `${name}.${ext}`;
  const {data,error } = await SUPABASE.storage
  .from(bucket)
  .upload(fileName, file, {upsert:true});
  if(error) {
    handleApiError(error);
    return;
  }
  const {data: urlData} = SUPABASE.storage
  .from(bucket)
  .getPublicUrl(fileName);
  
  const urlPublic = urlData.publicUrl;
  return urlPublic;
}

