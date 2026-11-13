import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://koxtouwolwkxxxnuivns.supabase.co'
const supabaseKey = 'sb_publishable_2yMmZ0QhAcgFwvEtGv8pMg_1WMrxl-i'

export const supabase = createClient(supabaseUrl, supabaseKey)