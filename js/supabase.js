// ============================================
// Configuración de la conexión con Supabase
// Reemplaza estos valores por los de TU proyecto
// ============================================

const SUPABASE_URL = 'https://bukegtenfzhhqcnygrru.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RyaRGY7KnN4pw2GjwtfEKA_VISwNu-W';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);