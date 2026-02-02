import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjsbtkvsyufhtlaepxxq.supabase.co'
const supabaseAnonKey = 'sb_publishable_reFD-S0w9X30Q1C3rs7pFg_gbt85Xwe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)