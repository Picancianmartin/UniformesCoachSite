import { createClient } from '@supabase/supabase-js'

// Agora os dados vêm do arquivo .env.local e não ficam expostos no código
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)