import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Este "export" es lo que le falta a tu archivo para que Auth.tsx lo encuentre
export const supabase = createClient(supabaseUrl, supabaseAnonKey);