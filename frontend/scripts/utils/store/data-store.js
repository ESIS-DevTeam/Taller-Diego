import { createClient } from 'https://esm.sh/@supabase/supabase-js';
export const URL_STORE = "https://faxgvryumrbseucrcumv.supabase.co";
export const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheGd2cnl1bXJic2V1Y3JjdW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODg1NjYsImV4cCI6MjA3NTM2NDU2Nn0.AMvkvHRC0ri51haShSxooMT7DQ21-LuQZE2Z1VpSFwQ";


export const SUPABASE = createClient(URL_STORE,ANON_KEY);