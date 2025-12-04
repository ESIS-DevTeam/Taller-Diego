import { SUPABASE } from "./data-store.js";

export async function obtainToken(email, password) {
  try{
    const { data, error } = await SUPABASE.auth.signInWithPassword ({
      email:email,
      password: password
    });
    if (error) {
      return null;
    }
    return data;
  } catch (error){
    return;
  }
}