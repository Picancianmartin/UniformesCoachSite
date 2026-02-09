import { createClient } from '@supabase/supabase-js'

// Pegue esses dados no Painel do Supabase > Project Settings > API
const supabaseUrl = 'https://vpnctsilwzxpgooewvrg.supabase.co' // ex: https://xyz.supabase.co
const supabaseKey = 'sb_publishable_Tvqz2Zq39tUS5vPYwn5F9A_9j-6EEbI'        // A chave pública (public/anon)

export const supabase = createClient(supabaseUrl, supabaseKey)