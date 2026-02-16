import { createClient } from '@supabase/supabase-js'

// Pegue esses dados no Painel do Supabase > Project Settings > API
// Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('A variável de ambiente VITE_SUPABASE_URL deve ser configurada no arquivo .env')
}
if (!supabaseKey) {
  throw new Error('A variável de ambiente VITE_SUPABASE_ANON_KEY deve ser configurada no arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)