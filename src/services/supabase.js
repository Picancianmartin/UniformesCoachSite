import { createClient } from '@supabase/supabase-js'

// Pegue esses dados no Painel do Supabase > Project Settings > API
const supabaseUrl = 'https://khabhzzigvuyuljiruce.supabase.co' // ex: https://xyz.supabase.co
const supabaseKey = 'sb_publishable_ZAKthjkahy5f8SFEi8eybA_8g9phYeT'        // A chave pública (public/anon)

export const supabase = createClient(supabaseUrl, supabaseKey)