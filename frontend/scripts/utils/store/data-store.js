import { createClient } from 'https://esm.sh/@supabase/supabase-js';
export const URL_STORE = "https://ybtvelrvaqlrbwcxuyqz.supabase.co";
export const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidHZlbHJ2YXFscmJ3Y3h1eXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjE3NTMsImV4cCI6MjA3NzIzNzc1M30.5sEFdKQcIJqVpnjjV18W-hlIhJ5Y95WztW4Z1AEm7yA";


export const SUPABASE = createClient(URL_STORE, ANON_KEY);